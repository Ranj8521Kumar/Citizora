/**
 * Admin Controller
 * Handles admin-specific operations
 */

const User = require('../models/user.model');

/**
 * Create an admin user (only accessible from trusted sources)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAdmin = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Create admin request body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.log('Missing fields:', {
        firstName: !firstName,
        lastName: !lastName,
        email: !email,
        password: !password
      });

      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        missingFields: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !password
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create admin user
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin'
    });

    console.log('Admin user created:', admin._id);

    // Remove password from output
    admin.password = undefined;

    res.status(201).json({
      success: true,
      data: {
        user: admin
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: {
        message: error.message
      }
    });
  }
};

/**
 * Get all admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAdmins = async (_, res) => {
  try {
    const admins = await User.find({ role: 'admin' });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: {
        admins
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: {
        message: error.message
      }
    });
  }
};
