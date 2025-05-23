/**
 * Notification Routes
 * Defines routes for notification management
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    // Get notifications for the current user, sorted by creation date
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('relatedTo.id', 'title status'); // Populate related report/task details if needed

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: {
        notifications
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: {
        message: error.message
      }
    });
  }
});

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router;
