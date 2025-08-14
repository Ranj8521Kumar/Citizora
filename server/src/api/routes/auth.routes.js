/**
 * Authentication Routes
 * Defines routes for user authentication
 */
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset email
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route GET /api/auth/reset-password/:token
 * @desc Handle direct browser visits to reset password URL
 * @access Public
 */
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  // Redirect to the frontend reset password page with the token
  const frontendUrl = process.env.FRONTEND_CITIZEN_URL || 'http://localhost:5174';
  res.redirect(`${frontendUrl}/?page=reset-password&token=${token}`);
});

/**
 * @route GET /api/auth/validate-reset-token/:token
 * @desc Validate reset token without changing password
 * @access Public
 */
router.get('/validate-reset-token/:token', authController.validateResetToken);

/**
 * @route PATCH /api/auth/reset-password/:token
 * @desc Reset password using token
 * @access Public
 */
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
