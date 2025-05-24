/**
 * Field Worker Routes
 * Defines routes for field worker specific operations
 */

const express = require('express');
const fieldWorkerController = require('../controllers/fieldworker.controller');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');
const { upload } = require('../services/upload.service');

const router = express.Router();

// All routes require authentication and employee role
router.use(authMiddleware);
router.use(restrictTo('employee'));

/**
 * @route POST /api/fieldworker/images/progress
 * @desc Upload progress images for field work
 * @access Private (field workers/employees only)
 * @body {String} reportId - Optional report ID to associate images with
 * @body {String} location - Optional location data as JSON string
 * @body {String} description - Optional description of the progress
 * @files images - Array of image files (max 10)
 */
router.post('/images/progress', upload.array('images', 10), fieldWorkerController.uploadProgressImages);

/**
 * @route POST /api/fieldworker/images/completion
 * @desc Upload completion images for field work
 * @access Private (field workers/employees only)
 * @body {String} reportId - Required report ID to associate images with
 * @body {String} location - Optional location data as JSON string
 * @body {String} description - Optional description of the completion
 * @body {String} markAsResolved - Optional flag to mark report as resolved ('true'/'false')
 * @files images - Array of image files (max 10)
 */
router.post('/images/completion', upload.array('images', 10), fieldWorkerController.uploadCompletionImages);

/**
 * @route POST /api/fieldworker/images/general
 * @desc Upload general field work images
 * @access Private (field workers/employees only)
 * @body {String} location - Optional location data as JSON string
 * @body {String} description - Optional description of the field work
 * @body {String} category - Optional category for the field work
 * @files images - Array of image files (max 10)
 */
router.post('/images/general', upload.array('images', 10), fieldWorkerController.uploadFieldWorkImages);

/**
 * @route GET /api/fieldworker/images
 * @desc Get field worker's uploaded images
 * @access Private (field workers/employees only)
 * @query {String} reportId - Optional filter by report ID
 * @query {String} uploadType - Optional filter by upload type (progress, completion, general)
 * @query {Number} limit - Optional limit for pagination (default: 50)
 * @query {Number} page - Optional page number for pagination (default: 1)
 */
router.get('/images', fieldWorkerController.getFieldWorkerImages);

/**
 * @route GET /api/fieldworker/debug
 * @desc Debug endpoint to check field worker data
 * @access Private (field workers/employees only)
 */
router.get('/debug', async (req, res, next) => {
  try {
    const Report = require('../models/report.model');

    // Get all reports
    const allReports = await Report.find({}).select('title assignedTo images timeline');

    // Get reports assigned to this field worker
    const assignedReports = await Report.find({ assignedTo: req.user._id });

    // Get reports with images
    const reportsWithImages = await Report.find({ 'images.0': { $exists: true } });

    // Get reports where this user appears in timeline
    const reportsWithUserInTimeline = await Report.find({ 'timeline.updatedBy': req.user._id });

    res.status(200).json({
      success: true,
      debug: {
        userId: req.user._id,
        userRole: req.user.role,
        totalReports: allReports.length,
        assignedReports: assignedReports.length,
        reportsWithImages: reportsWithImages.length,
        reportsWithUserInTimeline: reportsWithUserInTimeline.length,
        assignedReportIds: assignedReports.map(r => r._id),
        reportsWithImagesIds: reportsWithImages.map(r => ({ id: r._id, imageCount: r.images?.length || 0 }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/fieldworker/reports
 * @desc Get reports assigned to the field worker
 * @access Private (field workers/employees only)
 */
router.get('/reports', async (req, res, next) => {
  try {
    const Report = require('../models/report.model');

    const { status, limit = 20, page = 1 } = req.query;

    // Build query for reports assigned to this field worker
    let query = { assignedTo: req.user._id };

    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReports = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total: totalReports,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReports,
          pages: Math.ceil(totalReports / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/fieldworker/reports/:id/status
 * @desc Update status of assigned report
 * @access Private (field workers/employees only)
 * @body {String} status - New status for the report
 * @body {String} comment - Optional comment for the status update
 */
router.patch('/reports/:id/status', async (req, res, next) => {
  try {
    const Report = require('../models/report.model');
    const Notification = require('../models/notification.model');
    const { ApiError } = require('../middleware/error.middleware');

    const { status, comment } = req.body;
    const reportId = req.params.id;

    // Validate status
    const allowedStatuses = ['in_progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return next(new ApiError('Invalid status. Allowed statuses: in_progress, resolved', 400));
    }

    // Find the report
    const report = await Report.findById(reportId);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Check if report is assigned to this field worker
    if (!report.assignedTo || report.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ApiError('You can only update status of reports assigned to you', 403));
    }

    // Update report status
    await report.addTimelineEvent(status, comment || `Status updated to ${status}`, req.user._id);

    // Notify the report submitter if resolved
    if (status === 'resolved') {
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
    }

    // Fetch updated report
    const updatedReport = await Report.findById(reportId)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
