import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for Leaflet marker icon issues
// This is needed because Leaflet's default marker assets can't be properly loaded by module bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to center the map view on location changes
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Component to handle map clicks and location selection
function LocationMarker({ position, setPosition, onLocationSelected }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      
      // Perform reverse geocoding and call the callback with location details
      if (onLocationSelected) {
        onLocationSelected({ lat, lng });
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>You selected this location</Popup>
    </Marker>
  ) : null;
}

export function MapComponent({ initialLocation, onLocationSelected }) {
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London
  const [mapReady, setMapReady] = useState(false);

  // Set initial position if provided
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setPosition(initialLocation);
      setMapCenter([initialLocation.lat, initialLocation.lng]);
    } else if (navigator.geolocation && !position) {
      // Try to get user's current location if no initial location provided
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const { latitude, longitude } = location.coords;
          setPosition({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    setMapReady(true);
  }, [initialLocation, position]);

  if (!mapReady) {
    return <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-2" />
        <p>Loading map...</p>
      </div>
    </div>;
  }

  return (
    <div className="map-container w-full h-80 rounded-lg overflow-hidden border">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position} 
          setPosition={setPosition}
          onLocationSelected={onLocationSelected}
        />
        <ChangeMapView center={position} />
      </MapContainer>
    </div>
  );
}
