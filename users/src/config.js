/**
 * Application Configuration
 * Contains environment-specific settings
 */

// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mapbox API key
export const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;

// Socket.IO URL
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// App settings
export const APP_NAME = 'CivicConnect';
export const APP_VERSION = '1.0.0';

// Report categories
export const REPORT_CATEGORIES = [
  { value: 'road_issue', label: 'Road Issue', icon: 'road' },
  { value: 'water_issue', label: 'Water Issue', icon: 'water_drop' },
  { value: 'electricity_issue', label: 'Electricity Issue', icon: 'electrical_services' },
  { value: 'waste_management', label: 'Waste Management', icon: 'delete' },
  { value: 'public_safety', label: 'Public Safety', icon: 'security' },
  { value: 'other', label: 'Other', icon: 'help' }
];

// Report priorities
export const REPORT_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#4caf50' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'high', label: 'High', color: '#f44336' },
  { value: 'critical', label: 'Critical', color: '#9c27b0' }
];

// Report statuses
export const REPORT_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: '#2196f3' },
  { value: 'in_review', label: 'In Review', color: '#9c27b0' },
  { value: 'assigned', label: 'Assigned', color: '#ff9800' },
  { value: 'in_progress', label: 'In Progress', color: '#3f51b5' },
  { value: 'resolved', label: 'Resolved', color: '#4caf50' },
  { value: 'closed', label: 'Closed', color: '#9e9e9e' }
];
