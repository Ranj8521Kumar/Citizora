/**
 * Report Routes
 * Defines routes for report management
 */

const express = require('express');
const reportController = require('../controllers/report.controller');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');
const { upload } = require('../services/upload.service');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/reports
 * @desc Create a new report
 * @access Private (all authenticated users)
 */
router.post('/', reportController.createReport);

/**
 * @route GET /api/reports
 * @desc Get all reports (filtered by user role)
 * @access Private (all authenticated users)
 */
router.get('/', reportController.getReports);

/**
 * @route GET /api/reports/:id
 * @desc Get a single report by ID
 * @access Private (report owner, assigned employee, or admin)
 */
router.get('/:id', reportController.getReportById);

/**
 * @route PATCH /api/reports/:id/status
 * @desc Update report status
 * @access Private (assigned employee, admin, or user for feedback)
 */
router.patch('/:id/status', reportController.updateReportStatus);

/**
 * @route PATCH /api/reports/:id/assign
 * @desc Assign report to employee
 * @access Private (admin only)
 */
router.patch('/:id/assign', restrictTo('admin'), reportController.assignReport);

/**
 * @route POST /api/reports/:id/feedback
 * @desc Add feedback to a resolved report
 * @access Private (report owner only)
 */
router.post('/:id/feedback', reportController.addFeedback);

/**
 * @route POST /api/reports/:id/images
 * @desc Upload images for a report
 * @access Private (report owner or assigned employee)
 */
router.post('/:id/images', upload.array('images', 5), reportController.uploadReportImages);

module.exports = router;
