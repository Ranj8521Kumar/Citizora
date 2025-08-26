import { processImageArray } from '../utils/imageHelper';

// API endpoints from environment variables
const REMOTE_API_URL = import.meta.env.VITE_REMOTE_API_URL;
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;

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
      // Store the base URL in localStorage for image helper
      localStorage.setItem('apiBaseUrl', this.baseURL);
    } catch (error) {
      console.warn('⚠️ Remote server connection failed, switching to local:', error.message);
      this.baseURL = LOCAL_API_URL;
      console.log('🔄 Using local API URL:', this.baseURL);
      // Store the updated base URL in localStorage
      localStorage.setItem('apiBaseUrl', this.baseURL);
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
    
    // Properly merge headers from options with default headers
    const defaultHeaders = this.getHeaders();
    const mergedHeaders = {
      ...defaultHeaders,
      ...(options.headers || {})
    };
    
    const config = {
      ...options,
      headers: mergedHeaders
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
  
  async validateResetToken(token) {
    // You can create a lightweight endpoint just to validate the token
    // without changing the password, or use a HEAD request
    // This is optional and depends on your backend implementation
    return await this.request(`/auth/validate-reset-token/${token}`, {
      method: 'GET',
    });
  }
  
  async resetPassword(token, password) {
    try {
      console.log(`Resetting password with token: ${token}`);
      return await this.request(`/auth/reset-password/${token}`, {
        method: 'PATCH',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      console.error('Reset password API error:', error);
      throw error;
    }
  }

  // Report methods
  async getReports(filters = {}) {
    try {
      // Ensure we're always getting fresh data by adding a timestamp if not already present
      if (!filters._t) {
        filters._t = new Date().getTime();
      }
      
      const queryParams = new URLSearchParams(filters).toString();
      // Add includeImages=true parameter to ensure we get all images including those from field workers
      const endpointWithImages = queryParams 
        ? `/reports?${queryParams}&includeImages=true` 
        : '/reports?includeImages=true';
      
      // Add cache-busting headers to ensure we get fresh data
      const options = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const response = await this.request(endpointWithImages, options);
      
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
      
        // Process each report to ensure images are properly formatted
      reports = reports.map(report => {
        // Ensure report has both regular images and progressImages arrays
        if (!report.images) report.images = [];
        if (!report.progressImages) report.progressImages = [];
        
        // Format image URLs to ensure they have the full path
        if (report.images && Array.isArray(report.images)) {
          // Use the utility function to process all images
          report.images = processImageArray(report.images);
        }
        
        // Debugging images
        console.log(`Report ${report._id} images:`, report.images);        // Process progress updates and timeline entries
        if (report.progressUpdates && Array.isArray(report.progressUpdates)) {
          // Extract images from progress updates and add them to progressImages
          report.progressUpdates.forEach(update => {
            if (update.images && Array.isArray(update.images)) {
              // Use the utility function to process all images
              const formattedImages = processImageArray(update.images);
              
              console.log(`Adding progress images from update:`, formattedImages);
              report.progressImages.push(...formattedImages);
            }
          });
        }
        
        // Normalize and enhance timeline data
        let timeline = [];
        
        // First check for progressUpdates (field worker updates)
        if (report.progressUpdates && Array.isArray(report.progressUpdates)) {
          report.progressUpdates.forEach(update => {
            timeline.push({
              type: 'progress',
              status: update.status || 'in_progress',
              timestamp: update.timestamp || update.date || update.createdAt,
              comment: update.comment || update.description || 'Progress update',
              images: update.images || [],
              updatedBy: update.updatedBy || 'Field Worker'
            });
          });
        }
        
        // Then check for statusUpdates
        if (report.statusUpdates && Array.isArray(report.statusUpdates)) {
          report.statusUpdates.forEach(update => {
            timeline.push({
              type: 'status',
              status: update.status || report.status,
              timestamp: update.timestamp || update.date || update.createdAt,
              comment: update.comment || update.description || `Status changed to ${update.status || report.status}`,
              images: update.images || [],
              updatedBy: update.updatedBy || 'System'
            });
          });
        }
        
        // Then check for general timeline
        if (report.timeline && Array.isArray(report.timeline)) {
          report.timeline.forEach(entry => {
            timeline.push({
              type: entry.type || 'update',
              status: entry.status || report.status,
              timestamp: entry.timestamp || entry.date || entry.createdAt,
              comment: entry.comment || entry.description || 'Status update',
              images: entry.images || [],
              updatedBy: entry.updatedBy || 'System'
            });
          });
        }
        
        // Sort timeline by timestamp
        timeline.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          return dateA - dateB;
        });
        
        // Add initial submission entry if it doesn't exist
        if (timeline.length === 0 || (timeline[0]?.timestamp && new Date(timeline[0].timestamp) > new Date(report.createdAt || report.date))) {
          timeline.unshift({
            type: 'submission',
            status: 'submitted',
            timestamp: report.createdAt || report.date,
            comment: 'Report submitted',
            images: report.images || [],
            updatedBy: report.createdBy || report.author || 'Citizen'
          });
        }
        
        // Assign normalized timeline to the report
        report.timeline = timeline;
        
        return report;
      });
      
      console.log('Extracted reports with images:', reports);
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
    console.log(`Preparing to upload ${images.length} images for report ${id}`);
    
    const formData = new FormData();
    images.forEach((image, index) => {
      // For Blob objects from base64 conversion
      if (image instanceof Blob) {
        formData.append('images', image, `image-${index}.jpg`);
        console.log(`Appended Blob image ${index} to form data`);
      } 
      // For File objects from direct file input
      else if (image instanceof File) {
        formData.append('images', image);
        console.log(`Appended File image ${index} to form data: ${image.name}`);
      }
      // For string URLs (shouldn't happen in this flow, but just in case)
      else if (typeof image === 'string') {
        console.warn(`Image ${index} is a string URL, not a file. This may not work correctly.`);
        // We'll skip this as backend expects multipart file uploads, not URLs
      }
    });

    try {
      console.log(`Sending ${images.length} images to ${this.baseURL}/reports/${id}/images`);
      
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
      
      const result = await response.json();
      console.log('Image upload response:', result);
      
      // Make sure the response contains an images array
      if (result && !result.images && result.data && result.data.images) {
        result.images = result.data.images;
      } else if (result && !result.images && result.report && result.report.images) {
        result.images = result.report.images;
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // Get all comments for a report
  async getReportComments(reportId) {
    return await this.request(`/reports/${reportId}/comments`);
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
