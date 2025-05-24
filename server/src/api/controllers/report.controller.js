/**
 * Report Controller
 * Handles CRUD operations for reports
 */

const Report = require('../models/report.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const { ApiError } = require('../middleware/error.middleware');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../services/upload.service');

/**
 * Create a new report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createReport = async (req, res, next) => {
  try {
    // Log the request body for debugging
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Extract data from request body
    const { title, description, category, priority, location } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: {
          title: title ? undefined : 'Report title is required',
          description: description ? undefined : 'Report description is required',
          category: category ? undefined : 'Report category is required'
        }
      });
    }

    // Validate location data
    if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location data',
        errors: {
          'location.coordinates': 'Coordinates must be an array with [longitude, latitude]'
        }
      });
    }

    // Prepare report data with proper structure
    const reportData = {
      title,
      description,
      category,
      priority: priority || 'medium',
      submittedBy: req.user._id,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || {}
      },
      timeline: [{
        status: 'submitted',
        comment: 'Report submitted',
        updatedBy: req.user._id
      }]
    };

    console.log('Report data to be saved:', JSON.stringify(reportData, null, 2));

    // Create new report
    const report = await Report.create(reportData);

    // Notify admins about new report
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await Notification.createNotification({
        recipient: admin._id,
        type: 'report_status',
        title: 'New Report Submitted',
        message: `A new ${category} report has been submitted: ${title}`,
        relatedTo: {
          model: 'Report',
          id: report._id
        },
        priority: priority === 'critical' ? 'high' : 'normal'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    // Provide more specific error messages for validation errors
    if (error.name === 'ValidationError') {
      const errors = {};

      // Extract validation error messages
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next(error);
  }
};

/**
 * Upload images for a report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadReportImages = async (req, res, next) => {
  try {
    const reportId = req.params.id;

    // Check if report exists
    const report = await Report.findById(reportId);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Check if user has permission to upload images
    if (req.user.role === 'user' && report.submittedBy.toString() !== req.user._id.toString()) {
      return next(new ApiError('You can only upload images to your own reports', 403));
    }

    if (req.user.role === 'employee' &&
        report.assignedTo &&
        report.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ApiError('You can only upload images to reports assigned to you', 403));
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return next(new ApiError('No images uploaded', 400));
    }

    const uploadedImages = [];

    // Upload each image to Cloudinary
    for (const file of req.files) {
      const downloadURL = await uploadToCloudinary(
        file.buffer,
        file.originalname,
        'report'
      );

      // Add image to report
      uploadedImages.push({
        url: downloadURL,
        caption: req.body.caption || '',
        uploadedAt: new Date()
      });
    }

    // Update report with new images
    if (!report.images) {
      report.images = [];
    }

    report.images.push(...uploadedImages);
    await report.save();

    // Add timeline event
    await report.addTimelineEvent(
      report.status,
      `${uploadedImages.length} image(s) uploaded`,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: {
        images: uploadedImages,
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports with filtering, sorting, and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getReports = async (req, res, next) => {
  try {
    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Filter by user role
    if (req.user.role === 'user') {
      // Users can only see their own reports
      query.submittedBy = req.user._id;
    } else if (req.user.role === 'employee') {
      // Employees can see reports assigned to them or unassigned
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null, status: { $in: ['submitted', 'in_review'] } }
      ];
    }
    // Admins can see all reports (no additional filter)

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query with pagination and sorting
    const reports = await Report.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('timeline.updatedBy', 'firstName lastName');

    // Get total count for pagination
    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit
      },
      data: {
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('timeline.updatedBy', 'firstName lastName');

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Check if user has permission to view this report
    if (req.user.role === 'user' && report.submittedBy._id.toString() !== req.user._id.toString()) {
      return next(new ApiError('You do not have permission to view this report', 403));
    }

    if (req.user.role === 'employee' &&
        report.assignedTo &&
        report.assignedTo._id.toString() !== req.user._id.toString()) {
      return next(new ApiError('You do not have permission to view this report', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update report status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Check permissions based on role and status
    if (req.user.role === 'user') {
      // Users can only provide feedback on resolved reports
      if (status !== 'closed' || report.status !== 'resolved') {
        return next(new ApiError('You do not have permission to update this report status', 403));
      }
    } else if (req.user.role === 'employee') {
      // Employees can only update reports assigned to them
      if (report.assignedTo && report.assignedTo.toString() !== req.user._id.toString()) {
        return next(new ApiError('You do not have permission to update this report', 403));
      }

      // Employees can only change status to in_progress or resolved
      if (!['in_progress', 'resolved'].includes(status)) {
        return next(new ApiError('You can only update status to in_progress or resolved', 400));
      }
    }
    // Admins can update any report status

    // Add timeline event
    await report.addTimelineEvent(status, comment, req.user._id);

    // Notify the report submitter
    await Notification.createNotification({
      recipient: report.submittedBy,
      type: 'report_status',
      title: 'Report Status Updated',
      message: `Your report "${report.title}" has been updated to ${status.replace('_', ' ')}`,
      relatedTo: {
        model: 'Report',
        id: report._id
      }
    });

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign report to employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.assignReport = async (req, res, next) => {
  try {
    const { employeeId, comment } = req.body;

    // Only admins can assign reports
    if (req.user.role !== 'admin') {
      return next(new ApiError('You do not have permission to assign reports', 403));
    }

    // Check if employee exists and is an employee
    const employee = await User.findById(employeeId);

    if (!employee || employee.role !== 'employee') {
      return next(new ApiError('Invalid employee ID', 400));
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Update report
    report.assignedTo = employeeId;
    report.status = 'assigned';

    // Add timeline event
    await report.addTimelineEvent('assigned', comment || 'Report assigned to employee', req.user._id);

    // Notify the employee
    await Notification.createNotification({
      recipient: employeeId,
      type: 'assignment',
      title: 'New Report Assigned',
      message: `You have been assigned to report: ${report.title}`,
      relatedTo: {
        model: 'Report',
        id: report._id
      },
      priority: report.priority === 'critical' ? 'high' : 'normal'
    });

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add feedback to a resolved report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.addFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Only the report submitter can add feedback
    if (report.submittedBy.toString() !== req.user._id.toString()) {
      return next(new ApiError('You can only provide feedback for your own reports', 403));
    }

    // Can only add feedback to resolved reports
    if (report.status !== 'resolved') {
      return next(new ApiError('You can only provide feedback for resolved reports', 400));
    }

    // Add feedback
    report.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    // Update status to closed
    await report.addTimelineEvent('closed', 'Feedback provided and report closed', req.user._id);

    // Notify assigned employee if any
    if (report.assignedTo) {
      await Notification.createNotification({
        recipient: report.assignedTo,
        type: 'feedback',
        title: 'Feedback Received',
        message: `Feedback received for report: ${report.title}`,
        relatedTo: {
          model: 'Report',
          id: report._id
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};
