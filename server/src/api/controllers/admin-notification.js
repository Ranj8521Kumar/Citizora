/**
 * Send notification to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, subject, message, type = 'message', priority = 'normal' } = req.body;

    // Validate required fields
    if (!userId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, subject, and message are required fields'
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification
    const notification = new Notification({
      recipient: userId,
      sender: req.user._id, // Admin's ID
      type: type,
      title: subject,
      message: message,
      relatedTo: {
        model: 'User',
        id: req.user._id
      },
      priority: priority,
      isRead: false
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: {
        message: error.message
      }
    });
  }
};
