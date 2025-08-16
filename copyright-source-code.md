# Citizora Source Code for Copyright Registration

This document contains the first 10 and last 10 pages of source code from the Citizora project for copyright registration purposes.

## First 10 Pages of Source Code

### Page 1: Main Server File (server.js)

```javascript
/**
 * Main server file for Citizora API
 * This file initializes the Express server and sets up middleware and routes
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const reportRoutes = require('./api/routes/report.routes');
const mapRoutes = require('./api/routes/map.routes');
const notificationRoutes = require('./api/routes/notification.routes');
const fieldWorkerRoutes = require('./api/routes/fieldworker.routes');

// Import middleware
const { errorHandler } = require('./api/middleware/error.middleware');
const { authMiddleware } = require('./api/middleware/auth.middleware');

// Create Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with increased limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PATCH') {
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});
```

### Page 2: Main Server File (server.js) continued

```javascript
// Import admin routes
const adminRoutes = require('./api/routes/admin.routes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // User routes with mixed public/private endpoints
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/maps', authMiddleware, mapRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/fieldworker', fieldWorkerRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle real-time notifications
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle real-time updates
  socket.on('status-update', (data) => {
    io.to(data.userId).emit('status-changed', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/citizora')
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

### Page 3: Authentication Routes (auth.routes.js)

```javascript
/**
 * Authentication Routes
 * Defines routes for user authentication
 */
