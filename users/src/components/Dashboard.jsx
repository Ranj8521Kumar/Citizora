import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  MapPin, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Construction,
  FileText,
  Eye,
  Calendar
} from 'lucide-react';
import { DebugReportsAnalyzer } from '../utils/DebugReportsAnalyzer';

export function Dashboard({ user, reports, onNavigate, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const selectedReportRef = useRef(null);
  
  // Update ref whenever selectedReport changes
  useEffect(() => {
    selectedReportRef.current = selectedReport;
  }, [selectedReport]);
  
  // Debug reports data
  useEffect(() => {
    console.log('Reports data in Dashboard:', reports);
    
    // Check the specific structure of reports
    if (Array.isArray(reports)) {
      console.log(`Dashboard received ${reports.length} reports`);
      if (reports.length > 0) {
        console.log('First report sample:', reports[0]);
        // Log image structure explicitly if available
        if (reports[0].images) {
          console.log('Images structure:', JSON.stringify(reports[0].images, null, 2));
        }
        
        // If a report is already selected, update it with the latest data
        const currentSelectedReport = selectedReportRef.current;
        if (currentSelectedReport && currentSelectedReport._id) {
          const updatedSelectedReport = reports.find(r => r._id === currentSelectedReport._id);
          if (updatedSelectedReport && 
              JSON.stringify(updatedSelectedReport) !== JSON.stringify(currentSelectedReport)) {
            console.log('Updating selected report with latest data:', updatedSelectedReport);
            setSelectedReport(updatedSelectedReport);
          }
        } 
        // Always select first report on load if none is selected
        else if (!currentSelectedReport) {
          try {
            // Ensure the report object is safe to use as state
            const safeReport = { ...reports[0] };
            
            // Handle potential problematic fields that might be objects
            if (safeReport.location && typeof safeReport.location === 'object') {
              if (typeof safeReport.location.toString !== 'function') {
                safeReport.location = JSON.stringify(safeReport.location);
              }
            }
            
            setSelectedReport(safeReport);
            console.log('Auto-selected first report:', safeReport);
          } catch (err) {
            console.error('Error selecting report:', err);
          }
        }
      }
    } else if (reports && typeof reports === 'object') {
      console.log('Reports is not an array but an object with keys:', Object.keys(reports));
    } else {
      console.log('Reports is neither an array nor an object');
    }
  }, [reports]); // Only depend on reports, not selectedReport

  // Helper function to render images consistently
  const renderImage = (image, index, type = 'standard', size = 'medium') => {
    console.log(`renderImage called for ${type} image ${index}:`, image);
    let imageUrl = '';
    
    // Determine image size class
    const sizeClass = size === 'small' ? 'h-16' : size === 'large' ? 'h-32' : 'h-20';
    
    // Handle different image formats
    if (typeof image === 'string') {
      imageUrl = image;
      console.log('Image is a string URL:', imageUrl);
    } else if (image && typeof image === 'object') {
      console.log('Image is an object with keys:', Object.keys(image));
      
      // Match the backend model structure where images have a url property
      if (image.url) {
        imageUrl = image.url;
        console.log('Using image URL from backend:', imageUrl);
      }
      // Cloudinary URLs are preferred as fallback
      else if (image.secure_url) {
        imageUrl = image.secure_url;
        console.log('Using Cloudinary secure URL:', imageUrl);
      }
      
      // Fallbacks
      if (!imageUrl) {
        console.log('No primary URL found, trying fallbacks');
        imageUrl = image.path || image.src || 
          (image.urls && (image.urls.regular || image.urls.small || image.urls.thumb));
        if (imageUrl) {
          console.log('Using fallback URL:', imageUrl);
        } else if (image._id || image.filename) {
          // If we have an ID but no URL, construct the image URL
          const imageId = image._id || image.filename;
          imageUrl = `https://civic-connect-backend-aq2a.onrender.com/api/images/${imageId}`;
          console.log('Constructed URL from ID:', imageUrl);
        } else {
          console.log('No valid image URL found in object:', image);
        }
      }
    } else {
      console.log('Invalid image format received:', typeof image, image);
    }
    
    const borderClass = type === 'progress' ? 'border-green-200' : 
                        type === 'status' ? 'border-blue-200' : 'border-gray-200';
    
    console.log(`Rendering ${type} image with URL:`, imageUrl);
    
    return (
      <div key={`${type}-${index}`} className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${type === 'progress' ? 'Progress' : type === 'status' ? 'Status' : ''} photo ${index + 1}`}
            className={`w-full ${sizeClass} object-cover rounded border ${borderClass}`}
            onError={(e) => {
              console.error(`Failed to load ${type} image:`, imageUrl);
              e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
            }}
            onClick={() => window.open(imageUrl, '_blank')}
          />
        ) : (
          <div className={`w-full ${sizeClass} bg-gray-100 flex items-center justify-center rounded border ${borderClass}`}>
            <span className="text-xs text-gray-500">No image</span>
          </div>
        )}
        {(image.uploadedAt || image.timestamp || image.created_at) && (
          <div className={`absolute bottom-0 right-0 ${type === 'progress' ? 'bg-green-800/70' : type === 'status' ? 'bg-blue-800/70' : 'bg-black/70'} text-white text-xs px-1 rounded-tl`}>
            {formatDate(image.uploadedAt || image.timestamp || image.created_at)}
          </div>
        )}
      </div>
    );
  };

  // Normalize report statuses for consistent handling
  const normalizedReports = Array.isArray(reports) ? reports.map(report => {
    // Skip if report is null or undefined
    if (!report) return { status: 'unknown' };
    
    // Create a copy of the report with normalized status
    const normalizedReport = { ...report };
    
    try {
      // Normalize status (convert underscores to hyphens and lowercase)
      const originalStatus = report.status || '';
      normalizedReport.originalStatus = originalStatus; // keep original for reference
      normalizedReport.status = originalStatus.toString().replace(/_/g, '-').toLowerCase();
      
      // Handle special cases
      if (normalizedReport.status === 'in-progress' || normalizedReport.status === 'inprogress') {
        normalizedReport.status = 'in-progress';
      } else if (normalizedReport.status === 'completed') {
        normalizedReport.status = 'resolved';
      } else if (['pending', 'assigned', ''].includes(normalizedReport.status)) {
        normalizedReport.status = 'submitted';
      }
      
      // Ensure other required fields exist
      if (!normalizedReport.title) normalizedReport.title = 'Untitled Report';
      if (!normalizedReport.description) normalizedReport.description = 'No description provided';
    } catch (err) {
      console.error('Error normalizing report:', err, report);
      normalizedReport.status = 'unknown';
    }
    
    return normalizedReport;
  }) : [];

  const filteredReports = normalizedReports.filter(report => {
    // Skip invalid reports
    if (!report || !report.status) {
      console.warn('Skipping invalid report:', report);
      return false;
    }
    
    try {
      // Perform search and status filtering
      const matchesSearch = 
        ((report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Use already normalized status
      const matchesStatus = 
        statusFilter === 'all' || 
        report.status === statusFilter.replace('_', '-').toLowerCase();
      
      return matchesSearch && matchesStatus;
    } catch (err) {
      console.error('Error filtering report:', err, report);
      return false;
    }
  });
  
  // Calculate report stats with normalized status values
  const stats = {
    total: normalizedReports.length,
    submitted: normalizedReports.filter(r => r.status === 'submitted').length,
    inProgress: normalizedReports.filter(r => r.status === 'in-progress').length,
    resolved: normalizedReports.filter(r => r.status === 'resolved').length,
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date/time not available';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Date/time not available: ' + error.message;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'in-progress':
        return Construction;
      case 'submitted':
        return FileText;
      case 'closed':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-accent text-accent-foreground';
      case 'medium':
        return 'bg-yellow-500 text-yellow-50';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date not available: ' + error.message;
    }
  };

  // Extract and normalize image URL from different API response formats
  const getImageUrl = (report) => {
    // Handle different image formats based on API response structure
    try {
      if (!report) return null;
      
      // Look for progress images first (these are typically added by field workers)
      if (report.progressImages && Array.isArray(report.progressImages) && report.progressImages.length > 0) {
        console.log('Found progress images from field workers:', report.progressImages);
        const progressImage = report.progressImages.find(img => 
          img && (typeof img === 'string' || img.url || img.secure_url || img.path || img.src || img._id || img.filename));
          
        if (progressImage) {
          // If image is a string, it's a direct URL
          if (typeof progressImage === 'string') return progressImage;
          
          // Prefer Cloudinary URLs if available
          if (progressImage.secure_url) return progressImage.secure_url;
          if (progressImage.url) return progressImage.url;
          
          // Build URL based on backend structure
          if (progressImage._id || progressImage.filename) {
            const imageId = progressImage._id || progressImage.filename;
            return `https://civic-connect-backend-aq2a.onrender.com/api/images/${imageId}`;
          }
          
          return progressImage.path || progressImage.src;
        }
      }
      
      // Check regular images array as fallback
      if (report.images && Array.isArray(report.images) && report.images.length > 0) {
        console.log('Getting URL from images array', report.images);
        // Get first image that has a valid URL
        const image = report.images.find(img => 
          img && (typeof img === 'string' || img.url || img.secure_url || img.path || img.src || img._id || img.filename));
        
        if (image) {
          // If image is a string, it's a direct URL
          if (typeof image === 'string') return image;
          
          // Prefer Cloudinary URLs if available
          if (image.secure_url) return image.secure_url;
          if (image.url) return image.url;
          
          // Build URL based on backend structure
          if (image._id || image.filename) {
            // If we have an ID, construct the image URL using the backend URL pattern
            const imageId = image._id || image.filename;
            return `https://civic-connect-backend-aq2a.onrender.com/api/images/${imageId}`;
          }
          
          // Check for various properties that might contain the URL
          return image.path || image.src;
        }
      }
      
      // Check for photo or photoUrl property
      if (report.photoUrl) return report.photoUrl;
      if (report.photo) {
        // Handle photo being an object or string
        if (typeof report.photo === 'string') return report.photo;
        if (report.photo.secure_url) return report.photo.secure_url; // Cloudinary secure URL
        if (report.photo.url) return report.photo.url;
        if (report.photo._id) return `https://civic-connect-backend-aq2a.onrender.com/api/images/${report.photo._id}`;
      }
      
      // Check for imageUrl property
      if (report.imageUrl) return report.imageUrl;
      
      // Check for image property
      if (report.image) {
        // Handle image being an object or string
        if (typeof report.image === 'string') return report.image;
        if (report.image.url) return report.image.url;
        if (report.image._id) return report.image._id; // Try _id if url doesn't exist
      }
      
      // Check for attachments
      if (report.attachments && Array.isArray(report.attachments) && report.attachments.length > 0) {
        const attachment = report.attachments[0];
        if (typeof attachment === 'string') return attachment;
        if (attachment.url) return attachment.url;
      }
      
      // No valid image found
      return null;
    } catch (err) {
      console.error('Error getting image URL:', err, report);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName || user?.name || 'User'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setLoading(true);
                  onRefresh().finally(() => setLoading(false));
                }} 
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <Eye className="w-4 h-4" />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </Button>
              <Button onClick={() => onNavigate('report')} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Report</span>
              </Button>

            </div>
          </div>
        </div>
        


        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Construction className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>Track the status of your submitted issues</CardDescription>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start by reporting your first civic issue'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <Button onClick={() => onNavigate('report')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Report an Issue
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredReports.map((report) => {
                      const StatusIcon = getStatusIcon(report.status);
                      return (
                        <div 
                          key={report._id || report.id || Math.random().toString()} 
                          className="p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(report.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {(report.status || 'submitted').replace('-', ' ')}
                                </Badge>
                                {report.priority && (
                                  <Badge variant="outline" className={getPriorityColor(report.priority)}>
                                    {report.priority}
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-medium mb-1">{report.title || 'Untitled Report'}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {report.description || 'No description provided'}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location?.address?.description || 
                                   report.location?.description || 
                                   (typeof report.location === 'string' ? report.location : 
                                    report.location?.address ? 
                                      (typeof report.location.address === 'string' ? 
                                        report.location.address : 'Location available') :
                                      'Location not specified')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(report.createdAt || report.date)}
                                </div>
                                {typeof report.votes === 'number' && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {report.votes} votes
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Detail Sidebar */}
          <div>
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Report Details</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedReport.title || 'Untitled Report'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReport.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {(selectedReport.status || 'submitted').replace('-', ' ')}
                    </Badge>
                    {selectedReport.priority && (
                      <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                        {selectedReport.priority}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedReport.location?.address?.description || 
                         selectedReport.location?.description || 
                         (typeof selectedReport.location === 'string' ? selectedReport.location : 
                          selectedReport.location?.address ? 
                            (typeof selectedReport.location.address === 'string' ? 
                              selectedReport.location.address : 
                              JSON.stringify(selectedReport.location.address).substring(0, 30) + '...') : 
                            'Location not specified')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Submitted {formatDateTime(selectedReport.createdAt || selectedReport.date)}</span>
                    </div>
                    
                    {typeof selectedReport.votes === 'number' && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedReport.votes} community votes</span>
                      </div>
                    )}
                    
                    {selectedReport.estimatedResolution && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Est. resolution: {selectedReport.estimatedResolution}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Photos section - both citizen-uploaded and field worker photos */}
                  {((selectedReport.images && selectedReport.images.length > 0) || 
                   (selectedReport.progressImages && selectedReport.progressImages.length > 0)) && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Photos ({(selectedReport.images?.length || 0) + (selectedReport.progressImages?.length || 0)})
                      </h4>
                      
                      {console.log('Report images:', JSON.stringify(selectedReport.images, null, 2))}
                      
                      {/* Original report images */}
                      {selectedReport.images && selectedReport.images.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">Your submitted photos:</p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {selectedReport.images.map((image, index) => {
                              console.log(`Processing image ${index}:`, image);
                              return renderImage(image, index, 'standard', 'medium');
                            })}
                          </div>
                        </>
                      )}
                      
                      {/* Field worker progress images */}
                      {selectedReport.progressImages && selectedReport.progressImages.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">Progress photos from field workers:</p>
                          {console.log('Progress images:', JSON.stringify(selectedReport.progressImages, null, 2))}
                          <div className="grid grid-cols-2 gap-2">
                            {selectedReport.progressImages.map((image, index) => {
                              console.log(`Processing progress image ${index}:`, image);
                              return renderImage(image, index, 'progress', 'medium');
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Check for the main image if no images array exists */}
                  {!selectedReport.images && getImageUrl(selectedReport) && (
                    <div>
                      <h4 className="font-medium mb-2">Photo</h4>
                      <img
                        src={getImageUrl(selectedReport)}
                        alt="Report image"
                        className="w-full h-auto object-cover rounded border"
                        onError={(e) => {
                          console.error('Failed to load image:', getImageUrl(selectedReport));
                          e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Status Timeline</h4>
                    <div className="space-y-4 text-sm">
                      {/* Basic timeline entries */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">
                            Submitted on {formatDate(selectedReport.createdAt || selectedReport.date)}
                          </span>
                        </div>
                        
                        {/* Show detailed timeline from progressUpdates if available */}
                        {selectedReport.timeline && selectedReport.timeline.length > 0 ? (
                          selectedReport.timeline.map((entry, index) => (
                            <div key={`timeline-${index}`} className="ml-4 border-l border-gray-200 pl-4 pb-4 last:pb-0">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-accent rounded-full -ml-5"></div>
                                  <span className="font-medium">
                                    Status changed to: {entry.status?.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDateTime(entry.timestamp || entry.date)}
                                </span>
                                {entry.comment && (
                                  <p className="text-sm mt-1 ml-2 text-gray-600">
                                    {entry.comment}
                                  </p>
                                )}
                                
                                {/* Show images associated with this timeline entry */}
                                {entry.images && entry.images.length > 0 && (
                                  <div className="mt-2 ml-2">
                                    <p className="text-xs text-muted-foreground mb-1">Status update photos:</p>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {entry.images.map((image, imgIdx) => 
                                        renderImage(image, imgIdx, 'status', 'small')
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : selectedReport.status !== 'submitted' && (selectedReport.updatedAt || selectedReport.lastUpdated) && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span className="text-muted-foreground">
                              Updated to {selectedReport.status.replace('_', ' ')} on {formatDate(selectedReport.updatedAt || selectedReport.lastUpdated)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a report to view detailed information
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}