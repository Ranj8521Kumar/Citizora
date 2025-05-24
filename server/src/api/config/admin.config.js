/**
 * Admin Panel Configuration
 * Configuration settings for admin panel features
 */

module.exports = {
  // Dashboard settings
  dashboard: {
    // Default timeframe for analytics
    defaultTimeframe: '30d',
    
    // Available timeframes
    availableTimeframes: ['7d', '30d', '90d', '1y'],
    
    // Refresh interval for real-time data (in milliseconds)
    refreshInterval: 30000, // 30 seconds
    
    // Maximum number of items in charts
    maxChartItems: 10,
    
    // Cache duration for analytics data (in seconds)
    cacheDuration: 300 // 5 minutes
  },

  // User management settings
  userManagement: {
    // Default pagination settings
    defaultPageSize: 20,
    maxPageSize: 100,
    
    // Available user roles
    availableRoles: ['user', 'employee', 'admin'],
    
    // Fields that can be searched
    searchableFields: ['firstName', 'lastName', 'email'],
    
    // Fields that can be sorted
    sortableFields: ['firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'lastLogin'],
    
    // Default sort field and order
    defaultSort: {
      field: 'createdAt',
      order: 'desc'
    }
  },

  // Bulk operations settings
  bulkOperations: {
    // Maximum number of items that can be processed in a single bulk operation
    maxBatchSize: 100,
    
    // Available bulk operations
    availableOperations: [
      'updateStatus',
      'assignReports',
      'deleteReports'
    ],
    
    // Valid report statuses for bulk updates
    validReportStatuses: [
      'submitted',
      'in_review', 
      'assigned',
      'in_progress',
      'resolved',
      'closed'
    ],
    
    // Timeout for bulk operations (in milliseconds)
    operationTimeout: 60000 // 1 minute
  },

  // Search and filtering settings
  search: {
    // Default pagination for search results
    defaultPageSize: 20,
    maxPageSize: 50,
    
    // Available search filters
    availableFilters: {
      status: ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed'],
      category: ['road_issue', 'water_issue', 'electricity_issue', 'waste_management', 'public_safety', 'other'],
      priority: ['low', 'medium', 'high', 'critical'],
      hasImages: ['true', 'false'],
      hasFeedback: ['true', 'false']
    },
    
    // Fields that can be searched with text
    textSearchFields: ['title', 'description'],
    
    // Fields that can be sorted
    sortableFields: [
      'createdAt',
      'updatedAt',
      'title',
      'status',
      'category',
      'priority'
    ],
    
    // Default sort settings
    defaultSort: {
      field: 'createdAt',
      order: 'desc'
    },
    
    // Maximum date range for filtering (in days)
    maxDateRange: 365
  },

  // Statistics settings
  statistics: {
    // Available time periods for statistics
    availablePeriods: ['24h', '7d', '30d', '90d'],
    
    // Default period
    defaultPeriod: '30d',
    
    // Cache duration for statistics (in seconds)
    cacheDuration: 600, // 10 minutes
    
    // Maximum number of geographic locations to show
    maxGeographicItems: 10,
    
    // Performance metrics settings
    performance: {
      // Resolution time thresholds (in hours)
      thresholds: {
        excellent: 24,
        good: 72,
        average: 168,
        poor: 336
      }
    }
  },

  // Notification settings for admin actions
  notifications: {
    // Enable notifications for admin actions
    enabled: true,
    
    // Types of admin actions that trigger notifications
    notificationTriggers: {
      userStatusChange: true,
      userRoleChange: true,
      bulkReportUpdate: true,
      bulkReportAssignment: true,
      bulkReportDeletion: true
    },
    
    // Notification priorities
    priorities: {
      userDeactivation: 'high',
      roleChange: 'normal',
      bulkOperations: 'normal'
    }
  },

  // Security settings
  security: {
    // Rate limiting for admin endpoints
    rateLimit: {
      // Analytics endpoints
      analytics: {
        windowMs: 60000, // 1 minute
        max: 100 // requests per window
      },
      
      // Bulk operations
      bulkOperations: {
        windowMs: 60000, // 1 minute
        max: 50 // requests per window
      },
      
      // Search endpoints
      search: {
        windowMs: 60000, // 1 minute
        max: 200 // requests per window
      }
    },
    
    // Audit logging
    auditLog: {
      enabled: true,
      logLevel: 'info',
      includeRequestBody: true,
      includeResponseBody: false
    },
    
    // Session settings
    session: {
      // Maximum session duration (in milliseconds)
      maxDuration: 8 * 60 * 60 * 1000, // 8 hours
      
      // Session refresh threshold (in milliseconds)
      refreshThreshold: 30 * 60 * 1000 // 30 minutes
    }
  },

  // Export settings
  export: {
    // Available export formats
    availableFormats: ['csv', 'xlsx', 'json'],
    
    // Maximum number of records that can be exported at once
    maxRecords: 10000,
    
    // Export file retention period (in days)
    retentionPeriod: 7,
    
    // Temporary file storage path
    tempPath: '/tmp/exports'
  },

  // UI settings
  ui: {
    // Theme settings
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      successColor: '#4caf50',
      warningColor: '#ff9800',
      errorColor: '#f44336'
    },
    
    // Chart settings
    charts: {
      defaultType: 'bar',
      animationDuration: 300,
      colors: [
        '#1976d2', '#dc004e', '#4caf50', '#ff9800', 
        '#f44336', '#9c27b0', '#607d8b', '#795548'
      ]
    },
    
    // Table settings
    tables: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      showPagination: true,
      showSearch: true,
      showFilters: true
    }
  },

  // API settings
  api: {
    // Base URL for admin API endpoints
    baseUrl: '/api/admin',
    
    // Request timeout (in milliseconds)
    timeout: 30000,
    
    // Retry settings
    retry: {
      attempts: 3,
      delay: 1000 // milliseconds
    },
    
    // Response compression
    compression: {
      enabled: true,
      threshold: 1024 // bytes
    }
  }
};
