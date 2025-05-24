# Admin Panel API Documentation

This document describes the advanced admin panel features implemented for the CivicConnect backend.

## Overview

The admin panel provides comprehensive management capabilities including:
- Dashboard analytics with real-time metrics
- User management (activate/deactivate, role updates)
- System statistics and reporting
- Bulk operations for reports
- Advanced filtering and search

## Authentication

All admin endpoints require:
1. Valid JWT token in Authorization header: `Bearer <token>`
2. User role must be 'admin'

## Endpoints

### 1. Dashboard Analytics

**GET** `/api/admin/dashboard/analytics`

Get comprehensive dashboard analytics data.

**Query Parameters:**
- `timeframe` (optional): `7d`, `30d`, `90d`, `1y` (default: `30d`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalReports": 89,
      "totalNotifications": 245,
      "activeUsers": 45,
      "recentReports": 12,
      "userGrowthRate": 13.48,
      "resolutionRate": 67.42,
      "averageResolutionHours": 48
    },
    "charts": {
      "reportsByStatus": [...],
      "reportsByCategory": [...],
      "reportsByPriority": [...],
      "usersByRole": [...],
      "reportsOverTime": [...]
    },
    "timeframe": "30d",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. User Management

#### Get All Users
**GET** `/api/admin/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (`user`, `employee`, `admin`)
- `isActive` (optional): Filter by status (`true`, `false`)
- `search` (optional): Search in firstName, lastName, email
- `sortBy` (optional): Sort field (default: `createdAt`)
- `sortOrder` (optional): `asc` or `desc` (default: `desc`)

#### Toggle User Status
**PATCH** `/api/admin/users/:userId/status`

**Body:**
```json
{
  "isActive": true
}
```

#### Update User Role
**PATCH** `/api/admin/users/:userId/role`

**Body:**
```json
{
  "role": "employee"
}
```

### 3. System Statistics

**GET** `/api/admin/statistics`

Get comprehensive system statistics and reports.

**Query Parameters:**
- `period` (optional): `24h`, `7d`, `30d`, `90d` (default: `30d`)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 142,
      "byRole": [...],
      "recentRegistrations": 8,
      "recentActivity": 45
    },
    "reports": {
      "total": 89,
      "byStatus": [...],
      "byCategory": [...],
      "byPriority": [...],
      "recent": 12,
      "assigned": 67
    },
    "performance": {
      "averageResolutionHours": 48,
      "minResolutionHours": 2,
      "maxResolutionHours": 168,
      "totalResolved": 60
    },
    "geographic": [...],
    "timeline": [...],
    "period": "30d",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Bulk Operations

#### Bulk Update Report Status
**POST** `/api/admin/reports/bulk-update-status`

**Body:**
```json
{
  "reportIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "status": "in_review",
  "comment": "Bulk review initiated"
}
```

#### Bulk Assign Reports
**POST** `/api/admin/reports/bulk-assign`

**Body:**
```json
{
  "reportIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "assigneeId": "507f1f77bcf86cd799439013"
}
```

#### Bulk Delete Reports
**POST** `/api/admin/reports/bulk-delete`

**Body:**
```json
{
  "reportIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "reason": "Duplicate reports"
}
```

### 5. Advanced Search

**GET** `/api/admin/reports/search`

Advanced search and filtering for reports with comprehensive query options.

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Text search in title and description
- `status`: Filter by status (single or array)
- `category`: Filter by category (single or array)
- `priority`: Filter by priority (single or array)
- `assignedTo`: Filter by assignee ID or "unassigned"
- `submittedBy`: Filter by submitter ID
- `dateFrom`, `dateTo`: Date range filter
- `location`: Filter by city name
- `hasImages`: Filter reports with/without images (`true`/`false`)
- `hasFeedback`: Filter reports with/without feedback (`true`/`false`)
- `sortBy`, `sortOrder`: Sorting options

**Example:**
```
GET /api/admin/reports/search?status=submitted,in_review&category=road_issue&hasImages=true&dateFrom=2024-01-01&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalReports": 89,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "statistics": {
      "totalReports": 89,
      "statusCounts": {...},
      "categoryCounts": {...},
      "priorityCounts": {...},
      "avgResolutionHours": 48
    },
    "filters": {
      "search": "road",
      "status": ["submitted", "in_review"],
      "category": "road_issue",
      "hasImages": "true",
      "dateFrom": "2024-01-01",
      ...
    }
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "message": "Detailed error message"
  }
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Rate Limiting

Admin endpoints are subject to rate limiting to prevent abuse. Current limits:
- 100 requests per minute per IP for analytics endpoints
- 50 requests per minute per IP for bulk operations

## Security Considerations

1. All admin operations are logged for audit purposes
2. Sensitive operations (user deactivation, bulk operations) create notifications
3. Admins cannot perform certain actions on themselves (role change, deactivation)
4. All input is validated and sanitized
5. MongoDB injection protection is implemented

## Performance Notes

1. Analytics queries use MongoDB aggregation pipelines for optimal performance
2. Bulk operations are processed in parallel where possible
3. Search queries use appropriate indexes for fast execution
4. Pagination is implemented to handle large datasets efficiently
