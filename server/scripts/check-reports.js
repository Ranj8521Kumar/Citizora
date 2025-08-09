/**
 * Script to check reports in the database
 * Run with: node scripts/check-reports.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Report = require('../src/api/models/report.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

async function checkReports() {
  try {
    // Count reports
    const count = await Report.countDocuments();
    console.log(`Total reports in database: ${count}`);

    // Get a sample of reports
    const reports = await Report.find().limit(3);
    console.log('Sample reports:');
    console.log(JSON.stringify(reports, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error checking reports:', error);
    process.exit(1);
  }
}

// Run the function
checkReports();
