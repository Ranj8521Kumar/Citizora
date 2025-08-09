/**
 * Admin Routes
 * Defines routes for admin-specific operations
 */

const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Middleware to restrict access to trusted sources only
 * This adds an extra layer of security for admin creation
 */
const restrictToTrustedSources = (req, res, next) => {
  console.log('Admin creation request from IP:', req.ip);
  console.log('Admin creation token header:', req.headers['admin-creation-token']);
  console.log('Expected token:', process.env.ADMIN_CREATION_TOKEN);

  // Check if request is from localhost
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';

  // Check if request has the admin creation token
  const hasAdminToken = req.headers['admin-creation-token'] === process.env.ADMIN_CREATION_TOKEN;

  console.log('Is localhost?', isLocalhost);
  console.log('Has admin token?', hasAdminToken);

  if (isLocalhost || hasAdminToken) {
    console.log('Access granted for admin creation');
    next();
  } else {
    console.log('Access denied for admin creation');
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin creation is restricted to trusted sources only.'
    });
  }
};

/**
 * @route POST /api/admin/create
 * @desc Create an admin user (only from trusted sources)
 * @access Restricted
 */
router.post('/create', restrictToTrustedSources, adminController.createAdmin);

/**
 * @route GET /api/admin/admins
 * @desc Get all admin users
 * @access Private (admin only)
 */
router.get('/admins', authMiddleware, restrictTo('admin'), adminController.getAdmins);

/**
 * @route GET /api/admin/dashboard/analytics
 * @desc Get dashboard analytics data
 * @access Private (admin only)
 */
router.get('/dashboard/analytics', authMiddleware, restrictTo('admin'), adminController.getDashboardAnalytics);

/**
 * @route GET /api/admin/users
 * @desc Get all users with advanced filtering and pagination
 * @access Private (admin only)
 */
router.get('/users', authMiddleware, restrictTo('admin'), adminController.getAllUsers);

/**
 * @route PATCH /api/admin/users/:userId/status
 * @desc Activate or deactivate a user
 * @access Private (admin only)
 */
router.patch('/users/:userId/status', authMiddleware, restrictTo('admin'), adminController.toggleUserStatus);

/**
 * @route PATCH /api/admin/users/:userId/role
 * @desc Update user role
 * @access Private (admin only)
 */
router.patch('/users/:userId/role', authMiddleware, restrictTo('admin'), adminController.updateUserRole);

/**
 * @route GET /api/admin/statistics
 * @desc Get system statistics and reports
 * @access Private (admin only)
 */
router.get('/statistics', authMiddleware, restrictTo('admin'), adminController.getSystemStatistics);

/**
 * @route POST /api/admin/reports/bulk-update-status
 * @desc Bulk update report status
 * @access Private (admin only)
 */
router.post('/reports/bulk-update-status', authMiddleware, restrictTo('admin'), adminController.bulkUpdateReportStatus);

/**
 * @route POST /api/admin/reports/bulk-assign
 * @desc Bulk assign reports to field workers
 * @access Private (admin only)
 */
router.post('/reports/bulk-assign', authMiddleware, restrictTo('admin'), adminController.bulkAssignReports);

/**
 * @route POST /api/admin/reports/bulk-delete
 * @desc Bulk delete reports (soft delete by changing status to closed)
 * @access Private (admin only)
 */
router.post('/reports/bulk-delete', authMiddleware, restrictTo('admin'), adminController.bulkDeleteReports);

/**
 * @route GET /api/admin/reports/search
 * @desc Advanced search and filtering for reports
 * @access Private (admin only)
 */
router.get('/reports/search', authMiddleware, restrictTo('admin'), adminController.advancedReportSearch);

/**
 * @route POST /api/admin/notifications
 * @desc Send a notification/message to a user
 * @access Private (admin only)
 */
router.post('/notifications', authMiddleware, restrictTo('admin'), adminController.sendNotification);

/**
 * @route POST /api/admin/email
 * @desc Send an email to a user
 * @access Private (admin only)
 */
router.post('/email', authMiddleware, restrictTo('admin'), async (req, res) => {
  try {
    const { userId, subject, body } = req.body;

    if (!userId || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'User ID, subject, and body are required fields'
      });
    }

    const User = require('../models/user.model');
    
    // Verify recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has an email
    if (!recipient.email) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an email address'
      });
    }

    // Simulate sending email (in production, you would use a real email service)
    console.log(`Email sent to ${recipient.email} with subject: ${subject}`);
    console.log(`Email body: ${body}`);

    // Create a notification as well
    const Notification = require('../models/notification.model');
    const notification = await Notification.createNotification({
      recipient: userId,
      type: 'message',
      title: `Email: ${subject}`,
      message: body,
      relatedTo: {
        model: 'User',
        id: req.user._id // Admin's ID
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router;
