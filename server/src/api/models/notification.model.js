/**
 * Notification Model
 * Defines the schema for notifications sent to users
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['report_status', 'assignment', 'feedback', 'system', 'message'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Report', 'User', 'Task', null],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create and save a new notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadByUser = function(userId) {
  return this.find({ 
    recipient: userId, 
    isRead: false 
  })
  .sort({ createdAt: -1 });
};

// Create and export the Notification model
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