require('dotenv').config();

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
  const frontendUrl = 'http://localhost:5173/';
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
```

### Page 4: Authentication Controller (auth.controller.js) - Part 1

```javascript
/**
 * Authentication Controller
 * Handles user registration, login, and password management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { ApiError } = require('../middleware/error.middleware');
const sendEmail = require('../utils/email.util');

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError('Email already in use', 400));
    }

    // Create new user (only allow user or employee roles from API)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role === 'employee' ? 'employee' : 'user' // Prevent creating admin users directly
    });

    // Generate token
    const token = generateToken(user);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Page 5: Authentication Controller (auth.controller.js) - Part 2

```javascript
/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new ApiError('Please provide email and password', 400));
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ApiError('Your account has been deactivated', 403));
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - send reset token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError('No user found with that email address', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });
```

### Page 6: Authentication Controller (auth.controller.js) - Part 3

```javascript
    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Send email
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Token sent to email'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ApiError('There was an error sending the email. Try again later.', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Validate reset token without changing password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateResetToken = async (req, res, next) => {
  try {
    // Get token from params
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ApiError('Token is invalid or has expired', 400));
    }

    // Token is valid
    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
};
```

### Page 7: Authentication Controller (auth.controller.js) - Part 4

```javascript
/**
 * Reset password using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // Get token from params
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ApiError('Token is invalid or has expired', 400));
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};
```

### Page 8: User App Main Component (App.jsx) - Part 1

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { CommunityView } from './components/CommunityView';
import { ActiveCitizens } from './components/ActiveCitizens';
import { AuthModal } from './components/AuthModal';
import { ResetPassword } from './components/ResetPassword';
import { Header } from './components/Header';
import apiService from './services/api';
import './utils/testConnection';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  // Check for existing token on app load and look for reset password token in URL
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if the current URL is a password reset link
        // First check if it's directly from the query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const resetTokenFromUrl = urlParams.get('token');
        const pageParam = urlParams.get('page');
        
        // Check for reset password in URL path or query params
        if ((pageParam === 'reset-password' && resetTokenFromUrl) || 
            window.location.pathname.includes('/reset-password')) {
          
          // If token is in the URL path, extract it
          let token = resetTokenFromUrl;
          if (!token) {
            const tokenMatch = window.location.pathname.match(/\/reset-password\/(.+)/);
            if (tokenMatch) token = tokenMatch[1];
          }
          
          if (token) {
            // Handle reset password flow
            setResetToken(token);
            setCurrentPage('reset-password');
            setLoading(false);
            
            // Note: We're no longer modifying the URL here as it causes issues with redirection
            // The full URL update will be handled by the ResetPassword component directly
            return;
          }
        }
```

### Page 9: User App Main Component (App.jsx) - Part 2

```jsx
        // Regular authentication flow
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user
          const userData = await apiService.getCurrentUser();
          
          // Check if user has the required role (user)
          if (!userData || userData.role !== 'user') {
            console.error('Access denied: Only citizens can use this application');
            apiService.clearToken();
            setUser(null);
          } else {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Define loadReports with useCallback
  const loadReports = useCallback(async () => {
    try {
      setError(null); // Clear any previous errors
      console.log('Loading reports for user:', user);
      
      // Always show loading indicator on refresh
      setLoading(true);
      
      try {
        // Add a timestamp parameter to bust any cache
        const reportsData = await apiService.getReports({ 
          _t: new Date().getTime() 
        });
        console.log('Reports data received from API:', reportsData);
        
        // Process the reports data
        let processedReports = [];
        
        // Handle different data structures
        if (Array.isArray(reportsData)) {
          // Direct array of reports
          processedReports = reportsData;
        } else if (typeof reportsData === 'object') {
          // Could be an object with a reports array or data property
          if (reportsData.data) {
            if (Array.isArray(reportsData.data)) {
              processedReports = reportsData.data;
            } else if (typeof reportsData.data === 'object') {
              // It might be a single report or have a nested structure
              processedReports = [reportsData.data];
            }
          } else if (reportsData.reports && Array.isArray(reportsData.reports)) {
            processedReports = reportsData.reports;
          } else {
            // If no recognizable structure, treat the object itself as a single report
            processedReports = [reportsData];
          }
        }
```

### Page 10: User App Main Component (App.jsx) - Part 3

```jsx
        // Ensure all reports are complete objects with at least a status field
        processedReports = processedReports
          .filter(report => report && typeof report === 'object')
          .map(report => {
            const updatedReport = { ...report };
            // Set default values for missing fields to prevent UI errors
            if (!updatedReport.status) updatedReport.status = 'submitted'; // Default status
            if (!updatedReport.title) updatedReport.title = 'Untitled Report';
            if (!updatedReport.description) updatedReport.description = 'No description provided';
            if (!updatedReport.createdAt) updatedReport.createdAt = new Date().toISOString();
            return updatedReport;
          });
        
        console.log('Reports data for Dashboard:', processedReports);
        
        // Update reports state using functional update to avoid dependency
        setReports(prev => {
          // If we're adding a new report, it's already in the state from handleSubmitReport
          // So we need to merge intelligently without duplicating
          if (prev && prev.length > 0 && processedReports.length > 0) {
            // Create a map of existing reports by ID
            const existingReportsMap = new Map(
              prev.map(report => [report._id, report])
            );
            
            // Update existing reports and add new ones
            processedReports.forEach(report => {
              if (report._id && existingReportsMap.has(report._id)) {
                // Update existing report with new data, preserving any client-side state
                const existingReport = existingReportsMap.get(report._id);
                existingReportsMap.set(report._id, { ...existingReport, ...report });
              } else if (report._id) {
                // Add new report
                existingReportsMap.set(report._id, report);
              }
            });
            
            // Convert map back to array and sort by creation date (newest first)
            return Array.from(existingReportsMap.values())
              .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
          }
          
          // If no existing reports or complete refresh needed, return new reports
          return processedReports;
        });
      } catch (error) {
        console.error('Failed to fetch reports from API:', error);
        setError('Failed to load reports. Please try again later.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
      // Set empty array on error to prevent filter issues
      setReports([]);
    }
  }, [user]); // We're using functional updates, so we don't need reports in the dependency array
```

## Last 10 Pages of Source Code

### Page 11: Camera Interface Component (CameraInterface.jsx) - Part 1

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, X, Image } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';

export function CameraInterface({ onBack }) {
  const [photos, setPhotos] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // Load saved photos from localStorage on component mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('citizoraPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        if (Array.isArray(parsedPhotos)) {
          console.log('Loaded photos from localStorage:', parsedPhotos.length);
          setPhotos(parsedPhotos);
        }
      }
    } catch (error) {
      console.error('Failed to load saved photos:', error);
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    if (photos.length > 0) {
      console.log('Saving photos to localStorage:', photos.length);
      localStorage.setItem('citizoraPhotos', JSON.stringify(photos));
    }
  }, [photos]);

  const handleCameraCapture = () => {
    setIsCameraOpen(true);
  };
  
  const handleImageCapture = (imageDataUrl) => {
    try {
      const newPhoto = {
        id: Date.now(),
        url: imageDataUrl,
        timestamp: new Date().toLocaleString(),
        compressed: true
      };
      
      // Update state and localStorage
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      
      // Ensure it's saved immediately
      localStorage.setItem('citizoraPhotos', JSON.stringify(updatedPhotos));
      console.log('Photo captured and saved to localStorage');
    } catch (error) {
      console.error('Error saving captured photo:', error);
    }
  };
```

### Page 12: Camera Interface Component (CameraInterface.jsx) - Part 2

```jsx
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newPhoto = {
            id: Date.now(),
            url: e.target.result,
            timestamp: new Date().toLocaleString(),
            compressed: true
          };
          
          // Update state and localStorage
          const updatedPhotos = [...photos, newPhoto];
          setPhotos(updatedPhotos);
          
          // Ensure it's saved immediately
          localStorage.setItem('citizoraPhotos', JSON.stringify(updatedPhotos));
          console.log('Photo uploaded and saved to localStorage');
        } catch (error) {
          console.error('Error saving uploaded photo:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deletePhoto = (photoId) => {
    try {
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      setPhotos(updatedPhotos);
      
      // Update localStorage immediately
      localStorage.setItem('citizoraPhotos', JSON.stringify(updatedPhotos));
      console.log('Photo deleted and localStorage updated');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Photo Documentation</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{photos.length} photos</span>
          </div>
        </div>
      </div>
```

### Page 13: Camera Interface Component (CameraInterface.jsx) - Part 3

```jsx
      {/* Camera Interface */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {/* Camera View with Photos Display */}
        {photos.length > 0 ? (
          <div className="flex-1 flex flex-col p-4">
            <h2 className="text-white text-xl font-semibold mb-4">Captured Photos</h2>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-240px)]">
              {photos.map((photo) => (
                <div key={photo.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={`Photo ${photo.timestamp}`} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                    <p className="text-xs text-white truncate">{photo.timestamp}</p>
                  </div>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"
                    aria-label="Delete photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center text-white">
              <Camera className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No photos yet</p>
              <p className="text-sm opacity-75">Tap the camera button below to capture</p>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="p-6 bg-black bg-opacity-50">
          <div className="flex items-center justify-center space-x-8">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              aria-label="Upload from gallery"
            >
              <Image className="w-6 h-6 text-white" />
            </button>
```

### Page 14: Camera Interface Component (CameraInterface.jsx) - Part 4

```jsx
            {/* Capture Button */}
            <button
              onClick={handleCameraCapture}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Take photo"
            >
              <Camera className="w-8 h-8 text-gray-800" />
            </button>

            {/* Switch Camera Button - Disabled for now as it's handled by PhotoCapture */}
            <button 
              className="p-4 bg-white bg-opacity-20 rounded-full opacity-50"
              aria-label="Switch camera - available when taking photo"
              disabled
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="bg-black bg-opacity-50 p-4 mt-auto">
          <h3 className="text-white font-medium mb-3">Recent Photos ({photos.length})</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2 max-h-16">
            {photos.map((photo) => (
              <div key={photo.id} className="relative flex-shrink-0">
                <img
                  src={photo.url}
                  alt="Captured"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PhotoCapture Modal Component */}
      <PhotoCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleImageCapture}
        initialMode="camera"
      />
    </div>
  );
}
```

### Page 15: Executive Dashboard Component (ExecutiveDashboard.jsx) - Part 1

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Progress } from '../ui/progress.jsx';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api.js';

// Default KPI structure for loading state
const defaultKpiData = [
  {
    title: 'Active Reports',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Resolved This Week',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    title: 'Active Users',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Pending Reviews',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: Clock,
    color: 'text-orange-600'
  }
];

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'default';
    case 'Medium':
      return 'secondary';
    default:
      return 'outline';
  }
};
```

### Page 16: Executive Dashboard Component (ExecutiveDashboard.jsx) - Part 2

```jsx
const getActivityColor = (type) => {
  switch (type) {
    case 'report':
    case 'new':
      return 'bg-blue-500';
    case 'resolved':
      return 'bg-green-500';
    case 'assigned':
      return 'bg-purple-500';
    case 'updated':
    case 'in-progress':
      return 'bg-orange-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export const ExecutiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState(defaultKpiData);
  const [priorityIssues, setPriorityIssues] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardAnalytics();
        const dashboardData = response.data || response;
        console.log('Dashboard data from API:', dashboardData);
        
        // Update KPI data
        if (dashboardData.overview) {
          // Calculate pending reviews (assume it's reports that are not resolved)
          const pendingReviews = dashboardData.overview.totalReports - 
            ((dashboardData.charts.reportsByStatus.find(s => s._id === 'resolved')?.count) || 0);

          // Get active reports count from reports by status
          const activeReportsCount = (dashboardData.charts.reportsByStatus.find(s => 
            s._id === 'active' || s._id === 'open' || s._id === 'in-progress')?.count) || 0;
            
          // Get resolved this week reports
          const resolvedThisWeekCount = (dashboardData.charts.reportsByStatus.find(s => 
            s._id === 'resolved')?.count) || 0;
            
          setKpiData([
            {
              title: 'Active Reports',
              value: activeReportsCount.toLocaleString(),
              change: dashboardData.overview.userGrowthRate.toFixed(1) + '%',
              trend: dashboardData.overview.userGrowthRate >= 0 ? 'up' : 'down',
              icon: FileText,
              color: 'text-blue-600'
            },
```

### Page 17: Executive Dashboard Component (ExecutiveDashboard.jsx) - Part 3

```jsx
            {
              title: 'Resolved This Week',
              value: resolvedThisWeekCount.toLocaleString(),
              change: dashboardData.overview.resolutionRate.toFixed(1) + '%',
              trend: dashboardData.overview.resolutionRate >= 0 ? 'up' : 'down',
              icon: CheckCircle,
              color: 'text-green-600'
            },
            {
              title: 'Active Users',
              value: dashboardData.overview.activeUsers.toLocaleString(),
              change: ((dashboardData.overview.activeUsers / dashboardData.overview.totalUsers) * 100).toFixed(1) + '%',
              trend: 'up',
              icon: Users,
              color: 'text-purple-600'
            },
            {
              title: 'Pending Reviews',
              value: pendingReviews.toLocaleString(),
              change: '0%', // No percentage change data available
              trend: pendingReviews > dashboardData.overview.totalReports / 2 ? 'down' : 'up',
              icon: Clock,
              color: 'text-orange-600'
            }
          ]);
        }
        
        // Create priority issues from the reports by priority
        // We'll create some sample priority issues since the backend doesn't return this specific format
        // In a production app, we would use the actual data from the backend
        
        // Set sample priority issues - in a real app, you'd fetch these from an API
        setPriorityIssues([
          {
            id: 'issue-1',
            title: 'Pothole on Main Street',
            location: 'Downtown District',
            priority: 'Critical',
            time: '2 hours ago',
            status: 'Assigned'
          },
          {
            id: 'issue-2',
            title: 'Broken Street Light',
            location: 'Riverside Area',
            priority: 'High',
            time: '5 hours ago',
            status: 'In Progress'
          },
          {
            id: 'issue-3',
            title: 'Garbage Collection Missed',
            location: 'North Side',
            priority: 'Medium',
            time: '1 day ago',
            status: 'Pending'
          }
        ]);
```

### Page 18: Realtime Communication (from Citizora_Technical_Appendix.md)

```javascript
// Server-side Socket.IO implementation
io.on('connection', (socket) => {
  // User authentication
  socket.on('authenticate', (token) => {
    const user = verifyToken(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.join(`user_${user.id}`);
    if (user.role === 'admin') socket.join('admin_room');
  });

  // Report status updates
  socket.on('report_status_update', (data) => {
    // Broadcast to relevant users
    io.to(`user_${data.submitterId}`).emit('status_updated', data);
    io.to('admin_room').emit('admin_notification', data);
  });

  // Real-time chat
  socket.on('send_message', (message) => {
    io.to(`report_${message.reportId}`).emit('new_message', message);
  });
});

// Client-side Socket.IO implementation
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

// Authentication when user logs in
const authenticateSocket = (token) => {
  socket.emit('authenticate', token);
};

// Listen for report status updates
socket.on('status_updated', (data) => {
  // Update UI with new status
  dispatch(updateReportStatus(data));
  // Show notification
  toast.info(`Report ${data.reportId} status updated to ${data.status}`);
});

// Send a message in real-time chat
const sendMessage = (message) => {
  socket.emit('send_message', {
    reportId: reportId,
    userId: currentUser.id,
    content: message,
    timestamp: new Date()
  });
};

// Listen for new messages
socket.on('new_message', (message) => {
  // Add message to chat history
  setChatHistory(prev => [...prev, message]);
  // Scroll to latest message
  chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
});
```

### Page 19: API Service (from users/src/services/api.js)

```javascript
/**
 * API Service for the Citizora Citizen Portal
 * Handles all API calls to the backend server
 */
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.citizora.com/api' 
  : 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/?expired=true';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Auth endpoints
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return await apiClient.patch(`/auth/reset-password/${token}`, { password });
  },

  validateResetToken: async (token) => {
    return await apiClient.get(`/auth/validate-reset-token/${token}`);
  },

  // User endpoints
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },
```

### Page 20: WebSocket Integration (from server/src/api/services/socket.service.js)

```javascript
/**
 * Socket Service
 * Handles real-time communication through WebSockets
 */

class SocketService {
  constructor(io) {
    this.io = io;
    this.userRooms = new Map(); // Map of userId to room names
    this.initialize();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        try {
          const { userId, role } = data;
          
          if (!userId) {
            console.error('Authentication failed: No user ID provided');
            return;
          }
          
          // Store user information on socket
          socket.userId = userId;
          socket.userRole = role;
          
          // Join user's personal room
          const userRoom = `user_${userId}`;
          socket.join(userRoom);
          
          // Join role-based room
          if (role) {
            const roleRoom = `role_${role}`;
            socket.join(roleRoom);
          }
          
          // Store rooms in map for later use
          const rooms = [userRoom];
          if (role) rooms.push(`role_${role}`);
          this.userRooms.set(userId, rooms);
          
          console.log(`User ${userId} authenticated with role ${role}`);
          
          // Notify user of successful connection
          socket.emit('authenticated', { 
            success: true, 
            message: 'Successfully authenticated'
          });
        } catch (error) {
          console.error('Socket authentication error:', error);
          socket.emit('authenticated', { 
            success: false,
            message: 'Authentication failed'
          });
        }
      });

      // Handle report status updates
      socket.on('report_update', (data) => {
        try {
          const { reportId, status, userId, updatedBy } = data;
          
          if (!reportId || !status) {
            console.error('Invalid report update data:', data);
            return;
          }
          
          console.log(`Report ${reportId} status updated to ${status} by ${updatedBy}`);
          
          // Notify the report submitter
          if (userId) {
            this.io.to(`user_${userId}`).emit('report_updated', data);
          }
          
          // Notify all admins
          this.io.to('role_admin').emit('admin_notification', {
            type: 'report_update',
            reportId,
            status,
            updatedBy,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Socket report update error:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        try {
          const userId = socket.userId;
          if (userId) {
            // Remove user from rooms map
            this.userRooms.delete(userId);
            console.log(`User ${userId} disconnected`);
          } else {
            console.log('Anonymous client disconnected');
          }
        } catch (error) {
          console.error('Socket disconnect error:', error);
        }
      });
    });
  }

  // Utility method to send notification to a specific user
  notifyUser(userId, event, data) {
    if (!userId) {
      console.error('Cannot notify user: No user ID provided');
      return;
    }
    
    this.io.to(`user_${userId}`).emit(event, data);
    console.log(`Notification sent to user ${userId}:`, event);
  }

  // Utility method to broadcast to all users with a specific role
  notifyRole(role, event, data) {
    if (!role) {
      console.error('Cannot notify role: No role provided');
      return;
    }
    
    this.io.to(`role_${role}`).emit(event, data);
    console.log(`Notification sent to all ${role}s:`, event);
  }

  // Utility method to broadcast to all connected clients
  broadcastAll(event, data) {
    this.io.emit(event, data);
    console.log('Broadcast sent to all connected clients:', event);
  }
}

module.exports = SocketService;
```
