/**
 * Debug script to fetch reports directly
 * Run with: node scripts/fetch-reports.js
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

async function fetchReports() {
  try {
    // Get all reports with populated submittedBy and assignedTo fields
    const reports = await Report.find()
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('timeline.updatedBy', 'firstName lastName');
    
    console.log('Found reports:', reports.length);
    
    // Log the response in the format expected by the frontend
    const responseFormat = {
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalReports: reports.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: reports.length
        },
        statistics: {
          totalReports: reports.length,
          statusCounts: {},
          categoryCounts: {},
          priorityCounts: {},
          avgResolutionHours: 0
        }
      }
    };
    
    console.log('Response format to be used in frontend:', JSON.stringify(responseFormat));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching reports:', error);
    process.exit(1);
  }
}

// Run the function
fetchReports();
