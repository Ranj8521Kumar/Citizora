import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Route, Filter, Layers } from 'lucide-react';

export function MapView({ onBack }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showRoute, setShowRoute] = useState(false);

  // Mock location data
  const mockLocations = [
    { id: 1, lat: 40.7128, lng: -74.0060, title: 'Pothole on Main Street', priority: 'high', status: 'assigned' },
    { id: 2, lat: 40.7589, lng: -73.9851, title: 'Broken Street Light', priority: 'medium', status: 'in-progress' },
    { id: 3, lat: 40.7505, lng: -73.9934, title: 'Graffiti Removal', priority: 'low', status: 'assigned' },
    { id: 4, lat: 40.7614, lng: -73.9776, title: 'Water Main Issue', priority: 'urgent', status: 'assigned' }
  ];

  useEffect(() => {
    // Simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Use mock location if geolocation fails
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredLocations = mockLocations.filter(location => {
    if (selectedFilter === 'all') return true;
    return location.status === selectedFilter;
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'assigned', 'in-progress', 'completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-200">
        {/* Mock Map - In a real app, this would be Google Maps or Mapbox */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Interactive Map</p>
            <p className="text-sm opacity-75">GPS integration would be implemented here</p>
          </div>
        </div>

        {/* Location Markers */}
        {filteredLocations.map((location, index) => (
          <div
            key={location.id}
            className="absolute"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`
            }}
          >
            <div className={`w-4 h-4 rounded-full ${getPriorityColor(location.priority)} border-2 border-white shadow-lg`}></div>
          </div>
        ))}

        {/* Current Location */}
        {currentLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
            <Navigation className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Location List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Nearby Tasks</h2>
          <span className="text-sm text-gray-600">{filteredLocations.length} locations</span>
        </div>

        {filteredLocations.map((location) => (
          <div key={location.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(location.priority)} mt-2`}></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{location.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="capitalize">{location.priority} priority</span>
                  <span className="capitalize">{location.status.replace('-', ' ')}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <MapPin className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Route Info */}
      {showRoute && (
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
            <p>4 stops • 2.3 miles • 45 min estimated</p>
            <p>Next: Pothole on Main Street (0.3 mi)</p>
          </div>
          <button className="w-full mt-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start Navigation
          </button>
        </div>
      )}
    </div>
  );
}