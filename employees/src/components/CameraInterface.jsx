import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, X, Image } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';

export function CameraInterface({ onBack }) {
  const [photos, setPhotos] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // Load saved photos from localStorage on component mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('civicConnectPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        if (Array.isArray(parsedPhotos)) {
          console.log('Loaded photos from localStorage:', parsedPhotos.length);
          setPhotos(parsedPhotos);
        }
      }
    } catch (error) {
      console.error('Failed to load saved photos:', error);
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    if (photos.length > 0) {
      console.log('Saving photos to localStorage:', photos.length);
      localStorage.setItem('civicConnectPhotos', JSON.stringify(photos));
    }
  }, [photos]);

  const handleCameraCapture = () => {
    setIsCameraOpen(true);
  };
  
  const handleImageCapture = (imageDataUrl) => {
    try {
      const newPhoto = {
        id: Date.now(),
        url: imageDataUrl,
        timestamp: new Date().toLocaleString(),
        compressed: true
      };
      
      // Update state and localStorage
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      
      // Ensure it's saved immediately
      localStorage.setItem('civicConnectPhotos', JSON.stringify(updatedPhotos));
      console.log('Photo captured and saved to localStorage');
    } catch (error) {
      console.error('Error saving captured photo:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newPhoto = {
            id: Date.now(),
            url: e.target.result,
            timestamp: new Date().toLocaleString(),
            compressed: true
          };
          
          // Update state and localStorage
          const updatedPhotos = [...photos, newPhoto];
          setPhotos(updatedPhotos);
          
          // Ensure it's saved immediately
          localStorage.setItem('civicConnectPhotos', JSON.stringify(updatedPhotos));
          console.log('Photo uploaded and saved to localStorage');
        } catch (error) {
          console.error('Error saving uploaded photo:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deletePhoto = (photoId) => {
    try {
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      setPhotos(updatedPhotos);
      
      // Update localStorage immediately
      localStorage.setItem('civicConnectPhotos', JSON.stringify(updatedPhotos));
      console.log('Photo deleted and localStorage updated');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Photo Documentation</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{photos.length} photos</span>
          </div>
        </div>
      </div>

      {/* Camera Interface */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {/* Camera View with Photos Display */}
        {photos.length > 0 ? (
          <div className="flex-1 flex flex-col p-4">
            <h2 className="text-white text-xl font-semibold mb-4">Captured Photos</h2>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-240px)]">
              {photos.map((photo) => (
                <div key={photo.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={`Photo ${photo.timestamp}`} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                    <p className="text-xs text-white truncate">{photo.timestamp}</p>
                  </div>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"
                    aria-label="Delete photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center text-white">
              <Camera className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No photos yet</p>
              <p className="text-sm opacity-75">Tap the camera button below to capture</p>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="p-6 bg-black bg-opacity-50">
          <div className="flex items-center justify-center space-x-8">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              aria-label="Upload from gallery"
            >
              <Image className="w-6 h-6 text-white" />
            </button>

            {/* Capture Button */}
            <button
              onClick={handleCameraCapture}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Take photo"
            >
              <Camera className="w-8 h-8 text-gray-800" />
            </button>

            {/* Switch Camera Button - Disabled for now as it's handled by PhotoCapture */}
            <button 
              className="p-4 bg-white bg-opacity-20 rounded-full opacity-50"
              aria-label="Switch camera - available when taking photo"
              disabled
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="bg-black bg-opacity-50 p-4 mt-auto">
          <h3 className="text-white font-medium mb-3">Recent Photos ({photos.length})</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2 max-h-16">
            {photos.map((photo) => (
              <div key={photo.id} className="relative flex-shrink-0">
                <img
                  src={photo.url}
                  alt="Captured"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PhotoCapture Modal Component */}
      <PhotoCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleImageCapture}
        initialMode="camera"
      />
    </div>
  );
}