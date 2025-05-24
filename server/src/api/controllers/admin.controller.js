/**
 * Admin Controller
 * Handles admin-specific operations including dashboard analytics,
 * user management, system statistics, and bulk operations
 */

const User = require('../models/user.model');
const Report = require('../models/report.model');
const Notification = require('../models/notification.model');
const { ApiError } = require('../middleware/error.middleware');
const mongoose = require('mongoose');

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

/**
 * Get dashboard analytics data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Parallel execution of analytics queries
    const [
      totalUsers,
      totalReports,
      totalNotifications,
      activeUsers,
      recentReports,
      reportsByStatus,
      reportsByCategory,
      reportsByPriority,
      usersByRole,
      reportsOverTime,
      averageResolutionTime
    ] = await Promise.all([
      // Total counts
      User.countDocuments(),
      Report.countDocuments(),
      Notification.countDocuments(),

      // Active users (logged in within timeframe)
      User.countDocuments({
        lastLogin: { $gte: startDate },
        isActive: true
      }),

      // Recent reports
      Report.countDocuments({
        createdAt: { $gte: startDate }
      }),

      // Reports by status
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Reports by category
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Reports by priority
      Report.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Users by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Reports over time (daily for the timeframe)
      Report.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Average resolution time
      Report.aggregate([
        {
          $match: {
            status: 'resolved',
            'timeline.status': 'resolved'
          }
        },
        {
          $addFields: {
            resolutionTime: {
              $subtract: [
                { $arrayElemAt: [
                  { $filter: {
                    input: '$timeline',
                    cond: { $eq: ['$$this.status', 'resolved'] }
                  }}, 0
                ]}.timestamp,
                '$createdAt'
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageResolutionTime: { $avg: '$resolutionTime' },
            totalResolved: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculate performance metrics
    const userGrowthRate = totalUsers > 0 ? ((recentReports / totalReports) * 100).toFixed(2) : 0;
    const resolutionRate = totalReports > 0 ?
      ((reportsByStatus.find(s => s._id === 'resolved')?.count || 0) / totalReports * 100).toFixed(2) : 0;

    // Format average resolution time
    const avgResolutionHours = averageResolutionTime[0] ?
      Math.round(averageResolutionTime[0].averageResolutionTime / (1000 * 60 * 60)) : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalReports,
          totalNotifications,
          activeUsers,
          recentReports,
          userGrowthRate: parseFloat(userGrowthRate),
          resolutionRate: parseFloat(resolutionRate),
          averageResolutionHours: avgResolutionHours
        },
        charts: {
          reportsByStatus,
          reportsByCategory,
          reportsByPriority,
          usersByRole,
          reportsOverTime
        },
        timeframe,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    next(new ApiError('Failed to fetch dashboard analytics', 500));
  }
};

/**
 * Get all users with advanced filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries in parallel
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    next(new ApiError('Failed to fetch users', 500));
  }
};

/**
 * Activate or deactivate a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return next(new ApiError('isActive must be a boolean value', 400));
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && !isActive) {
      return next(new ApiError('You cannot deactivate your own account', 400));
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    // Create notification for the user if being deactivated
    if (!isActive) {
      await Notification.create({
        recipient: user._id,
        type: 'system',
        title: 'Account Deactivated',
        message: 'Your account has been deactivated by an administrator. Please contact support for assistance.',
        priority: 'high'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    next(new ApiError('Failed to update user status', 500));
  }
};

/**
 * Update user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'employee', 'admin'];
    if (!validRoles.includes(role)) {
      return next(new ApiError('Invalid role. Must be one of: user, employee, admin', 400));
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return next(new ApiError('You cannot change your own role', 400));
    }

    // Update user role
    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Create notification for the user
    await Notification.create({
      recipient: user._id,
      type: 'system',
      title: 'Role Updated',
      message: `Your role has been updated from ${oldRole} to ${role} by an administrator.`,
      priority: 'normal'
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    next(new ApiError('Failed to update user role', 500));
  }
};

/**
 * Get system statistics and reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSystemStatistics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Parallel execution of statistics queries
    const [
      userStats,
      reportStats,
      performanceStats,
      geographicStats,
      timelineStats
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            activeUsers: [
              { $match: { isActive: true } },
              { $count: "count" }
            ],
            usersByRole: [
              { $group: { _id: "$role", count: { $sum: 1 } } }
            ],
            recentRegistrations: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ],
            lastLoginActivity: [
              { $match: { lastLogin: { $gte: startDate } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Report statistics
      Report.aggregate([
        {
          $facet: {
            totalReports: [{ $count: "count" }],
            reportsByStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            reportsByCategory: [
              { $group: { _id: "$category", count: { $sum: 1 } } }
            ],
            reportsByPriority: [
              { $group: { _id: "$priority", count: { $sum: 1 } } }
            ],
            recentReports: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ],
            assignedReports: [
              { $match: { assignedTo: { $ne: null } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Performance statistics
      Report.aggregate([
        {
          $match: {
            status: "resolved",
            "timeline.status": "resolved"
          }
        },
        {
          $addFields: {
            resolutionTime: {
              $subtract: [
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$timeline",
                            cond: { $eq: ["$$this.status", "resolved"] }
                          }
                        },
                        as: "item",
                        in: "$$item.timestamp"
                      }
                    },
                    0
                  ]
                },
                "$createdAt"
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageResolutionTime: { $avg: "$resolutionTime" },
            minResolutionTime: { $min: "$resolutionTime" },
            maxResolutionTime: { $max: "$resolutionTime" },
            totalResolved: { $sum: 1 }
          }
        }
      ]),

      // Geographic statistics
      Report.aggregate([
        {
          $match: {
            "location.address.city": { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: "$location.address.city",
            count: { $sum: 1 },
            categories: { $addToSet: "$category" },
            avgPriority: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$priority", "low"] }, then: 1 },
                    { case: { $eq: ["$priority", "medium"] }, then: 2 },
                    { case: { $eq: ["$priority", "high"] }, then: 3 },
                    { case: { $eq: ["$priority", "critical"] }, then: 4 }
                  ],
                  default: 2
                }
              }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Timeline statistics
      Report.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            reports: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $eq: ["$status", "resolved"] }, 1, 0]
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ])
    ]);

    // Format the response
    const statistics = {
      users: {
        total: userStats[0].totalUsers[0]?.count || 0,
        active: userStats[0].activeUsers[0]?.count || 0,
        byRole: userStats[0].usersByRole,
        recentRegistrations: userStats[0].recentRegistrations[0]?.count || 0,
        recentActivity: userStats[0].lastLoginActivity[0]?.count || 0
      },
      reports: {
        total: reportStats[0].totalReports[0]?.count || 0,
        byStatus: reportStats[0].reportsByStatus,
        byCategory: reportStats[0].reportsByCategory,
        byPriority: reportStats[0].reportsByPriority,
        recent: reportStats[0].recentReports[0]?.count || 0,
        assigned: reportStats[0].assignedReports[0]?.count || 0
      },
      performance: {
        averageResolutionHours: performanceStats[0] ?
          Math.round(performanceStats[0].averageResolutionTime / (1000 * 60 * 60)) : 0,
        minResolutionHours: performanceStats[0] ?
          Math.round(performanceStats[0].minResolutionTime / (1000 * 60 * 60)) : 0,
        maxResolutionHours: performanceStats[0] ?
          Math.round(performanceStats[0].maxResolutionTime / (1000 * 60 * 60)) : 0,
        totalResolved: performanceStats[0]?.totalResolved || 0
      },
      geographic: geographicStats,
      timeline: timelineStats,
      period,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    next(new ApiError('Failed to fetch system statistics', 500));
  }
};

/**
 * Bulk update report status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.bulkUpdateReportStatus = async (req, res, next) => {
  try {
    const { reportIds, status, comment } = req.body;

    // Validate input
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return next(new ApiError('reportIds must be a non-empty array', 400));
    }

    const validStatuses = ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return next(new ApiError('Invalid status', 400));
    }

    // Validate ObjectIds
    const validObjectIds = reportIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validObjectIds.length !== reportIds.length) {
      return next(new ApiError('All reportIds must be valid ObjectIds', 400));
    }

    // Find reports
    const reports = await Report.find({ _id: { $in: validObjectIds } });

    if (reports.length === 0) {
      return next(new ApiError('No reports found with the provided IDs', 404));
    }

    // Update reports and create timeline events
    const updatePromises = reports.map(async (report) => {
      await report.addTimelineEvent(
        status,
        comment || `Bulk status update to ${status}`,
        req.user._id
      );

      // Create notifications for report submitters if status is resolved
      if (status === 'resolved') {
        await Notification.create({
          recipient: report.submittedBy,
          type: 'report_status',
          title: 'Report Resolved',
          message: `Your report "${report.title}" has been resolved.`,
          relatedTo: {
            model: 'Report',
            id: report._id
          }
        });
      }

      return report;
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${reports.length} reports to status: ${status}`,
      data: {
        updatedCount: reports.length,
        status,
        reportIds: reports.map(r => r._id)
      }
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    next(new ApiError('Failed to bulk update reports', 500));
  }
};

/**
 * Bulk assign reports to field workers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.bulkAssignReports = async (req, res, next) => {
  try {
    const { reportIds, assigneeId } = req.body;

    // Validate input
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return next(new ApiError('reportIds must be a non-empty array', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return next(new ApiError('Invalid assigneeId', 400));
    }

    // Validate ObjectIds
    const validObjectIds = reportIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validObjectIds.length !== reportIds.length) {
      return next(new ApiError('All reportIds must be valid ObjectIds', 400));
    }

    // Check if assignee exists and is an employee
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return next(new ApiError('Assignee not found', 404));
    }

    if (assignee.role !== 'employee') {
      return next(new ApiError('Can only assign reports to employees', 400));
    }

    // Find reports
    const reports = await Report.find({ _id: { $in: validObjectIds } });

    if (reports.length === 0) {
      return next(new ApiError('No reports found with the provided IDs', 404));
    }

    // Update reports
    const updatePromises = reports.map(async (report) => {
      report.assignedTo = assigneeId;
      await report.addTimelineEvent(
        'assigned',
        `Assigned to ${assignee.firstName} ${assignee.lastName}`,
        req.user._id
      );

      // Create notification for the assignee
      await Notification.create({
        recipient: assigneeId,
        type: 'assignment',
        title: 'New Report Assigned',
        message: `You have been assigned a new report: "${report.title}"`,
        relatedTo: {
          model: 'Report',
          id: report._id
        }
      });

      return report;
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${reports.length} reports to ${assignee.firstName} ${assignee.lastName}`,
      data: {
        assignedCount: reports.length,
        assignee: {
          _id: assignee._id,
          name: `${assignee.firstName} ${assignee.lastName}`,
          email: assignee.email
        },
        reportIds: reports.map(r => r._id)
      }
    });
  } catch (error) {
    console.error('Error in bulk assignment:', error);
    next(new ApiError('Failed to bulk assign reports', 500));
  }
};

/**
 * Bulk delete reports (soft delete by changing status to closed)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.bulkDeleteReports = async (req, res, next) => {
  try {
    const { reportIds, reason } = req.body;

    // Validate input
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return next(new ApiError('reportIds must be a non-empty array', 400));
    }

    // Validate ObjectIds
    const validObjectIds = reportIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validObjectIds.length !== reportIds.length) {
      return next(new ApiError('All reportIds must be valid ObjectIds', 400));
    }

    // Find reports
    const reports = await Report.find({ _id: { $in: validObjectIds } });

    if (reports.length === 0) {
      return next(new ApiError('No reports found with the provided IDs', 404));
    }

    // Update reports to closed status
    const updatePromises = reports.map(async (report) => {
      await report.addTimelineEvent(
        'closed',
        reason || 'Report closed by administrator',
        req.user._id
      );

      // Create notification for report submitter
      await Notification.create({
        recipient: report.submittedBy,
        type: 'report_status',
        title: 'Report Closed',
        message: `Your report "${report.title}" has been closed. ${reason ? 'Reason: ' + reason : ''}`,
        relatedTo: {
          model: 'Report',
          id: report._id
        }
      });

      return report;
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Successfully closed ${reports.length} reports`,
      data: {
        closedCount: reports.length,
        reason: reason || 'No reason provided',
        reportIds: reports.map(r => r._id)
      }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    next(new ApiError('Failed to bulk close reports', 500));
  }
};

/**
 * Advanced search and filtering for reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.advancedReportSearch = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      priority,
      assignedTo,
      submittedBy,
      dateFrom,
      dateTo,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      hasImages,
      hasFeedback
    } = req.query;

    // Build query object
    const query = {};

    // Text search across title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        query.priority = { $in: priority };
      } else {
        query.priority = priority;
      }
    }

    // Assignment filter
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        query.assignedTo = assignedTo;
      }
    }

    // Submitter filter
    if (submittedBy && mongoose.Types.ObjectId.isValid(submittedBy)) {
      query.submittedBy = submittedBy;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Location filter (city-based)
    if (location) {
      query['location.address.city'] = { $regex: location, $options: 'i' };
    }

    // Images filter
    if (hasImages !== undefined) {
      if (hasImages === 'true') {
        query['images.0'] = { $exists: true };
      } else if (hasImages === 'false') {
        query['images.0'] = { $exists: false };
      }
    }

    // Feedback filter
    if (hasFeedback !== undefined) {
      if (hasFeedback === 'true') {
        query['feedback.rating'] = { $exists: true };
      } else if (hasFeedback === 'false') {
        query['feedback.rating'] = { $exists: false };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries in parallel
    const [reports, totalReports, aggregateStats] = await Promise.all([
      Report.find(query)
        .populate('submittedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('timeline.updatedBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),

      Report.countDocuments(query),

      // Get aggregate statistics for the filtered results
      Report.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            statusBreakdown: {
              $push: '$status'
            },
            categoryBreakdown: {
              $push: '$category'
            },
            priorityBreakdown: {
              $push: '$priority'
            },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'resolved'] },
                  { $subtract: ['$updatedAt', '$createdAt'] },
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            totalReports: 1,
            statusCounts: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: ['$statusBreakdown', []] },
                  as: 'status',
                  in: {
                    k: '$$status',
                    v: {
                      $size: {
                        $filter: {
                          input: '$statusBreakdown',
                          cond: { $eq: ['$$this', '$$status'] }
                        }
                      }
                    }
                  }
                }
              }
            },
            categoryCounts: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: ['$categoryBreakdown', []] },
                  as: 'category',
                  in: {
                    k: '$$category',
                    v: {
                      $size: {
                        $filter: {
                          input: '$categoryBreakdown',
                          cond: { $eq: ['$$this', '$$category'] }
                        }
                      }
                    }
                  }
                }
              }
            },
            priorityCounts: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: ['$priorityBreakdown', []] },
                  as: 'priority',
                  in: {
                    k: '$$priority',
                    v: {
                      $size: {
                        $filter: {
                          input: '$priorityBreakdown',
                          cond: { $eq: ['$$this', '$$priority'] }
                        }
                      }
                    }
                  }
                }
              }
            },
            avgResolutionHours: {
              $cond: [
                { $ne: ['$avgResolutionTime', null] },
                { $divide: ['$avgResolutionTime', 1000 * 60 * 60] },
                0
              ]
            }
          }
        }
      ])
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalReports / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Format aggregate statistics
    const stats = aggregateStats[0] || {
      totalReports: 0,
      statusCounts: {},
      categoryCounts: {},
      priorityCounts: {},
      avgResolutionHours: 0
    };

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        statistics: stats,
        filters: {
          search,
          status,
          category,
          priority,
          assignedTo,
          submittedBy,
          dateFrom,
          dateTo,
          location,
          hasImages,
          hasFeedback,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    next(new ApiError('Failed to perform advanced search', 500));
  }
};
