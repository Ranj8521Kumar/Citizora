/**
 * Admin Panel Features Test
 * Tests for the advanced admin panel functionality
 */



// Mock the models and middleware
jest.mock('../src/api/models/user.model');
jest.mock('../src/api/models/report.model');
jest.mock('../src/api/models/notification.model');
jest.mock('../src/api/middleware/auth.middleware');

const User = require('../src/api/models/user.model');
const Report = require('../src/api/models/report.model');
const Notification = require('../src/api/models/notification.model');
const adminController = require('../src/api/controllers/admin.controller');

describe('Admin Panel Features', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {

    mockReq = {
      user: {
        _id: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      },
      query: {},
      body: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Dashboard Analytics', () => {
    test('should return dashboard analytics data', async () => {
      // Mock the database queries
      User.countDocuments = jest.fn()
        .mockResolvedValueOnce(150) // totalUsers
        .mockResolvedValueOnce(45); // activeUsers

      Report.countDocuments = jest.fn()
        .mockResolvedValueOnce(89) // totalReports
        .mockResolvedValueOnce(12); // recentReports

      Notification.countDocuments = jest.fn().mockResolvedValue(245);

      Report.aggregate = jest.fn().mockResolvedValue([
        { _id: 'submitted', count: 25 },
        { _id: 'resolved', count: 60 }
      ]);

      User.aggregate = jest.fn().mockResolvedValue([
        { _id: 'user', count: 120 },
        { _id: 'employee', count: 25 },
        { _id: 'admin', count: 5 }
      ]);

      mockReq.query = { timeframe: '30d' };

      await adminController.getDashboardAnalytics(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            overview: expect.any(Object),
            charts: expect.any(Object),
            timeframe: '30d'
          })
        })
      );
    });

    test('should handle invalid timeframe gracefully', async () => {
      mockReq.query = { timeframe: 'invalid' };

      // Mock successful database calls
      User.countDocuments = jest.fn().mockResolvedValue(0);
      Report.countDocuments = jest.fn().mockResolvedValue(0);
      Notification.countDocuments = jest.fn().mockResolvedValue(0);
      Report.aggregate = jest.fn().mockResolvedValue([]);
      User.aggregate = jest.fn().mockResolvedValue([]);

      await adminController.getDashboardAnalytics(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('User Management', () => {
    test('should get all users with pagination', async () => {
      const mockUsers = [
        { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { _id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
      ];

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockUsers)
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(50);

      mockReq.query = { page: 1, limit: 20 };

      await adminController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: mockUsers,
            pagination: expect.objectContaining({
              currentPage: 1,
              totalPages: 3,
              totalUsers: 50
            })
          })
        })
      );
    });

    test('should toggle user status', async () => {
      const mockUser = {
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: false,
        save: jest.fn().mockResolvedValue()
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Notification.create = jest.fn().mockResolvedValue();

      mockReq.params = { userId: 'user123' };
      mockReq.body = { isActive: true };

      await adminController.toggleUserStatus(mockReq, mockRes, mockNext);

      expect(mockUser.isActive).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should prevent admin from deactivating themselves', async () => {
      const mockUser = {
        _id: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        isActive: true
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);

      mockReq.params = { userId: 'admin123' };
      mockReq.body = { isActive: false };

      await adminController.toggleUserStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You cannot deactivate your own account'
        })
      );
    });
  });

  describe('Bulk Operations', () => {
    test('should bulk update report status', async () => {
      const mockReports = [
        { _id: 'report1', title: 'Report 1', addTimelineEvent: jest.fn().mockResolvedValue() },
        { _id: 'report2', title: 'Report 2', addTimelineEvent: jest.fn().mockResolvedValue() }
      ];

      Report.find = jest.fn().mockResolvedValue(mockReports);
      Notification.create = jest.fn().mockResolvedValue();

      mockReq.body = {
        reportIds: ['report1', 'report2'],
        status: 'in_review',
        comment: 'Bulk review'
      };

      await adminController.bulkUpdateReportStatus(mockReq, mockRes, mockNext);

      expect(mockReports[0].addTimelineEvent).toHaveBeenCalledWith(
        'in_review',
        'Bulk review',
        'admin123'
      );
      expect(mockReports[1].addTimelineEvent).toHaveBeenCalledWith(
        'in_review',
        'Bulk review',
        'admin123'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should validate reportIds array', async () => {
      mockReq.body = {
        reportIds: [],
        status: 'in_review'
      };

      await adminController.bulkUpdateReportStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'reportIds must be a non-empty array'
        })
      );
    });
  });

  describe('Advanced Search', () => {
    test('should perform advanced search with filters', async () => {
      const mockReports = [
        { _id: 'report1', title: 'Road Issue', category: 'road_issue' }
      ];

      const mockAggregateResult = [{
        totalReports: 1,
        statusCounts: { submitted: 1 },
        categoryCounts: { road_issue: 1 },
        priorityCounts: { medium: 1 },
        avgResolutionHours: 24
      }];

      Report.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockReports)
                })
              })
            })
          })
        })
      });

      Report.countDocuments = jest.fn().mockResolvedValue(1);
      Report.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      mockReq.query = {
        search: 'road',
        category: 'road_issue',
        status: 'submitted',
        page: 1,
        limit: 20
      };

      await adminController.advancedReportSearch(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            reports: mockReports,
            pagination: expect.any(Object),
            statistics: expect.any(Object),
            filters: expect.any(Object)
          })
        })
      );
    });
  });

  describe('System Statistics', () => {
    test('should return comprehensive system statistics', async () => {
      // Mock all the aggregate queries
      User.aggregate = jest.fn().mockResolvedValue([{
        totalUsers: [{ count: 150 }],
        activeUsers: [{ count: 142 }],
        usersByRole: [{ _id: 'user', count: 120 }],
        recentRegistrations: [{ count: 8 }],
        lastLoginActivity: [{ count: 45 }]
      }]);

      Report.aggregate = jest.fn()
        .mockResolvedValueOnce([{
          totalReports: [{ count: 89 }],
          reportsByStatus: [{ _id: 'submitted', count: 25 }],
          reportsByCategory: [{ _id: 'road_issue', count: 30 }],
          reportsByPriority: [{ _id: 'medium', count: 45 }],
          recentReports: [{ count: 12 }],
          assignedReports: [{ count: 67 }]
        }])
        .mockResolvedValueOnce([{
          averageResolutionTime: 172800000, // 48 hours in milliseconds
          minResolutionTime: 7200000,
          maxResolutionTime: 604800000,
          totalResolved: 60
        }])
        .mockResolvedValueOnce([
          { _id: 'New York', count: 25, categories: ['road_issue'], avgPriority: 2.5 }
        ])
        .mockResolvedValueOnce([
          { _id: { year: 2024, month: 1, day: 15 }, reports: 5, resolved: 3 }
        ]);

      mockReq.query = { period: '30d' };

      await adminController.getSystemStatistics(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: expect.any(Object),
            reports: expect.any(Object),
            performance: expect.any(Object),
            geographic: expect.any(Array),
            timeline: expect.any(Array)
          })
        })
      );
    });
  });
});

describe('Admin Controller Functions Export', () => {
  test('should export all required admin functions', () => {
    expect(adminController.createAdmin).toBeDefined();
    expect(adminController.getAdmins).toBeDefined();
    expect(adminController.getDashboardAnalytics).toBeDefined();
    expect(adminController.getAllUsers).toBeDefined();
    expect(adminController.toggleUserStatus).toBeDefined();
    expect(adminController.updateUserRole).toBeDefined();
    expect(adminController.getSystemStatistics).toBeDefined();
    expect(adminController.bulkUpdateReportStatus).toBeDefined();
    expect(adminController.bulkAssignReports).toBeDefined();
    expect(adminController.bulkDeleteReports).toBeDefined();
    expect(adminController.advancedReportSearch).toBeDefined();
  });
});
