/**
 * Helper functions for handling image URLs in the application
 */

// Import API configuration if needed
// These are fallbacks in case the actual API base URL is not available
const REMOTE_API_BASE_URL = 'https://civic-connect-backend-aq2a.onrender.com';
const LOCAL_API_BASE_URL = 'http://localhost:3000';

// Get the current API base URL from localStorage if available
function getApiBaseUrl() {
  const apiUrl = localStorage.getItem('apiBaseUrl');
  if (apiUrl) {
    // Extract base URL from API URL (remove "/api" if present)
    return apiUrl.replace('/api', '');
  }
  
  // Try to use window.location as fallback for development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return LOCAL_API_BASE_URL;
  }
  
  // Default to remote API
  return REMOTE_API_BASE_URL;
}

/**
 * Safely processes an image from any format to a valid URL string
 * 
 * @param {string|object} image - The image data from the API (could be string path, object with url, etc.)
 * @param {string} fallbackUrl - URL to use if the image cannot be processed
 * @returns {string} - A valid URL to display the image
 */
export function getImageUrl(image, fallbackUrl = 'https://via.placeholder.com/150?text=No+Image') {
  // Handle empty values
  if (!image) return fallbackUrl;
  
  // Get the current API base URL
  const API_BASE_URL = getApiBaseUrl();
  
  // Handle strings (direct paths)
  if (typeof image === 'string') {
    // If it's already a full URL
    if (image.startsWith('http')) return image;
    // It's a relative path, add base URL
    return `${API_BASE_URL}${image}`;
  }
  
  // Handle objects with url/path/src property
  if (typeof image === 'object') {
    // Extract the URL from common properties
    const imagePath = image.url || image.path || image.src || '';
    
    if (typeof imagePath === 'string' && imagePath) {
      // If the extracted path is already a full URL
      if (imagePath.startsWith('http')) return imagePath;
      // It's a relative path, add base URL
      return `${API_BASE_URL}${imagePath}`;
    }
  }
  
  // If we couldn't process the image, return fallback
  return fallbackUrl;
}

/**
 * Process an array of images to ensure all are valid URLs
 * 
 * @param {Array} images - Array of image data
 * @returns {Array} - Array of valid image URLs
 */
export function processImageArray(images) {
  if (!Array.isArray(images)) return [];
  
  return images
    .map(img => getImageUrl(img))
    .filter(Boolean); // Remove any null/undefined entries
}
