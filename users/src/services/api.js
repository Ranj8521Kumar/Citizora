const API_BASE_URL = 'https://civic-connect-backend-aq2a.onrender.com/api';

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
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/reports?${queryParams}` : '/reports';
    const response = await this.request(endpoint);
    
    // Extract reports array from response data
    return response.data?.reports || [];
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
    images.forEach((image, index) => {
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
