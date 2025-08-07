/**
 * User Routes
 * Defines routes for user management
 */

const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

const router = express.Router();

/**
 * @route GET /api/users/active-citizens
 * @desc Get active citizens count and basic info (public)
 * @access Public
 */
router.get('/active-citizens', async (req, res, next) => {
  try {
    // Get count of all users (active citizens)
    const totalUsers = await User.countDocuments();
    
    // Get basic info of recent users (last 10 registered users)
    const recentUsers = await User.find()
      .select('firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalCitizens: totalUsers,
        recentCitizens: recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * @route PATCH /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.patch('/profile', async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'profileImage'];
    const updateData = {};

    // Only include allowed fields that are present in the request
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        updateData[field] = req.body[field];
      }
    });

    // Update user with new data
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Private (admin only)
 */
router.get('/', restrictTo('admin'), async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
