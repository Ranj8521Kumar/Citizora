import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, X, Image } from 'lucide-react';

export function CameraInterface({ onBack }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleCameraCapture = () => {
    // Simulate camera capture
    setIsCapturing(true);
    setTimeout(() => {
      const mockImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
      setCapturedImage(mockImageUrl);
      setIsCapturing(false);
    }, 1000);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = () => {
    if (capturedImage) {
      const newPhoto = {
        id: Date.now(),
        url: capturedImage,
        timestamp: new Date().toLocaleString(),
        compressed: true
      };
      setPhotos([...photos, newPhoto]);
      setCapturedImage(null);
    }
  };

  const discardPhoto = () => {
    setCapturedImage(null);
  };

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
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

      {capturedImage ? (
        /* Preview Mode */
        <div className="relative h-screen">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
          
          {/* Preview Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={discardPhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Discard</span>
              </button>
              <button
                onClick={savePhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Camera Mode */
        <div className="relative h-screen bg-gray-900 flex flex-col">
          {/* Camera View */}
          <div className="flex-1 flex items-center justify-center relative">
            {isCapturing ? (
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Capturing photo...</p>
              </div>
            ) : (
              <div className="text-center text-white">
                <Camera className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Ready to capture</p>
                <p className="text-sm opacity-75">Tap the camera button below</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="p-6 bg-black bg-opacity-50">
            <div className="flex items-center justify-center space-x-8">
              {/* Gallery Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <Image className="w-6 h-6 text-white" />
              </button>

              {/* Capture Button */}
              <button
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Camera className="w-8 h-8 text-gray-800" />
              </button>

              {/* Switch Camera Button */}
              <button className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                <RotateCcw className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && !capturedImage && (
        <div className="absolute bottom-20 left-0 right-0 bg-black bg-opacity-50 p-4">
          <h3 className="text-white font-medium mb-3">Recent Photos ({photos.length})</h3>
          <div className="flex space-x-2 overflow-x-auto">
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
    </div>
  );
}