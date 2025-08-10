import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Image, CheckCircle, RotateCcw, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

export function PhotoCapture({ isOpen, onClose, onCapture, initialMode = 'camera' }) {
  const [mode, setMode] = useState(initialMode); // 'camera' or 'upload'
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Request camera access when component mounts
  useEffect(() => {
    if (!isOpen) return;
    
    if (mode === 'camera') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCameraPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      // Switch to upload mode if camera access fails
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCameraCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to image
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      
      // Stop camera after capturing
      stopCamera();
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
    
    setIsCapturing(false);
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

  const handleSavePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  const switchToCamera = () => {
    setCapturedImage(null);
    setMode('camera');
    startCamera();
  };

  const switchToUpload = () => {
    stopCamera();
    setCapturedImage(null);
    setMode('upload');
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Photo</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
          {capturedImage ? (
            // Preview captured image
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-contain" 
            />
          ) : mode === 'camera' ? (
            // Camera view
            <>
              {hasCameraPermission === false ? (
                <div className="text-center p-4">
                  <p className="mb-2">Camera access denied or not available</p>
                  <Button onClick={switchToUpload}>Upload Instead</Button>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover ${isCapturing ? 'opacity-50' : ''}`}
                  />
                  {isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            // Upload view
            <div className="text-center p-8">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Upload Photo</p>
              <Button onClick={triggerFileInput}>
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-row justify-between space-x-2">
          {!capturedImage && (
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={mode === 'camera' ? "default" : "outline"}
                onClick={switchToCamera}
                className="w-20"
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              
              <Button
                type="button"
                variant={mode === 'upload' ? "default" : "outline"}
                onClick={switchToUpload}
                className="w-20"
              >
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </div>
          )}
          
          <div className="flex space-x-2">
            {capturedImage ? (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setCapturedImage(null);
                    if (mode === 'camera') startCamera();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                
                <Button onClick={handleSavePhoto}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </>
            ) : mode === 'camera' ? (
              <Button 
                onClick={handleCameraCapture}
                disabled={isCapturing || hasCameraPermission === false}
                className="w-20 h-10 rounded-full"
              >
                <Camera className="w-5 h-5" />
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
