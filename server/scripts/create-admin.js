/**
 * Create Admin User Script
 * 
 * This script creates an admin user in the database.
 * Run with: node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/api/models/user.model');

// Admin user details - you can modify these
const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@civicconnect.com',
  password: 'Admin@123456',
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-connect')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminUser.email });
      
      if (existingAdmin) {
        console.log('Admin user already exists with this email.');
        process.exit(0);
      }
      
      // Create admin user
      const newAdmin = await User.create(adminUser);
      
      console.log('Admin user created successfully:');
      console.log({
        name: `${newAdmin.firstName} ${newAdmin.lastName}`,
        email: newAdmin.email,
        role: newAdmin.role,
        id: newAdmin._id
      });
      
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
