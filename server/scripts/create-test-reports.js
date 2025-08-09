/**
 * Script to create test reports in the database
 * Run with: node scripts/create-test-reports.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Report = require('../src/api/models/report.model');
const User = require('../src/api/models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Sample data
const categories = ['road_issue', 'water_issue', 'electricity_issue', 'waste_management', 'public_safety', 'other'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed'];
const cities = ['Downtown', 'Westside', 'Northborough', 'Eastfield', 'South District'];
const streets = ['Main St', 'Oak Avenue', 'Maple Road', 'Washington Blvd', 'Park Lane'];

// Create test reports
async function createTestReports() {
  try {
    // Find a citizen user and an employee user to use as submitters and assignees
    const citizenUser = await User.findOne({ role: 'user' });
    const employeeUser = await User.findOne({ role: 'employee' });
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!citizenUser) {
      console.log('No citizen user found. Creating one...');
      const newCitizen = new User({
        firstName: 'Test',
        lastName: 'Citizen',
        email: 'testcitizen@example.com',
        password: '$2a$10$XgQVbsJLZA1LGbPl1AeK1.1JumktrSo0UC6XN8U1MBBGzjnOGnhAS', // hashed 'password123'
        role: 'user',  // Using 'user' instead of 'citizen'
        isActive: true,
        phoneNumber: '5551234567'
      });
      await newCitizen.save();
      console.log('Created citizen user with email: testcitizen@example.com');
    }

    if (!employeeUser) {
      console.log('No field worker user found. Creating one...');
      const newEmployee = new User({
        firstName: 'Test',
        lastName: 'Worker',
        email: 'testworker@example.com',
        password: '$2a$10$XgQVbsJLZA1LGbPl1AeK1.1JumktrSo0UC6XN8U1MBBGzjnOGnhAS',
        role: 'employee',  // Using 'employee' instead of 'fieldworker'
        isActive: true,
        phoneNumber: '5559876543',
        department: 'Public Works'
      });
      await newEmployee.save();
      console.log('Created field worker user with email: testworker@example.com');
    }

    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: '$2a$10$XgQVbsJLZA1LGbPl1AeK1.1JumktrSo0UC6XN8U1MBBGzjnOGnhAS',
        role: 'admin',
        isActive: true
      });
      await newAdmin.save();
      console.log('Created admin user with email: admin@example.com');
    }

    // Get user IDs after possible creation
    const submitterId = (await User.findOne({ role: 'user' }))._id;
    const assigneeId = (await User.findOne({ role: 'employee' }))._id;

    // Delete existing test reports
    await Report.deleteMany({ title: { $regex: '^Test Report' } });
    console.log('Deleted existing test reports');

    // Create 10 test reports
    const reportPromises = [];
    
    for (let i = 1; i <= 10; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];

      // Randomly assign some reports
      const assigned = Math.random() > 0.4;

      const report = new Report({
        title: `Test Report ${i}: ${category.replace('_', ' ')}`,
        description: `This is a test report #${i} about a ${category.replace('_', ' ')}. This description provides details about the issue that needs to be addressed.`,
        category,
        priority,
        status,
        location: {
          coordinates: [
            -73.9712 + (Math.random() * 0.1), // Random longitude near NYC
            40.7831 + (Math.random() * 0.1)   // Random latitude near NYC
          ],
          address: {
            street: `${Math.floor(Math.random() * 1000) + 1} ${street}`,
            city,
            state: 'NY',
            zipCode: `1000${Math.floor(Math.random() * 10)}`
          }
        },
        submittedBy: submitterId,
        assignedTo: assigned ? assigneeId : null,
        timeline: [
          {
            status: 'submitted',
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            comment: 'Report submitted by citizen',
            updatedBy: submitterId
          }
        ]
      });

      // Add additional timeline entries based on status
      if (status !== 'submitted') {
        report.timeline.push({
          status: 'in_review',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 6 * 24 * 60 * 60 * 1000)),
          comment: 'Report is under review',
          updatedBy: assigneeId
        });
      }

      if (status === 'assigned' || status === 'in_progress' || status === 'resolved' || status === 'closed') {
        report.timeline.push({
          status: 'assigned',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
          comment: 'Report assigned to field worker',
          updatedBy: assigneeId
        });
      }

      if (status === 'in_progress' || status === 'resolved' || status === 'closed') {
        report.timeline.push({
          status: 'in_progress',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
          comment: 'Work has started on this issue',
          updatedBy: assigneeId
        });
      }

      if (status === 'resolved' || status === 'closed') {
        report.timeline.push({
          status: 'resolved',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)),
          comment: 'Issue has been resolved',
          updatedBy: assigneeId
        });
      }

      if (status === 'closed') {
        report.timeline.push({
          status: 'closed',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 1 * 24 * 60 * 60 * 1000)),
          comment: 'Report closed after verification',
          updatedBy: assigneeId
        });
      }

      reportPromises.push(report.save());
    }

    await Promise.all(reportPromises);
    console.log(`Created 10 test reports`);
    console.log('Test data creation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

// Run the function
createTestReports();
