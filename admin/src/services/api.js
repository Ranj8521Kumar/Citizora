// API service for the admin panel

const API_BASE_URL = 'https://civic-connect-backend-aq2a.onrender.com/api'; // Change to your actual backend URL

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Refresh token from localStorage in case it was updated elsewhere
    this.token = localStorage.getItem('token');
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    console.log('Request headers:', headers); // Debug log
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Log the complete URL for debugging
    console.log(`Making API request to: ${url}`);
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to parse error response if possible
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData;
        
        try {
          errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Failed to parse JSON, use default error message
        }
        
        console.error(`API error: ${errorMessage}`);
        const error = new Error(errorMessage);
        error.response = {
          status: response.status,
          data: errorData || { message: errorMessage }
        };
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return {
      user: response.data?.user || response.user,
      token: response.token
    };
  }

  async getCurrentUser() {
    const response = await this.request('/users/me');
    return response.data?.user || response.user;
  }

  // Admin-specific methods
  async getDashboardAnalytics(timeframe = '30d') {
    return await this.request(`/admin/dashboard/analytics?timeframe=${timeframe}`);
  }

  async getAllUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/admin/users?${queryParams}` : '/admin/users';
      const response = await this.request(endpoint);
      
      // Ensure response has expected structure
      if (!response.users && response.data && response.data.users) {
        response.users = response.data.users;
      } else if (!response.users) {
        // Provide default structure if users not found
        response.users = [];
      }
      
      // Ensure all users have an id field
      if (Array.isArray(response.users)) {
        response.users = response.users.map(user => {
          // If no id field exists, try to find it from alternatives or generate one
          if (!user.id) {
            // Try to get ID from _id or userId fields
            user.id = user._id || user.userId || `temp-${Math.random().toString(36).substr(2, 9)}`;
          }
          return user;
        });
      }
      
      // Ensure stats structure exists
      if (!response.stats) {
        response.stats = {
          citizenCount: 0,
          citizenGrowth: 0,
          fieldWorkerCount: 0,
          fieldWorkerGrowth: 0,
          adminCount: 0,
          adminGrowth: 0,
          inactiveCount: 0,
          inactiveGrowth: 0
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Return a valid default response structure
      return {
        users: [],
        stats: {
          citizenCount: 0,
          citizenGrowth: 0,
          fieldWorkerCount: 0,
          fieldWorkerGrowth: 0,
          adminCount: 0,
          adminGrowth: 0,
          inactiveCount: 0,
          inactiveGrowth: 0
        }
      };
    }
  }

  async toggleUserStatus(userId, isActive) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateUserRole(userId, role) {
    if (!userId) {
      throw new Error("Cannot update role: User ID is required");
    }
    
    try {
      return await this.request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error(`Failed to update role for user ${userId} to ${role}:`, error);
      throw new Error("Failed to update user role");
    }
  }

  async getSystemStatistics() {
    return await this.request('/admin/statistics');
  }

  async getAnalyticsData(timeframe = '30d') {
    try {
      const response = await this.request(`/admin/dashboard/analytics?timeframe=${timeframe}`);
      
      // Validate the response structure
      if (!response || !response.data) {
        console.warn('Analytics response missing or invalid');
        return { data: { overview: {}, charts: {} } };
      }
      
      // Create a deep copy to avoid modifying the original response
      const safeResponse = { ...response };
      safeResponse.data = { ...response.data };
      
      // Ensure the response has the expected structure to prevent errors
      if (!safeResponse.data.overview || typeof safeResponse.data.overview !== 'object') {
        safeResponse.data.overview = {};
      }
      
      if (!safeResponse.data.charts || typeof safeResponse.data.charts !== 'object') {
        safeResponse.data.charts = {};
      }
      
      if (!safeResponse.data.charts.reportsOverTime || !Array.isArray(safeResponse.data.charts.reportsOverTime)) {
        safeResponse.data.charts.reportsOverTime = [];
      }
      
      if (!safeResponse.data.charts.reportsByCategory || !Array.isArray(safeResponse.data.charts.reportsByCategory)) {
        safeResponse.data.charts.reportsByCategory = [];
      }
      
      // Ensure numeric values are valid numbers
      if (safeResponse.data.overview) {
        safeResponse.data.overview.totalReports = parseInt(safeResponse.data.overview.totalReports) || 0;
        safeResponse.data.overview.resolutionRate = parseFloat(safeResponse.data.overview.resolutionRate) || 0;
        safeResponse.data.overview.averageResolutionHours = parseFloat(safeResponse.data.overview.averageResolutionHours) || 0;
        safeResponse.data.overview.activeUsers = parseInt(safeResponse.data.overview.activeUsers) || 0;
      }
      
      return safeResponse;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Return a safe default structure
      return { data: { overview: {}, charts: {} } };
    }
  }

  async getCategoryBreakdown() {
    try {
      // Use the dashboard analytics endpoint since there's no separate categories endpoint
      const response = await this.request('/admin/dashboard/analytics');
      
      // Check if we have the required data
      if (response && response.data?.charts?.reportsByCategory && 
          Array.isArray(response.data.charts.reportsByCategory) && 
          response.data.overview?.totalReports) {
        
        // Ensure totalReports is a number and greater than 0 to avoid division by zero
        const totalReports = parseFloat(response.data.overview.totalReports) || 0;
        
        if (totalReports > 0) {
          return {
            categories: response.data.charts.reportsByCategory.map(cat => ({
              name: cat._id || 'Other',
              percentage: ((cat.count || 0) / totalReports * 100).toFixed(1)
            }))
          };
        }
      }
      
      // Return empty categories array if data is missing or invalid
      return { categories: [] };
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      return { categories: [] };
    }
  }

  async getResponseTimesByDepartment() {
    try {
      // Use the dashboard analytics endpoint and transform the data
      const response = await this.request('/admin/dashboard/analytics');
      
      // Check if we have valid response data
      if (response && response.data) {
        const avgTime = response.data?.overview?.averageResolutionHours || 0;
        
        // Create a placeholder response until backend implements specific endpoint
        return {
          departments: [
            { department: 'Public Works', avgTime: avgTime, target: 24 },
            { department: 'Transportation', avgTime: avgTime, target: 48 },
            { department: 'Parks & Rec', avgTime: avgTime, target: 72 }
          ]
        };
      } else {
        console.warn('Missing or invalid data in analytics response for department response times');
        return { departments: [] };
      }
    } catch (error) {
      console.error('Error fetching response times by department:', error);
      return { departments: [] };
    }
  }

  async getGeographicDistribution() {
    try {
      // Use the dashboard analytics endpoint and transform the data
      const response = await this.request('/admin/dashboard/analytics');
      
      // Check if we have valid data
      if (response.data) {
        // Create a placeholder response until backend implements specific endpoint
        return {
          districts: [
            { district: 'Downtown', reports: 35, population: 15000 },
            { district: 'North Side', reports: 28, population: 22000 },
            { district: 'West End', reports: 42, population: 18000 },
            { district: 'East Side', reports: 19, population: 12000 },
            { district: 'South District', reports: 31, population: 20000 }
          ]
        };
      } else {
        console.warn('Invalid or missing data in analytics response');
        return { districts: [] };
      }
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      return { districts: [] };
    }
  }

  async advancedReportSearch(filters = {}) {
    // Convert filters object to query string, ensuring undefined values are omitted
    const cleanedFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        cleanedFilters[key] = filters[key];
      }
    });
    
    const queryParams = new URLSearchParams(cleanedFilters).toString();
    console.log('Search query params:', queryParams);
    
    const endpoint = queryParams ? `/reports?${queryParams}` : '/reports';
    
    try {
      // First try the admin-specific endpoint
      const adminEndpoint = queryParams ? `/admin/reports/search?${queryParams}` : '/admin/reports/search';
      console.log('Requesting from admin endpoint:', this.baseURL + adminEndpoint);
      return await this.request(adminEndpoint);
    } catch (err) {
      console.log('Falling back to general reports endpoint:', err.message);
      // Fall back to the general reports endpoint if the admin endpoint fails
      return await this.request(endpoint);
    }
  }

  async bulkUpdateReportStatus(reportIds, status, comment = '') {
    return await this.request('/admin/reports/bulk-update-status', {
      method: 'POST',
      body: JSON.stringify({ reportIds, status, comment }),
    });
  }

  async bulkAssignReports(reportIds, employeeId, comment = '') {
    return await this.request('/admin/reports/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ reportIds, assigneeId: employeeId, comment }),
    });
  }

  async bulkDeleteReports(reportIds, comment = '') {
    return await this.request('/admin/reports/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ reportIds, comment }),
    });
  }

  // Individual report operations
  async getReportDetails(reportId) {
    return await this.request(`/reports/${reportId}`);
  }
  
  async updateReport(reportId, reportData) {
    // Use the new PATCH endpoint we've created
    return await this.request(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(reportData),
    });
  }
  
  async assignReport(reportId, assignData) {
    return await this.request(`/reports/${reportId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(assignData),
    });
  }
  
  async addReportComment(reportId, commentData) {
    return await this.request(`/reports/${reportId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }
  
  async getReportComments(reportId) {
    return await this.request(`/reports/${reportId}/comments`);
  }
  
  async deleteReport(reportId) {
    return await this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Health check method
  async healthCheck() {
    const url = `${this.baseURL.replace('/api', '')}/health`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Create a new user
  async createUser(userData) {
    try {
      // Let's try both endpoints to see which one works
      try {
        console.log('Attempting to create user with path: /api/admin/users');
        const response = await this.request('/admin/create', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        return {
          success: true,
          data: response.data || response.user
        };
      } catch (firstError) {
        console.log('First attempt failed:', firstError.message);
        console.log('Trying alternative path: /api/users');
        const response = await this.request('/api/users', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        return {
          success: true,
          data: response.data || response.user
        };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Delete a user (actually deactivates the user since deletion endpoint is not available)
  async deleteUser(userId) {
    if (!userId) {
      throw new Error("Cannot delete user: User ID is required");
    }
    
    try {
      console.log(`Attempting to deactivate user with ID: ${userId} (soft delete)`);
      
      // Since there's no DELETE endpoint, we'll use the toggle status endpoint to deactivate the user
      const response = await this.request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false }),
      });
      
      console.log('User deactivation response:', response);
      return {
        ...response,
        softDelete: true, // Flag to indicate this was a soft delete (deactivation)
        message: response.message || 'User was deactivated successfully'
      };
    } catch (error) {
      console.error(`Failed to deactivate user with ID ${userId}:`, error);
      throw error;
    }
  }
  
  // Send a message to a user
  async sendMessage(userId, messageData) {
    if (!userId) {
      throw new Error("Cannot send message: User ID is required");
    }
    
    if (!messageData.subject || !messageData.message) {
      throw new Error("Subject and message are required");
    }
    
    try {
      console.log(`Sending message to user with ID: ${userId}`, messageData);
      
      const response = await this.request('/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          subject: messageData.subject,
          message: messageData.message,
          type: 'message',
          priority: messageData.priority || 'normal',
          sendEmailOption: messageData.sendEmail || false
        })
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to send message to user with ID ${userId}:`, error);
      throw error;
    }
  }
}

export default new ApiService();