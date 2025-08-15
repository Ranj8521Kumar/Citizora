/**
 * Geolocation utilities for CivicConnect
 * Provides helper functions for working with GPS and location data
 */

/**
 * Get the current position of the user
 * @param {Object} options - Geolocation options
 * @returns {Promise} Promise that resolves to position coordinates
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Default options
    const defaultOptions = {
      enableHighAccuracy: true,  // Use GPS if available
      timeout: 10000,            // 10 seconds timeout
      maximumAge: 300000         // Accept positions up to 5 minutes old
    };

    // Merge options
    const geolocationOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      // Error callback
      (error) => {
        // Provide more human-friendly error messages
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        reject(new Error(errorMessage));
      },
      // Options
      geolocationOptions
    );
  });
};

/**
 * Watch for location changes
 * @param {Function} onPositionUpdate - Callback for position updates
 * @param {Function} onError - Callback for errors
 * @param {Object} options - Geolocation options
 * @returns {Number} Watch ID that can be used to clear the watch
 */
export const watchPosition = (onPositionUpdate, onError, options = {}) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by this browser'));
    return null;
  }

  // Default options
  const defaultOptions = {
    enableHighAccuracy: true,  // Use GPS if available
    timeout: 10000,            // 10 seconds timeout
    maximumAge: 5000           // Accept positions up to 5 seconds old
  };

  // Merge options
  const geolocationOptions = { ...defaultOptions, ...options };

  // Start watching position
  return navigator.geolocation.watchPosition(
    // Success callback
    (position) => {
      onPositionUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      });
    },
    // Error callback
    (error) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'User denied the request for geolocation';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out';
          break;
        default:
          errorMessage = 'An unknown error occurred';
      }
      onError(new Error(errorMessage));
    },
    // Options
    geolocationOptions
  );
};

/**
 * Clear a position watch
 * @param {Number} watchId - The ID returned by watchPosition
 */
export const clearPositionWatch = (watchId) => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate distance between two points in kilometers
 * Uses the Haversine formula
 * @param {Object} point1 - { latitude, longitude }
 * @param {Object} point2 - { latitude, longitude }
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * 
    Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

/**
 * Format distance for display
 * @param {Number} distance - Distance in kilometers
 * @returns {String} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 0.1) {
    // Convert to meters if less than 100m
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    // Show one decimal place for short distances
    return `${distance.toFixed(1)}km`;
  } else {
    // Round to nearest kilometer for longer distances
    return `${Math.round(distance)}km`;
  }
};
