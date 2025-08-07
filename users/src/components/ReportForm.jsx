import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import apiService from '../services/api';
import { 
  ArrowLeft, 
  ArrowRight, 
  Construction, 
  Droplets, 
  Trash, 
  Zap, 
  Shield, 
  Car,
  MapPin,
  Upload,
  X,
  Camera,
  Plus
} from 'lucide-react';

const categories = [
  { id: 'road_issue', name: 'Roads & Transport', icon: Car, description: 'Potholes, traffic lights, signage' },
  { id: 'water_issue', name: 'Water Issues', icon: Droplets, description: 'Leaks, water quality, drainage' },
  { id: 'waste_management', name: 'Waste Management', icon: Trash, description: 'Collection, illegal dumping, bins' },
  { id: 'electricity_issue', name: 'Electricity', icon: Zap, description: 'Street lights, power outages' },
  { id: 'public_safety', name: 'Public Safety', icon: Shield, description: 'Security concerns, vandalism' },
  { id: 'other', name: 'Infrastructure', icon: Construction, description: 'Buildings, parks, facilities' },
];

export function ReportForm({ onSubmit, onCancel }) {
  const [currentStep, setCurrentStep] = useState('category');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    coordinates: undefined,
    images: [],
    priority: 'medium',
    estimatedResolution: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  const steps = ['category', 'details', 'location', 'images', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'category':
        return formData.category !== '';
      case 'details':
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 'location':
        return formData.location.trim() !== '';
      case 'images':
        return true; // Images are optional
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      // Structure the data according to backend requirements
      const reportData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: {
          type: 'Point',
          coordinates: formData.coordinates 
            ? [formData.coordinates.lng, formData.coordinates.lat] // Convert to [longitude, latitude] array
            : [0, 0], // Default coordinates if none provided
          address: {
            description: formData.location || 'Location not specified'
          }
        },
        images: formData.images
      };
      
      console.log('Submitting report data:', JSON.stringify(reportData, null, 2));
      onSubmit(reportData);
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files) {
      setUploadingImages(true);
      try {
        // Convert files to base64 for now (in production, you'd upload to a service)
        const imagePromises = Array.from(files).map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        });
        
        const imageDataUrls = await Promise.all(imagePromises);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imageDataUrls].slice(0, 5) // Max 5 images
        }));
      } catch (error) {
        console.error('Error processing images:', error);
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }, // Store as {lat, lng} for easy conversion
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error('Error detecting location:', error);
        }
      );
    }
  };

  const getCategoryById = (id) => categories.find(cat => cat.id === id);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Report an Issue</h1>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Category Selection */}
            {currentStep === 'category' && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>What type of issue are you reporting?</CardTitle>
                  <CardDescription>
                    Select the category that best describes your issue
                  </CardDescription>
                </CardHeader>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          formData.category === category.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            formData.category === category.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Step */}
            {currentStep === 'details' && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Provide details about the issue</CardTitle>
                  <CardDescription>
                    Give us a clear description so we can address it properly
                  </CardDescription>
                </CardHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of the issue"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide detailed information about the issue..."
                      className="mt-1 min-h-24"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                        <SelectItem value="medium">Medium - Noticeable issue</SelectItem>
                        <SelectItem value="high">High - Significant problem</SelectItem>
                        <SelectItem value="urgent">Urgent - Safety concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Location Step */}
            {currentStep === 'location' && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Where is this issue located?</CardTitle>
                  <CardDescription>
                    Provide the specific location to help us find and resolve the issue
                  </CardDescription>
                </CardHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Address or Description *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Main Street near Oak Avenue"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      className="flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Use Current Location</span>
                    </Button>
                    {formData.coordinates && (
                      <Badge variant="secondary">Location detected</Badge>
                    )}
                  </div>
                  
                  {/* Mock Map Placeholder */}
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Interactive map would appear here</p>
                      <p className="text-sm">Click to pinpoint exact location</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Images Step */}
            {currentStep === 'images' && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Add photos (optional)</CardTitle>
                  <CardDescription>
                    Photos help us understand the issue better. You can add up to 5 images.
                  </CardDescription>
                </CardHeader>
                
                <div className="space-y-4">
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.images.length < 5 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {uploadingImages ? 'Processing images...' : 'Click to upload photos'}
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Review your report</CardTitle>
                  <CardDescription>
                    Please review all details before submitting your report
                  </CardDescription>
                </CardHeader>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Category</h3>
                    <div className="flex items-center space-x-2">
                      {formData.category && (() => {
                        const category = getCategoryById(formData.category);
                        const Icon = category?.icon || Construction;
                        return (
                          <>
                            <Icon className="w-4 h-4" />
                            <span>{category?.name}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Issue Details</h3>
                    <p className="font-medium">{formData.title}</p>
                    <p className="text-muted-foreground mt-1">{formData.description}</p>
                    <Badge className="mt-2" variant={
                      formData.priority === 'urgent' ? 'destructive' :
                      formData.priority === 'high' ? 'default' :
                      formData.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {formData.priority} priority
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.location}</span>
                    </div>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Photos ({formData.images.length})</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {formData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          {currentStepIndex === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>Submit Report</span>
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}