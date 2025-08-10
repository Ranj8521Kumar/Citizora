/**
 * Script to create test notifications for the current user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/api/models/user.model');
const Notification = require('../src/api/models/notification.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Get admin user email from args or use default
const adminEmail = process.argv[2] || 'admin@civicconnect.com';

// Sample notification data
const sampleNotifications = [
  {
    type: 'system',
    title: 'System Maintenance',
    message: 'The system will be undergoing maintenance tonight at 11 PM. Please save your work.',
    priority: 'high',
  },
  {
    type: 'report_status',
    title: 'Report #456 Updated',
    message: 'A high priority report has been updated with new information.',
    priority: 'normal',
  },
  {
    type: 'message',
    title: 'New Message from John Smith',
    message: 'Please review the field worker schedules for next week.',
    priority: 'normal',
  },
  {
    type: 'assignment',
    title: 'New Assignment',
    message: 'You have been assigned as the admin supervisor for the Downtown district.',
    priority: 'low',
  },
  {
    type: 'feedback',
    title: 'New Citizen Feedback',
    message: 'A citizen has provided positive feedback on the recent road repairs.',
    priority: 'normal',
  }
];

async function createTestNotifications() {
  try {
    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.error(`Admin with email ${adminEmail} not found`);
      process.exit(1);
    }
    
    console.log(`Creating test notifications for ${admin.firstName} ${admin.lastName} (${admin.email})`);
    
    // Delete existing notifications for clean testing
    await Notification.deleteMany({ recipient: admin._id });
    console.log('Cleared existing notifications');
    
    // Create notifications
    const createdNotifications = [];
    
    for (const notification of sampleNotifications) {
      const newNotification = await Notification.create({
        recipient: admin._id,
        ...notification,
        createdAt: new Date(),
      });
      
      createdNotifications.push(newNotification);
    }
    
    console.log(`Created ${createdNotifications.length} test notifications`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test notifications:', error);
    process.exit(1);
  }
}

createTestNotifications();
