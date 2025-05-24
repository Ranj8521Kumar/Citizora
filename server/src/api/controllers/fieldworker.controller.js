/**
 * Field Worker Controller
 * Handles field worker specific operations including image uploads
 */

const Report = require('../models/report.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const { ApiError } = require('../middleware/error.middleware');
const { uploadFieldWorkerImages } = require('../services/upload.service');

/**
 * Upload progress images for field work
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadProgressImages = async (req, res, next) => {
  try {
    // Check if user is a field worker (employee)
    if (req.user.role !== 'employee') {
      return next(new ApiError('Access denied. Only field workers can upload progress images', 403));
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return next(new ApiError('No images uploaded', 400));
    }

    const { reportId, location, description } = req.body;

    // If reportId is provided, verify the report exists and is assigned to this field worker
    if (reportId) {
      const report = await Report.findById(reportId);

      if (!report) {
        return next(new ApiError('Report not found', 404));
      }

      if (report.assignedTo && report.assignedTo.toString() !== req.user._id.toString()) {
        return next(new ApiError('You can only upload images for reports assigned to you', 403));
      }
    }

    // Prepare metadata for upload
    const metadata = {
      uploadType: 'progress',
      reportId: reportId || null,
      location: location ? JSON.parse(location) : null,
      description: description || 'Progress update'
    };

    // Upload images
    const uploadedImages = await uploadFieldWorkerImages(req.files, metadata);

    // If associated with a report, add images to the report
    if (reportId) {
      const report = await Report.findById(reportId);
      if (!report.images) {
        report.images = [];
      }

      // Add progress images to report
      uploadedImages.forEach(image => {
        report.images.push({
          url: image.url,
          caption: `Progress: ${image.description}`,
          uploadedAt: image.uploadedAt
        });
      });

      await report.save();

      // Add timeline event
      await report.addTimelineEvent(
        'in_progress',
        `Progress images uploaded: ${uploadedImages.length} image(s)`,
        req.user._id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Progress images uploaded successfully',
      data: {
        images: uploadedImages,
        count: uploadedImages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload completion images for field work
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadCompletionImages = async (req, res, next) => {
  try {
    // Check if user is a field worker (employee)
    if (req.user.role !== 'employee') {
      return next(new ApiError('Access denied. Only field workers can upload completion images', 403));
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return next(new ApiError('No images uploaded', 400));
    }

    const { reportId, location, description, markAsResolved } = req.body;

    // Verify the report exists and is assigned to this field worker
    if (!reportId) {
      return next(new ApiError('Report ID is required for completion images', 400));
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    if (report.assignedTo && report.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ApiError('You can only upload completion images for reports assigned to you', 403));
    }

    // Prepare metadata for upload
    const metadata = {
      uploadType: 'completion',
      reportId: reportId,
      location: location ? JSON.parse(location) : null,
      description: description || 'Work completed'
    };

    // Upload images
    const uploadedImages = await uploadFieldWorkerImages(req.files, metadata);

    // Add images to the report
    if (!report.images) {
      report.images = [];
    }

    // Add completion images to report
    uploadedImages.forEach(image => {
      report.images.push({
        url: image.url,
        caption: `Completion: ${image.description}`,
        uploadedAt: image.uploadedAt
      });
    });

    // Mark as resolved if requested
    if (markAsResolved === 'true') {
      report.status = 'resolved';
      await report.addTimelineEvent(
        'resolved',
        `Work completed with ${uploadedImages.length} completion image(s). ${description || ''}`,
        req.user._id
      );

      // Notify the report submitter
      await Notification.create({
        recipient: report.submittedBy,
        type: 'report_status',
        title: 'Report Resolved',
        message: `Your report "${report.title}" has been resolved by our field team.`,
        relatedTo: {
          model: 'Report',
          id: report._id
        }
      });
    } else {
      await report.addTimelineEvent(
        'in_progress',
        `Completion images uploaded: ${uploadedImages.length} image(s). ${description || ''}`,
        req.user._id
      );
    }

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Completion images uploaded successfully',
      data: {
        images: uploadedImages,
        count: uploadedImages.length,
        reportStatus: report.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload general field work images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadFieldWorkImages = async (req, res, next) => {
  try {
    // Check if user is a field worker (employee)
    if (req.user.role !== 'employee') {
      return next(new ApiError('Access denied. Only field workers can upload field work images', 403));
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return next(new ApiError('No images uploaded', 400));
    }

    const { location, description, category } = req.body;

    // Prepare metadata for upload
    const metadata = {
      uploadType: 'fieldwork',
      location: location ? JSON.parse(location) : null,
      description: description || 'Field work documentation',
      category: category || 'general'
    };

    // Upload images
    const uploadedImages = await uploadFieldWorkerImages(req.files, metadata);

    res.status(201).json({
      success: true,
      message: 'Field work images uploaded successfully',
      data: {
        images: uploadedImages,
        count: uploadedImages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get field worker's uploaded images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getFieldWorkerImages = async (req, res, next) => {
  try {
    // Check if user is a field worker (employee)
    if (req.user.role !== 'employee') {
      return next(new ApiError('Access denied. Only field workers can access this endpoint', 403));
    }

    const { reportId, uploadType, limit = 50, page = 1 } = req.query;
    let allImages = [];

    // Get images from assigned reports
    let reportQuery = {
      assignedTo: req.user._id,
      'images.0': { $exists: true } // Reports that have at least one image
    };

    if (reportId) {
      reportQuery._id = reportId;
    }

    const reports = await Report.find(reportQuery)
      .select('title category status images createdAt')
      .populate('submittedBy', 'firstName lastName')
      .sort('-createdAt');

    // Extract images from reports
    reports.forEach(report => {
      if (report.images && report.images.length > 0) {
        report.images.forEach(image => {
          if (!uploadType || image.caption.toLowerCase().includes(uploadType.toLowerCase())) {
            allImages.push({
              ...image.toObject(),
              reportId: report._id,
              reportTitle: report.title,
              reportCategory: report.category,
              reportStatus: report.status,
              source: 'report'
            });
          }
        });
      }
    });

    // Also get images from reports where field worker uploaded images (even if not assigned)
    // This covers cases where field worker uploaded images to reports they're working on
    const reportsWithFieldWorkerImages = await Report.find({
      'images.0': { $exists: true },
      $or: [
        { assignedTo: req.user._id },
        { 'timeline.updatedBy': req.user._id }
      ]
    })
    .select('title category status images timeline createdAt')
    .populate('submittedBy', 'firstName lastName')
    .sort('-createdAt');

    // Add images from these reports (avoid duplicates)
    const existingImageUrls = new Set(allImages.map(img => img.url));

    reportsWithFieldWorkerImages.forEach(report => {
      if (report.images && report.images.length > 0) {
        report.images.forEach(image => {
          if (!existingImageUrls.has(image.url) &&
              (!uploadType || image.caption.toLowerCase().includes(uploadType.toLowerCase()))) {
            allImages.push({
              ...image.toObject(),
              reportId: report._id,
              reportTitle: report.title,
              reportCategory: report.category,
              reportStatus: report.status,
              source: 'fieldwork'
            });
            existingImageUrls.add(image.url);
          }
        });
      }
    });

    // Sort all images by upload date (newest first)
    allImages.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedImages = allImages.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedImages.length,
      total: allImages.length,
      data: {
        images: paginatedImages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allImages.length,
          pages: Math.ceil(allImages.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
