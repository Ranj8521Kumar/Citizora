/**
 * API Service for Employee Panel
 * Handles all API requests to the backend server
 */

// Base URL for API requests - make sure this is the correct server URL
const API_BASE_URL = 'https://civic-connect-backend-aq2a.onrender.com/api';

// API token management
let authToken = localStorage.getItem('auth_token');

/**
 * Set the authentication token for API requests
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Get the authentication token
 * @returns {string} JWT token
 */
export const getAuthToken = () => {
  return authToken;
};

/**
 * Generate common headers for API requests
 * @param {boolean} includeContentType - Whether to include Content-Type header
 * @returns {Object} Headers object
 */
const getHeaders = (includeContentType = true) => {
  const headers = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise} Promise that resolves to the response data
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      setAuthToken(null);
    }
    
    // Throw error with detailed message from API
    const errorMessage = data.message || 
      (data.errors ? JSON.stringify(data.errors) : 'An error occurred');
      
    console.error('API Error:', response.status, errorMessage, data);
    
    throw new Error(errorMessage);
  }
  
  return data;
};

/**
 * Login with credentials
 * @param {Object} credentials - User credentials
 * @returns {Promise} Promise that resolves to the user data
 */
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  
  const data = await handleResponse(response);
  
  if (data.token) {
    setAuthToken(data.token);
  }
  
  return data;
};

/**
 * Logout the current user
 */
export const logout = () => {
  setAuthToken(null);
};

/**
 * Get the current user's profile
 * @returns {Promise} Promise that resolves to the user data
 */
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getHeaders()
  });
  
  return handleResponse(response);
};

/**
 * Get all reports assigned to the field worker
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} Promise that resolves to the reports data
 */
export const getFieldWorkerReports = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.page) queryParams.append('page', params.page);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/fieldworker/reports${queryString}`, {
    method: 'GET',
    headers: getHeaders()
  });
  
  const result = await handleResponse(response);
  
  // Get the list of paused report IDs from local storage
  const pausedReports = JSON.parse(localStorage.getItem('pausedReports') || '{}');
  
  // Mark reports as paused if they're in the paused list
  if (result.data && result.data.reports) {
    result.data.reports = result.data.reports.map(report => {
      // If this report is paused, mark it as such in a special field
      if (pausedReports[report._id]) {
        report.isPaused = true;
        
        // Also check the timeline to verify this is still valid
        const lastTimelineEntry = report.timeline && report.timeline.length > 0
          ? report.timeline[report.timeline.length - 1]
          : null;
          
        // If the last timeline entry doesn't have "Task paused", remove from paused reports
        if (!lastTimelineEntry || !lastTimelineEntry.comment || !lastTimelineEntry.comment.includes('Task paused')) {
          delete pausedReports[report._id];
          localStorage.setItem('pausedReports', JSON.stringify(pausedReports));
          report.isPaused = false;
        }
      }
      return report;
    });
  }
  
  return result;
};

/**
 * Get a single report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise} Promise that resolves to the report data
 */
export const getReportById = async (reportId) => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  
  return handleResponse(response);
};

/**
 * Update the status of a report
 * @param {string} reportId - ID of the report
 * @param {string} status - New status (in_progress, resolved)
 * @param {string} comment - Optional comment
 * @returns {Promise} Promise that resolves to the updated report data
 */
export const updateReportStatus = async (reportId, status, comment = '') => {
  // Track if this is a pause operation
  const isPauseOperation = comment && comment.includes('Task paused');
  
  // Validate status before sending to API
  if (status !== 'in_progress' && status !== 'resolved') {
    console.warn(`Invalid status '${status}' being sent to API. Only 'in_progress' and 'resolved' are allowed.`);
    // Force status to be one of the allowed values
    status = 'in_progress';
  }
  
  console.log(`Updating report ${reportId} status to ${status} with comment: ${comment}`);
  
  const response = await fetch(`${API_BASE_URL}/fieldworker/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, comment })
  });
  
  const result = await handleResponse(response);
  
  // Store pause state in local storage to persist through page refreshes
  if (isPauseOperation) {
    const pausedReports = JSON.parse(localStorage.getItem('pausedReports') || '{}');
    pausedReports[reportId] = true;
    localStorage.setItem('pausedReports', JSON.stringify(pausedReports));
  } else if (comment && comment.includes('Task resumed')) {
    // Remove from paused reports if resumed
    const pausedReports = JSON.parse(localStorage.getItem('pausedReports') || '{}');
    if (pausedReports[reportId]) {
      delete pausedReports[reportId];
      localStorage.setItem('pausedReports', JSON.stringify(pausedReports));
    }
  }
  
  return result;
};

/**
 * Upload images (progress, completion, or general)
 * @param {string} type - Type of upload (progress, completion, general)
 * @param {FormData} formData - Form data with images and metadata
 * @returns {Promise} Promise that resolves to the upload response
 */
export const uploadImages = async (type, formData) => {
  const response = await fetch(`${API_BASE_URL}/fieldworker/images/${type}`, {
    method: 'POST',
    headers: getHeaders(false), // Don't include Content-Type, let the browser set it for FormData
    body: formData
  });
  
  return handleResponse(response);
};

/**
 * Save notes for a report
 * @param {string} reportId - ID of the report
 * @param {string} notes - Notes to save
 * @returns {Promise} Promise that resolves to the updated report data
 */
export const saveReportNotes = async (reportId, notes) => {
  // For fieldworkers, always use in_progress with notes
  // This is the safest approach since fieldworkers can only use in_progress or resolved
  console.log(`Saving notes for report ${reportId}: ${notes}`);
  return updateReportStatus(reportId, 'in_progress', notes);
};

/**
 * Check server connection status
 * @returns {Promise<boolean>} Promise that resolves to true if connected, false otherwise
 */
export const checkServerConnection = async () => {
  try {
    // The health endpoint is at /health, not /api/health
    const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      // Use minimal headers for health check
      headers: { 'Accept': 'application/json' }
    });
    
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Server connection error:', error);
    return false;
  }
};
