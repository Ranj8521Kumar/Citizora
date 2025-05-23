/**
 * Map Routes
 * Defines routes for map-related functionality
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const Report = require('../models/report.model');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/maps/reports
 * @desc Get reports with geospatial data for map display
 * @access Private
 */
router.get('/reports', async (req, res) => {
  try {
    // Build query to fetch reports with location data
    const query = {
      'location.coordinates': { $exists: true }
    };

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by user role
    if (req.user.role === 'user') {
      // Users can only see their own reports
      query.submittedBy = req.user._id;
    } else if (req.user.role === 'employee') {
      // Employees can see reports assigned to them or unassigned
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null, status: { $in: ['submitted', 'in_review'] } }
      ];
    }
    // Admins can see all reports (no additional filter)

    // Fetch reports with location data
    const reports = await Report.find(query)
      .select('title category status priority location createdAt')
      .populate('submittedBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    console.error('Error fetching map reports:', error);

    // Provide a more user-friendly error message
    res.status(500).json({
      success: false,
      message: 'Failed to fetch map data',
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router;
