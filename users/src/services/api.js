// Primary API endpoint
const REMOTE_API_URL = 'https://civic-connect-backend-aq2a.onrender.com/api';
// Fallback to local API for development
const LOCAL_API_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    // Start with remote URL, will fall back to local if needed
    this.baseURL = REMOTE_API_URL;
    this.token = localStorage.getItem('token');
    
    // Check server connectivity and switch to local if needed
    this.checkServerConnection();
  }
  
  async checkServerConnection() {
    try {
      console.log('🔄 Testing connection to:', this.baseURL);
      const healthUrl = this.baseURL.replace('/api', '/health');
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      console.log('✅ Connected to remote server');
    } catch (error) {
      console.warn('⚠️ Remote server connection failed, switching to local:', error.message);
      this.baseURL = LOCAL_API_URL;
      console.log('🔄 Using local API URL:', this.baseURL);
    }
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
    
    // Get fresh token from localStorage in case it was updated elsewhere
    const token = localStorage.getItem('token') || this.token;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      this.token = token; // Keep instance token updated
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log('🔑 Headers:', config.headers);
    if (options.body) {
      console.log('📦 Request Body:', options.body);
    }

    try {
      const response = await fetch(url, config);
      console.log(`📡 Response Status:`, response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🚫 API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Response Data:`, data);
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
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

  async register(firstName, lastName, email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return {
      user: response.data?.user || response.user,
      token: response.token
    };
  }

  async forgotPassword(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Report methods
  async getReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reports?${queryParams}` : '/reports';
      
      const response = await this.request(endpoint);
      
      console.log('API getReports response:', response);
      
      // Handle different response structures
      let reports = [];
      
      if (Array.isArray(response)) {
        reports = response;
      } else if (response.data) {
        // Check if data is an array or contains reports array
        if (Array.isArray(response.data)) {
          reports = response.data;
        } else if (Array.isArray(response.data.reports)) {
          reports = response.data.reports;
        } else if (typeof response.data === 'object') {
          // Sometimes data might be the reports array directly
          reports = [response.data];
        }
      } else if (response.reports && Array.isArray(response.reports)) {
        reports = response.reports;
      }
      
      // In the specific API format shown in the logs
      if (reports.length === 0 && response.count > 0 && response.data) {
        console.log("Found reports in the API response data property");
        reports = response.data;
      }
      
      console.log('Extracted reports:', reports);
      return reports;
    } catch (error) {
      console.error('Failed to fetch reports from API:', error.message);
      // Return empty array on error instead of mock data
      return [];
    }
  }

  async getReportById(id) {
    return await this.request(`/reports/${id}`);
  }

  async createReport(reportData) {
    console.log('Sending report data to backend:', JSON.stringify(reportData, null, 2));
    return await this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReportStatus(id, status) {
    return await this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async addFeedback(id, feedback) {
    return await this.request(`/reports/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async uploadReportImages(id, images) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const url = `${this.baseURL}/reports/${id}/images`;
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // User methods
  async getCurrentUser() {
    const response = await this.request('/users/me');
    return response.data?.user || response.user || response;
  }

  async updateProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
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

  // Get active citizens data
  async getActiveCitizens() {
    return await this.request('/users/active-citizens', {
      method: 'GET',
    });
  }
}

export default new ApiService();
