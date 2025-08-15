import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapComponent } from './MapComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useIsMobile } from './ui/use-mobile';
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
  Plus,
  Edit3
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
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState('category');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    fullAddress: '', // Store the actual full address from geocoding
    coordinates: undefined,
    addressDetails: {
      street: '',
      houseNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      zip: '' // For zip code input in manual entry
    },
    images: [],
    imageFiles: [], // Store actual file objects
    priority: 'medium', // Default to medium priority (matches server default)
    estimatedResolution: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManualLocationOpen, setIsManualLocationOpen] = useState(false);

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

  const handleSubmit = async () => {
    if (canProceed() && !isSubmitting) {
      try {
        // Set submitting state to true to show loading indicator
        setIsSubmitting(true);
        
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
              description: formData.location || 'Location not specified',
              fullAddress: formData.fullAddress, // Include the full address if available
              // Include structured address details if available
              street: formData.addressDetails?.street || '',
              houseNumber: formData.addressDetails?.houseNumber || '',
              neighborhood: formData.addressDetails?.neighborhood || '',
              city: formData.addressDetails?.city || '',
              state: formData.addressDetails?.state || '',
              country: formData.addressDetails?.country || '',
              postcode: formData.addressDetails?.postcode || formData.addressDetails?.zip || '',
              zip: formData.addressDetails?.zip || formData.addressDetails?.postcode || '' // Include zip code from manual entry
            }
          }
        };
        
        // Include the image files separately for proper processing by App.jsx
        const imagesToUpload = formData.imageFiles || [];
        
        console.log('Submitting report data:', reportData);
        console.log(`Prepared ${imagesToUpload.length} image files for upload`);
        
        // Pass both the report data and image files to parent component
        await onSubmit({
          ...reportData,
          imageFiles: imagesToUpload
        });
      } catch (error) {
        console.error('Error submitting report:', error);
      } finally {
        // Reset submitting state whether successful or not
        setIsSubmitting(false);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files) {
      setUploadingImages(true);
      try {
        // Store the original file objects for actual upload
        const fileObjects = Array.from(files);
        
        // Convert files to base64 for preview only
        const imagePromises = fileObjects.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        });
        
        const imageDataUrls = await Promise.all(imagePromises);
        console.log(`Processed ${imageDataUrls.length} images for preview`);
        
        // Limit to 5 images total
        const maxImages = 5;
        const currentImagesCount = formData.images.length;
        const availableSlots = Math.max(0, maxImages - currentImagesCount);
        
        if (availableSlots > 0) {
          const newImageUrls = imageDataUrls.slice(0, availableSlots);
          const newFileObjects = fileObjects.slice(0, availableSlots);
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImageUrls],
            imageFiles: [...prev.imageFiles, ...newFileObjects]
          }));
        }
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
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Store coordinates for database
          const coordinates = { lat: latitude, lng: longitude };
          
          // Format coordinates for display as fallback
          const formattedLat = latitude.toFixed(6);
          const formattedLng = longitude.toFixed(6);
          const coordsString = `${formattedLat}, ${formattedLng}`;
          
          // Show temporary coordinates display while geocoding
          setFormData(prev => ({
            ...prev,
            coordinates: coordinates,
            location: `Location (${coordsString})`, // Temporary display while geocoding is in progress
          }));
          
          // Get human-readable address using reverse geocoding
          reverseGeocode(latitude, longitude)
            .then(address => {
              // Fetch the full address details for richer data
              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
                .then(response => response.json())
                .then(data => {
                  // Create an address object with structured data
                  const addressData = data.address || {};
                  
                  setFormData(prev => ({
                    ...prev,
                    coordinates: coordinates, // Store as {lat, lng} for easy conversion
                    location: address, // Human-readable location string
                    fullAddress: address, // For backward compatibility
                    addressDetails: {
                      street: addressData.road || addressData.pedestrian || '',
                      houseNumber: addressData.house_number || '',
                      neighborhood: addressData.suburb || addressData.neighbourhood || addressData.quarter || '',
                      city: addressData.city || addressData.town || addressData.village || '',
                      state: addressData.state || addressData.county || '',
                      country: addressData.country || '',
                      postcode: addressData.postcode || ''
                    }
                  }));
                })
                .catch(error => {
                  console.error('Error fetching detailed address:', error);
                  // Continue with basic address
                  setFormData(prev => ({
                    ...prev,
                    coordinates: coordinates,
                    location: address,
                    fullAddress: address
                  }));
                });
            })
            .catch(error => {
              console.error('Error getting address from coordinates:', error);
              // Fallback to coordinates if geocoding fails
              setFormData(prev => ({
                ...prev,
                coordinates: coordinates,
                location: `Location (${coordsString})` // Fallback to coordinates if geocoding fails
              }));
            });
        },
        (error) => {
          console.error('Error detecting location:', error);
          alert('Could not detect your location. Please check your device settings and try again.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  };
  
  // Helper function to convert coordinates to address using reverse geocoding
  const reverseGeocode = async (latitude, longitude) => {
    try {
      console.log('Reverse geocoding coordinates:', latitude, longitude);
      
      // Format coordinates with limited decimal places for fallback display
      const formattedLat = latitude.toFixed(6);
      const formattedLng = longitude.toFixed(6);
      const coordsString = `${formattedLat}, ${formattedLng}`;
      
      // Use Nominatim OpenStreetMap service for geocoding (free, no API key required)
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      
      if (!response.ok) {
        console.warn(`Geocoding service responded with status: ${response.status}`);
        return `Location (${coordsString})`;
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      // If we have a display name but no address, use the display name
      if (!data.address && data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
      
      if (data && data.address) {
        // Store the full data for future use
        const fullAddressData = data.address;
        
        // Build a user-friendly address string with the most relevant parts
        const addressComponents = [];
        
        // First priority: street address (most specific)
        if (fullAddressData.road) {
          let streetAddress = fullAddressData.road;
          // Add house number if available
          if (fullAddressData.house_number) {
            streetAddress = `${fullAddressData.house_number} ${streetAddress}`;
          }
          addressComponents.push(streetAddress);
        } else if (fullAddressData.pedestrian) {
          addressComponents.push(fullAddressData.pedestrian);
        } else if (fullAddressData.footway) {
          addressComponents.push(fullAddressData.footway);
        } else if (fullAddressData.path) {
          addressComponents.push(fullAddressData.path);
        }
        
        // Second priority: neighborhood or locality
        if (fullAddressData.suburb) {
          addressComponents.push(fullAddressData.suburb);
        } else if (fullAddressData.neighbourhood) {
          addressComponents.push(fullAddressData.neighbourhood);
        } else if (fullAddressData.quarter) {
          addressComponents.push(fullAddressData.quarter);
        }
        
        // Third priority: city/town/village
        if (fullAddressData.city) {
          addressComponents.push(fullAddressData.city);
        } else if (fullAddressData.town) {
          addressComponents.push(fullAddressData.town);
        } else if (fullAddressData.village) {
          addressComponents.push(fullAddressData.village);
        } else if (fullAddressData.county) {
          addressComponents.push(fullAddressData.county);
        }
        
        // Add state and country for more context if needed
        if (fullAddressData.state && addressComponents.length < 3) {
          addressComponents.push(fullAddressData.state);
        }
        if (fullAddressData.country && addressComponents.length < 2) {
          addressComponents.push(fullAddressData.country);
        }
        
        // Format the address as a readable string
        if (addressComponents.length > 0) {
          const formattedAddress = addressComponents.join(', ');
          console.log('Formatted address:', formattedAddress);
          return formattedAddress;
        }
        
        // If we don't have any good components, use a shortened version of display_name
        if (data.display_name) {
          const shortAddress = data.display_name.split(',').slice(0, 3).join(',').trim();
          console.log('Using shortened display name:', shortAddress);
          return shortAddress;
        }
      }
      
      // Last resort fallback if no usable data from the geocoding service
      return `Location (${coordsString})`;
    } catch (error) {
      console.error('Geocoding failed:', error);
      // Format coordinates for display as fallback
      const formattedLat = latitude.toFixed(6);
      const formattedLng = longitude.toFixed(6);
      return `Location (${formattedLat}, ${formattedLng})`;
    }
  };

  const getCategoryById = (id) => categories.find(cat => cat.id === id);
  
  const handleManualLocation = (manualData) => {
    // Format the display address from manual input
    const addressComponents = [];
    if (manualData.street) {
      let streetAddress = manualData.street;
      addressComponents.push(streetAddress);
    }
    
    if (manualData.city) {
      addressComponents.push(manualData.city);
    }
    
    if (manualData.state) {
      addressComponents.push(manualData.state);
    }
    
    // Format the address as a readable string
    const formattedAddress = addressComponents.join(', ');
    
    // Update form data with manual location details
    setFormData(prev => ({
      ...prev,
      location: formattedAddress, // For display
      fullAddress: formattedAddress, // For consistency
      coordinates: undefined, // No coordinates for manual entry
      addressDetails: {
        ...manualData
      }
    }));
    
    // Close the modal
    setIsManualLocationOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      {/* Manual Location Modal */}
      <Dialog 
        open={isManualLocationOpen} 
        onOpenChange={setIsManualLocationOpen}
      >
        <DialogContent 
          className="sm:max-w-md"
          style={{ zIndex: 9999 }} // Ensure this is above everything
        >
          <DialogHeader>
            <DialogTitle>Enter Location Details</DialogTitle>
            <DialogDescription>
              Please provide the exact location details for the issue
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formElements = e.target.elements;
            
            const manualData = {
              street: formElements.street.value.trim(),
              city: formElements.city.value.trim(),
              state: formElements.state.value.trim(),
              zip: formElements.zip.value.trim(),
              country: formElements.country ? formElements.country.value.trim() : ''
            };
            
            handleManualLocation(manualData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street *</Label>
                <Input
                  id="street"
                  name="street"
                  defaultValue={formData.addressDetails.street}
                  placeholder="e.g., Jais, Amethi, Uttar Pradesh"
                  required
                  className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={formData.addressDetails.city}
                    placeholder="e.g., Amethi"
                    required
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={formData.addressDetails.state}
                    placeholder="e.g., Uttar Pradesh"
                    required
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip" className="text-sm font-medium text-gray-700">Zip Code *</Label>
                  <Input
                    id="zip"
                    name="zip"
                    defaultValue={formData.addressDetails.postcode || formData.addressDetails.zip}
                    placeholder="e.g., 229305"
                    required
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={formData.addressDetails.country}
                    placeholder="e.g., India"
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsManualLocationOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">Report an Issue</h1>
            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <Progress value={progress} className="mb-2 sm:mb-0 sm:flex-1 sm:mr-4" />
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
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
                        <SelectItem value="critical">Urgent - Safety concern</SelectItem>
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
                      onChange={(e) => {
                        // When user manually types an address, clear the coordinates as they no longer match
                        setFormData(prev => ({ 
                          ...prev, 
                          location: e.target.value,
                          // Clear coordinates if they're manually editing the address
                          coordinates: e.target.value !== prev.location ? undefined : prev.coordinates 
                        }));
                      }}
                      placeholder="e.g., Main Street near Oak Avenue"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex flex-row gap-2 sm:space-x-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={detectLocation}
                        className="flex items-center space-x-2"
                        size="sm"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Use Current Location</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsManualLocationOpen(true)}
                        className="flex items-center space-x-2"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Manual Location</span>
                      </Button>
                    </div>
                    {formData.coordinates && (
                      <Badge variant="secondary" className="self-start mt-1">Location detected</Badge>
                    )}
                  </div>
                  
                  {/* Interactive Map */}
                  <div className="w-full">
                    <MapComponent 
                      initialLocation={formData.coordinates}
                      onLocationSelected={(coordinates) => {
                        // When a location is selected on the map, update the coordinates
                        // and use reverse geocoding to get the address
                        const { lat, lng } = coordinates;
                        
                        // Format coordinates for display as fallback
                        const formattedLat = lat.toFixed(6);
                        const formattedLng = lng.toFixed(6);
                        const coordsString = `${formattedLat}, ${formattedLng}`;
                        
                        // Store coordinates and show temporary display while geocoding is in progress
                        setFormData(prev => ({
                          ...prev,
                          coordinates: coordinates,
                          location: `Location (${coordsString})` // Temporary display
                        }));
                        
                        // Get human-readable address using reverse geocoding
                        reverseGeocode(lat, lng)
                          .then(address => {
                            // Fetch the full address details for richer data
                            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error(`Geocoding service responded with status: ${response.status}`);
                                }
                                return response.json();
                              })
                              .then(data => {
                                // Create an address object with structured data
                                const addressData = data.address || {};
                                
                                setFormData(prev => ({
                                  ...prev,
                                  location: address, // Human-readable location string
                                  fullAddress: address, // For backward compatibility
                                  addressDetails: {
                                    street: addressData.road || addressData.pedestrian || '',
                                    houseNumber: addressData.house_number || '',
                                    neighborhood: addressData.suburb || addressData.neighbourhood || addressData.quarter || '',
                                    city: addressData.city || addressData.town || addressData.village || '',
                                    state: addressData.state || addressData.county || '',
                                    country: addressData.country || '',
                                    postcode: addressData.postcode || ''
                                  }
                                }));
                              })
                              .catch(error => {
                                console.error('Error fetching detailed address:', error);
                                // Continue with basic address
                                setFormData(prev => ({
                                  ...prev,
                                  location: address,
                                  fullAddress: address
                                }));
                              });
                          })
                          .catch(error => {
                            console.error('Error getting address from coordinates:', error);
                            // Fallback to coordinates if geocoding fails
                            setFormData(prev => ({
                              ...prev,
                              location: `Location (${coordsString})` // Use coordinates as fallback
                            }));
                          });
                      }}
                    />
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
                      formData.priority === 'critical' ? 'destructive' :
                      formData.priority === 'high' ? 'default' :
                      formData.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {formData.priority === 'critical' ? 'urgent' : formData.priority} priority
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.location}</span>
                    </div>
                    
                    {/* Show detailed address information if available */}
                    {(formData.addressDetails.street || formData.addressDetails.city || formData.addressDetails.state) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p><strong>Address Details:</strong></p>
                        <ul className="pl-4 space-y-1">
                          {formData.addressDetails.street && (
                            <li>Street: {formData.addressDetails.street}</li>
                          )}
                          {formData.addressDetails.city && (
                            <li>City: {formData.addressDetails.city}</li>
                          )}
                          {formData.addressDetails.state && (
                            <li>State: {formData.addressDetails.state}</li>
                          )}
                          {(formData.addressDetails.zip || formData.addressDetails.postcode) && (
                            <li>Zip/Postal Code: {formData.addressDetails.zip || formData.addressDetails.postcode}</li>
                          )}
                          {formData.addressDetails.country && (
                            <li>Country: {formData.addressDetails.country}</li>
                          )}
                        </ul>
                      </div>
                    )}
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
              disabled={!canProceed() || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
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