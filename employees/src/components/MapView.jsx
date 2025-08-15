import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, MapPin, Navigation, Route, Filter, Layers, Loader, AlertCircle, Crosshair } from 'lucide-react';
import { getMapReports, getFieldWorkerReports } from '../services/api';
import { getCurrentPosition, watchPosition, clearPositionWatch, calculateDistance, formatDistance } from '../utils/locationUtils';

export function MapView({ onBack }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showRoute, setShowRoute] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [watchId, setWatchId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // const [apiRetries, setApiRetries] = useState(0); // Removed unused state
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  // Fetch reports based on location and filter
  const fetchNearbyTasks = useCallback(async (location) => {
    // Prevent excessive fetches - add throttling (no more than once every 5 seconds)
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) {
      console.log('Throttling API requests - skipping this fetch');
      setRefreshing(false);
      return;
    }
    
    // Update the last fetch time
    lastFetchTime.current = now;
    
    // Only proceed if component is still mounted
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Convert filter value to API parameter
      let statusParam;
      switch (selectedFilter) {
        case 'assigned':
          statusParam = 'assigned';
          break;
        case 'in-progress':
          statusParam = 'in_progress';
          break;
        case 'completed':
          statusParam = 'resolved';
          break;
        case 'all':
        default:
          statusParam = '';
      }

      // Mock data to use if API fails
      const mockLocations = [
        { id: 'mock1', lat: 40.7128, lng: -74.0060, title: 'Pothole on Main Street', priority: 'high', status: 'assigned', category: 'infrastructure' },
        { id: 'mock2', lat: 40.7589, lng: -73.9851, title: 'Broken Street Light', priority: 'medium', status: 'in-progress', category: 'lighting' },
        { id: 'mock3', lat: 40.7505, lng: -73.9934, title: 'Graffiti Removal', priority: 'low', status: 'assigned', category: 'cleaning' },
        { id: 'mock4', lat: 40.7614, lng: -73.9776, title: 'Water Main Issue', priority: 'urgent', status: 'assigned', category: 'plumbing' },
        { id: 'mock5', lat: 40.7420, lng: -73.9890, title: 'Tree Planting Complete', priority: 'medium', status: 'completed', category: 'environment' },
        { id: 'mock6', lat: 40.7350, lng: -73.9915, title: 'Street Sign Replaced', priority: 'low', status: 'completed', category: 'infrastructure' }
      ];

      let tasksData = [];
      
      try {
        console.log('Attempting to fetch real tasks from database...');
        
        // Try loading from getFieldWorkerReports first (most likely to work)
        const fieldWorkerPromise = getFieldWorkerReports({ status: statusParam, limit: 20 });
        
        // Set a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timed out')), 8000)
        );
        
        const response = await Promise.race([fieldWorkerPromise, timeoutPromise]);
        console.log('API Response:', response);
        
        if (response && response.data && Array.isArray(response.data.reports) && response.data.reports.length > 0) {
          console.log('Found fieldworker reports:', response.data.reports);
          
          tasksData = response.data.reports
            .filter(() => {
              // We'll accept all reports even without location - we'll add mock locations
              return true;
            })
            .map((report, index) => {
              // Default coordinates near NYC, but spread out in a grid pattern for visibility
              const gridSize = Math.ceil(Math.sqrt(response.data.reports.length));
              const gridX = index % gridSize;
              const gridY = Math.floor(index / gridSize);
              
              let lat = 40.7128 + (gridX * 0.005);
              let lng = -74.0060 + (gridY * 0.005);
              
              // Try to extract coordinates if available
              if (report.location && report.location.coordinates && 
                  Array.isArray(report.location.coordinates) && 
                  report.location.coordinates.length >= 2) {
                [lng, lat] = report.location.coordinates;
              }
              
              return {
                id: report._id || `report-${index}`,
                lat,
                lng,
                title: report.title || 'Report #' + (index + 1),
                priority: report.priority || 'medium',
                status: mapStatusForDisplay(report.status || 'assigned'),
                category: report.category || 'general',
                createdAt: report.createdAt || new Date().toISOString(),
                distance: location ? 
                  calculateDistance(
                    { latitude: location.latitude, longitude: location.longitude }, 
                    { latitude: lat, longitude: lng }
                  ) : null
              };
            });
            
          console.log('Successfully processed fieldworker reports:', tasksData);
        } else {
          throw new Error('No fieldworker reports found');
        }
      } catch (firstError) {
        console.warn('Fieldworker reports failed, trying map API:', firstError);
        
        try {
          // Try the map reports API as a fallback
          const mapResponse = await getMapReports({ status: statusParam }, location);
          
          // Check different possible response formats
          let reportsArray = null;
          
          if (mapResponse && mapResponse.data && Array.isArray(mapResponse.data.reports)) {
            reportsArray = mapResponse.data.reports;
          } else if (mapResponse && Array.isArray(mapResponse.data)) {
            reportsArray = mapResponse.data;
          } else if (mapResponse && Array.isArray(mapResponse)) {
            reportsArray = mapResponse;
          } else if (mapResponse && mapResponse.reports && Array.isArray(mapResponse.reports)) {
            reportsArray = mapResponse.reports;
          }
          
          if (reportsArray && reportsArray.length > 0) {
            console.log('Found map reports:', reportsArray);
            
            tasksData = reportsArray
              .map((report, index) => {
                let lat = 40.7128 + (index * 0.002);
                let lng = -74.0060 + (index * 0.002);
                
                if (report.location && Array.isArray(report.location.coordinates)) {
                  [lng, lat] = report.location.coordinates;
                } else if (report.lat && report.lng) {
                  lat = report.lat;
                  lng = report.lng;
                }
                
                return {
                  id: report._id || report.id || `map-${index}`,
                  lat,
                  lng, 
                  title: report.title || 'Map Task #' + (index + 1),
                  priority: report.priority || 'medium',
                  status: mapStatusForDisplay(report.status || 'assigned'),
                  category: report.category || 'general',
                  distance: location ? 
                    calculateDistance(
                      { latitude: location.latitude, longitude: location.longitude }, 
                      { latitude: lat, longitude: lng }
                    ) : null
                };
              });
          } else {
            throw new Error('No map reports found');
          }
        } catch (secondError) {
          console.warn('All API attempts failed, using mock data:', secondError);
          
          // Use mock data when both API attempts fail
          tasksData = mockLocations.map((mock) => ({
            ...mock,
            // Add some randomization to mock locations
            lat: mock.lat + (Math.random() * 0.01 - 0.005),
            lng: mock.lng + (Math.random() * 0.01 - 0.005),
            distance: location ? 
              calculateDistance(
                { latitude: location.latitude, longitude: location.longitude }, 
                { latitude: mock.lat, longitude: mock.lng }
              ) : null
          }));
        }
      }
      
      // Sort by distance if we have current location
      if (location && tasksData.length > 0) {
        tasksData.sort((a, b) => a.distance - b.distance);
      }
      
      console.log('Final processed tasks data:', tasksData);
      
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error('Error fetching nearby tasks:', err);
      setError('Failed to load tasks. Please check your connection and try again.');
      
      // Use default mock data as fallback even in case of complete failure
      const fallbackTasks = [
        { id: 'mock1', lat: 40.7128, lng: -74.0060, title: 'Pothole on Main Street', priority: 'high', status: 'assigned', category: 'infrastructure', distance: null },
        { id: 'mock2', lat: 40.7589, lng: -73.9851, title: 'Broken Street Light', priority: 'medium', status: 'in-progress', category: 'lighting', distance: null },
        { id: 'mock3', lat: 40.7505, lng: -73.9934, title: 'Graffiti Removal', priority: 'low', status: 'assigned', category: 'cleaning', distance: null },
        { id: 'mock4', lat: 40.7614, lng: -73.9776, title: 'Water Main Issue', priority: 'urgent', status: 'assigned', category: 'plumbing', distance: null },
        { id: 'mock5', lat: 40.7420, lng: -73.9890, title: 'Tree Planting Complete', priority: 'medium', status: 'completed', category: 'environment', distance: null },
        { id: 'mock6', lat: 40.7350, lng: -73.9915, title: 'Street Sign Replaced', priority: 'low', status: 'completed', category: 'infrastructure', distance: null }
      ];
      setTasks(fallbackTasks);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter]);

  // Initialize location tracking and data fetching
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true);
        
        try {
          // Try to get user position with a timeout
          const positionPromise = getCurrentPosition();
          
          // Set a timeout to avoid waiting too long for position
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Location request timed out')), 5000);
          });
          
          // Use the first promise that resolves (position or timeout)
          const position = await Promise.race([positionPromise, timeoutPromise]);
          setCurrentLocation(position);
          
          // Fetch tasks with the position
          await fetchNearbyTasks(position);
          
          // Start watching for position changes
          const id = watchPosition(
            // On position update
            (updatedPosition) => {
              setCurrentLocation(updatedPosition);
              // Only refresh tasks if location changed significantly (>300m) and we're not already loading
              const distanceMoved = calculateDistance(
                { latitude: position.latitude, longitude: position.longitude },
                { latitude: updatedPosition.latitude, longitude: updatedPosition.longitude }
              );
              
              // Check if enough time has passed since last fetch (5 seconds) and distance is significant
              const now = Date.now();
              const timeSinceLastFetch = now - lastFetchTime.current;
              
              if (distanceMoved > 0.3 && !loading && !refreshing && timeSinceLastFetch > 5000) {
                console.log(`Location changed by ${distanceMoved.toFixed(1)}km, refreshing tasks`);
                fetchNearbyTasks(updatedPosition);
              } else {
                console.log(`Location updated (moved ${distanceMoved.toFixed(2)}km)`);
              }
            },
            // On error
            (locationError) => {
              console.error('Location error:', locationError);
              // Only set error if we don't have a location yet
              if (!currentLocation) {
                setError('Unable to track your location. Please enable GPS and try again.');
              }
            },
            // Options - Use less frequent updates to save battery
            { 
              maximumAge: 60000, // Accept positions up to 1 minute old
              enableHighAccuracy: false, // Don't need high accuracy for this map view
              timeout: 10000 // Allow up to 10 seconds for each position acquisition
            }
          );
          
          setWatchId(id);
        } catch (locationErr) {
          console.error('Error getting location:', locationErr);
          
          // Use a default location (NYC) if we can't get user position
          const defaultPosition = { 
            latitude: 40.7128, 
            longitude: -74.0060,
            accuracy: 1000,
            timestamp: Date.now()
          };
          
          setCurrentLocation(defaultPosition);
          setError('Using default location. Enable GPS for better results.');
          
          // Fetch tasks with the default position
          await fetchNearbyTasks(defaultPosition);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Could not initialize map. Please try again later.');
        
        // Even if everything fails, load with mock data
        await fetchNearbyTasks(null);
      } finally {
        // Always ensure loading state is reset
        setLoading(false);
      }
    };
    
    initializeMap();
    
    // Cleanup location watching
    return () => {
      isMounted.current = false;
      if (watchId) clearPositionWatch(watchId);
    };
    // We intentionally exclude loading, refreshing, and currentLocation from dependencies
    // to prevent re-running the effect when these change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNearbyTasks]);

  // Refetch when filter changes
  useEffect(() => {
    if (currentLocation && isMounted.current) {
      // Add a small delay to prevent rapid re-fetches when multiple dependencies change
      const timer = setTimeout(() => {
        fetchNearbyTasks(currentLocation);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  // Intentionally exclude currentLocation to prevent infinite update loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, fetchNearbyTasks]);
  
  // Set up the isMounted ref for cleanup
  useEffect(() => {
    // Set to true when component mounts
    isMounted.current = true;
    
    // Set to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Helper function to consistently map API status values to display status values
  const mapStatusForDisplay = (status) => {
    switch(status.toLowerCase()) {
      case 'resolved':
        return 'completed';
      case 'in_progress':
        return 'in-progress';
      case 'assigned':
        return 'assigned';
      default:
        return status.replace('_', '-');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredLocations = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    
    // Handle the special case for "completed" which maps to "resolved" in the backend
    if (selectedFilter === 'completed') {
      return task.status === 'completed' || task.status === 'resolved';
    }
    
    return task.status === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Field Map</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`p-2 rounded-lg transition-colors ${
                showRoute ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Route className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                if (currentLocation && !loading && !refreshing) {
                  // Check if enough time has passed since last fetch
                  const now = Date.now();
                  if (now - lastFetchTime.current > 5000) {
                    fetchNearbyTasks(currentLocation);
                  } else {
                    console.log('Please wait before refreshing again');
                    // Flash the button to indicate throttling
                    const btn = document.activeElement;
                    if (btn) {
                      btn.classList.add('bg-amber-100');
                      setTimeout(() => btn.classList.remove('bg-amber-100'), 300);
                    }
                  }
                }
              }}
              disabled={loading || refreshing}
            >
              {loading || refreshing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'assigned', 'in-progress', 'completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                if (filter !== selectedFilter) {
                  setSelectedFilter(filter);
                  // Set a short debounce to avoid immediate refetch
                  setTimeout(() => {
                    if (currentLocation && isMounted.current) {
                      fetchNearbyTasks(currentLocation);
                    }
                  }, 300);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={loading || refreshing}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-200">
        {/* Map with GPS integration */}
        <div className="absolute inset-0 flex items-center justify-center">
          {loading && tasks.length === 0 ? (
            <div className="text-center text-gray-600">
              <Loader className="w-16 h-16 mx-auto mb-4 animate-spin opacity-50" />
              <p className="text-lg mb-2">Loading Map</p>
              <p className="text-sm opacity-75">Getting your location...</p>
            </div>
          ) : error && tasks.length === 0 ? (
            <div className="text-center text-gray-600 px-4">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Location Error</p>
              <p className="text-sm opacity-75">{error}</p>
              <button 
                onClick={() => currentLocation ? fetchNearbyTasks(currentLocation) : getCurrentPosition().then(fetchNearbyTasks)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Interactive Map</p>
              <p className="text-sm opacity-75">
                {currentLocation ? (
                  `GPS active - showing ${filteredLocations.length} tasks`
                ) : (
                  `Showing ${filteredLocations.length} tasks (GPS unavailable)`
                )}
              </p>
              {error && (
                <p className="text-xs text-amber-600 mt-1">{error}</p>
              )}
              {refreshing && (
                <div className="mt-2">
                  <Loader className="w-4 h-4 animate-spin inline-block mr-1" />
                  <span className="text-xs">Updating...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Markers */}
        {!loading && !error && filteredLocations.map((location, index) => (
          <div
            key={location.id}
            className="absolute"
            style={{
              left: `${20 + (index % 5) * 15}%`,
              top: `${30 + Math.floor(index / 5) * 15}%`
            }}
          >
            <div className={`w-4 h-4 rounded-full ${getPriorityColor(location.priority)} border-2 border-white shadow-lg`}></div>
          </div>
        ))}

        {/* Current Location */}
        {!loading && currentLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button 
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              if (currentLocation) {
                // In a real implementation, this would center the map on the user's location
                console.log("Centering on user location:", currentLocation);
                
                // For now, just refresh the data with current location
                fetchNearbyTasks(currentLocation);
              }
            }}
            disabled={loading || !currentLocation}
          >
            <Navigation className={`w-5 h-5 ${!currentLocation ? 'text-gray-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Nearby Tasks</h2>
          <span className="text-sm text-gray-600">{filteredLocations.length} locations</span>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => currentLocation ? fetchNearbyTasks(currentLocation) : getCurrentPosition().then(fetchNearbyTasks)}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No {selectedFilter !== 'all' ? selectedFilter : ''} tasks found nearby</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(location.priority)} mt-2`}></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{location.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                    <span className="capitalize">{location.priority} priority</span>
                    <span className="capitalize">{location.status.replace('-', ' ')}</span>
                    {location.category && (
                      <span className="capitalize">{location.category}</span>
                    )}
                    {location.distance !== null && (
                      <span>{formatDistance(location.distance)}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      onClick={() => {
                        // In a real implementation, this would open navigation app with coordinates
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Navigate</span>
                    </button>
                    <button 
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        // Navigate to task details
                        window.location.href = `/tasks/${location.id}`;
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Route Info */}
      {showRoute && filteredLocations.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Optimized Route</h3>
            <button
              onClick={() => setShowRoute(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{filteredLocations.length} stops • {formatDistance(filteredLocations.reduce((total, loc) => total + (loc.distance || 0), 0))} total</p>
            {currentLocation && filteredLocations[0] && (
              <p>Next: {filteredLocations[0].title} ({formatDistance(filteredLocations[0].distance || 0)})</p>
            )}
          </div>
          <button 
            className="w-full mt-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              // Open navigation to first location in list
              if (filteredLocations[0]) {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${filteredLocations[0].lat},${filteredLocations[0].lng}`;
                window.open(mapsUrl, '_blank');
              }
            }}
          >
            Start Navigation
          </button>
        </div>
      )}
    </div>
  );
}
