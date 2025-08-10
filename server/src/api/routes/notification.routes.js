/**
 * Notification Routes
 * Defines routes for notification management
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

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
 * @route POST /api/notifications
 * @desc Create a new notification/message to a user
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { recipientId, subject, message, notificationType = 'message' } = req.body;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, subject, and message are required fields'
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    // Create notification
    const notification = await Notification.createNotification({
      recipient: recipientId,
      type: notificationType,
      title: subject,
      message: message,
      relatedTo: {
        model: 'User',
        id: req.user._id // Sender's ID
      }
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
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

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', async (req, res) => {
  try {
    // Find all unread notifications for the user
    const notifications = await Notification.find({
      recipient: req.user._id,
      isRead: false
    });

    // Mark each notification as read
    for (const notification of notifications) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: `Marked ${notifications.length} notifications as read`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: {
        message: error.message
      }
    });
  }
});

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', async (req, res) => {
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

    await Notification.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        deletedNotificationId: req.params.id
      }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router;
