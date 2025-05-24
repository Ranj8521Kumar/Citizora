/**
 * Main server file for CivicConnect API
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

// Import admin routes
const adminRoutes = require('./api/routes/admin.routes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-connect')
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
