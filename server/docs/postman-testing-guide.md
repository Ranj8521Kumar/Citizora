# Postman Testing Guide for Admin Panel Features

This guide will walk you through testing the Advanced Admin Panel Features using Postman step by step.

## Prerequisites

1. **Server Running**: Make sure your CivicConnect server is running on `http://localhost:5000`
2. **Database**: Ensure MongoDB is connected and has some test data
3. **Admin User**: You need an admin user account to test admin features
4. **Postman**: Have Postman installed and ready

## Step 1: Start the Server

First, make sure your server is running:

```bash
cd server
npm start
```

You should see output like:
```
Server running on port 5000
Connected to MongoDB
Socket.IO server initialized
```

## Step 2: Import the Postman Collection

1. Open Postman
2. Click "Import" button
3. Select "Upload Files"
4. Navigate to your project folder: `server/Admin_Panel_Tests.postman_collection.json`
5. Click "Import"

You should now see "CivicConnect Admin Panel Tests" collection in your Postman sidebar.

## Step 3: Set Up Environment Variables

1. Click on the collection name "CivicConnect Admin Panel Tests"
2. Go to the "Variables" tab
3. Set the following variables:
   - `base_url`: `http://localhost:5000` (should be pre-filled)
   - `admin_token`: (leave empty for now, will be auto-filled)
   - `user_id`: (leave empty for now, will be auto-filled)
   - `report_id`: (leave empty for now, will be auto-filled)

## Step 4: Create an Admin User (if needed)

If you don't have an admin user, create one using the script:

```bash
cd server
node scripts/create-admin.js
```

This will create an admin user with:
- Email: `admin@civicconnect.com`
- Password: `Admin@123456`

## Step 5: Test Authentication

### 5.1 Login as Admin

1. Expand "1. Authentication" folder
2. Click "Login as Admin"
3. Verify the request body has correct admin credentials:
   ```json
   {
     "email": "admin@civicconnect.com",
     "password": "Admin@123456"
   }
   ```
4. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Response should contain:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "user": {
        "role": "admin",
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  }
  ```
- The `admin_token` variable should be automatically set

## Step 6: Test Dashboard Analytics

### 6.1 Get Dashboard Analytics - 30 days

1. Expand "2. Dashboard Analytics" folder
2. Click "Get Dashboard Analytics - 30 days"
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Response should contain:
  ```json
  {
    "success": true,
    "data": {
      "overview": {
        "totalUsers": 150,
        "totalReports": 89,
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
      "timeframe": "30d"
    }
  }
  ```

### 6.2 Test Different Timeframes

1. Click "Get Dashboard Analytics - 7 days"
2. Click "Send"
3. Verify the `timeframe` in response is "7d"

**Try other timeframes by modifying the query parameter:**
- `timeframe=90d`
- `timeframe=1y`

## Step 7: Test User Management

### 7.1 Get All Users

1. Expand "3. User Management" folder
2. Click "Get All Users"
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Response should contain users array and pagination info
- The `user_id` variable should be automatically set from the first user

### 7.2 Search Users

1. Click "Search Users"
2. Click "Send"
3. This searches for users with "admin" in their name and role "admin"

**Try different search parameters:**
- Change `search` to any name or email
- Change `role` to "user" or "employee"
- Add `isActive=true` or `isActive=false`

### 7.3 Toggle User Status

1. Click "Toggle User Status"
2. Verify the request body:
   ```json
   {
     "isActive": false
   }
   ```
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- User status should be updated
- A notification should be created for the user

### 7.4 Update User Role

1. Click "Update User Role"
2. Verify the request body:
   ```json
   {
     "role": "employee"
   }
   ```
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- User role should be updated
- A notification should be created for the user

## Step 8: Test System Statistics

### 8.1 Get System Statistics

1. Expand "4. System Statistics" folder
2. Click "Get System Statistics - 30 days"
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Response should contain comprehensive statistics:
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
      "period": "30d"
    }
  }
  ```

## Step 9: Test Advanced Search

### 9.1 Basic Advanced Search

1. Expand "5. Advanced Search" folder
2. Click "Advanced Report Search"
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Response should contain reports, pagination, statistics, and filters
- The `report_id` variable should be automatically set

### 9.2 Search with Filters

1. Click "Search with Filters"
2. Click "Send"
3. This searches for reports with specific criteria

**Try different filter combinations:**
- `status=submitted,in_review` (multiple statuses)
- `category=water_issue`
- `priority=critical`
- `hasImages=false`
- `hasFeedback=true`
- `dateFrom=2024-01-01&dateTo=2024-01-31`
- `location=New York`

## Step 10: Test Bulk Operations

### 10.1 Bulk Update Report Status

1. Expand "6. Bulk Operations" folder
2. Click "Bulk Update Report Status"
3. Verify the request body uses the `report_id` variable:
   ```json
   {
     "reportIds": ["{{report_id}}"],
     "status": "in_review",
     "comment": "Bulk review initiated via Postman test"
   }
   ```
4. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Reports should be updated to "in_review" status
- Timeline events should be created

### 10.2 Bulk Assign Reports

1. Click "Bulk Assign Reports"
2. Make sure you have a valid employee user ID
3. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Reports should be assigned to the specified user
- Notifications should be created

### 10.3 Bulk Delete Reports

1. Click "Bulk Delete Reports"
2. Click "Send"

**Expected Result:**
- Status: `200 OK`
- Reports should be marked as "closed"
- Notifications should be sent to report submitters

## Step 11: Error Testing

Test error scenarios to ensure proper error handling:

### 11.1 Test Without Authentication

1. Remove the Authorization header from any request
2. Click "Send"
3. Should get `401 Unauthorized`

### 11.2 Test Invalid Data

1. Try bulk operations with invalid report IDs
2. Try updating user role with invalid role
3. Try searching with invalid date ranges

### 11.3 Test Permission Errors

1. Try admin operations with a non-admin user token
2. Should get `403 Forbidden`

## Step 12: Performance Testing

### 12.1 Test Large Data Sets

1. Create multiple reports and users in your database
2. Test pagination with large datasets
3. Test search performance with various filters

### 12.2 Test Concurrent Requests

1. Use Postman's Collection Runner
2. Run multiple requests simultaneously
3. Verify response times and data consistency

## Troubleshooting

### Common Issues:

1. **Server not responding**: Check if server is running on port 5000
2. **Authentication failed**: Verify admin credentials are correct
3. **Database errors**: Ensure MongoDB is running and connected
4. **Variables not set**: Check if collection variables are properly configured

### Debug Steps:

1. Check server console for error messages
2. Verify request headers include proper Authorization
3. Check request body format (JSON)
4. Verify database has test data

## Expected Response Times

- Authentication: < 500ms
- Dashboard Analytics: < 2000ms
- User Management: < 1000ms
- System Statistics: < 3000ms
- Advanced Search: < 1500ms
- Bulk Operations: < 5000ms

## Next Steps

After successful testing:

1. Test with real production-like data volumes
2. Implement frontend integration
3. Set up monitoring and logging
4. Configure rate limiting
5. Add API documentation with Swagger

This completes the comprehensive testing of all Advanced Admin Panel Features!
