/**
 * Authentication Routes
 * Defines routes for user authentication
 */

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
 * @route PATCH /api/auth/reset-password/:token
 * @desc Reset password using token
 * @access Public
 */
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
