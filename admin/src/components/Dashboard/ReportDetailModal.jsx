import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Separator } from '../ui/separator.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Image, 
  MessageSquare, 
  History,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api.js';

// Reuse the helper functions from ReportManagement
const getPriorityVariant = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

// Format status for display
const formatStatusForDisplay = (status) => {
  if (!status) return '';
  
  // Replace underscores with spaces and capitalize each word
  return status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Default status badge variants
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return 'success';
    case 'in_progress':
      return 'default';
    case 'assigned':
      return 'secondary';
    case 'submitted':
      return 'warning';
    case 'in_review':
      return 'warning';
    case 'closed':
      return 'outline';
    default:
      return 'outline';
  }
};

export function ReportDetailModal({ isOpen, onClose, reportId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Only fetch if modal is open and we have a reportId
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add this method to api.js
      const response = await apiService.getReportDetails(reportId);
      
      console.log('Report details:', response);
      
      // Check where the report data is in the response
      const reportData = response.data?.report || response.report || response;
      
      setReport(reportData);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading report details...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <Button 
              onClick={fetchReportDetails} 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}
        
        {!loading && !error && report && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{report.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(report.status)}>
                    {formatStatusForDisplay(report.status)}
                  </Badge>
                  <Badge variant={getPriorityVariant(report.priority)}>
                    {report.priority}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Report #{report._id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity & Comments</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-gray-700">{report.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Report Information</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Submitted: </span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Time: </span>
                          <span>{new Date(report.createdAt).toLocaleTimeString()}</span>
                        </div>
                        
                        {report.category && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Category: </span>
                            <span>{report.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Location</h3>
                      
                      {report.location?.address ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p>{report.location.address.street}</p>
                              <p>
                                {report.location.address.city}, {report.location.address.state} {report.location.address.zipCode}
                              </p>
                            </div>
                          </div>
                          
                          {/* Show coordinates if available */}
                          {report.location.coordinates && (
                            <div className="text-sm text-gray-500">
                              Lat: {report.location.coordinates[1]}, Long: {report.location.coordinates[0]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No location details available</div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Reporter</h3>
                      
                      {report.reportedBy ? (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>
                            {report.reportedBy.firstName} {report.reportedBy.lastName}
                          </span>
                          <span className="text-gray-500">
                            ({report.reportedBy.email || 'No email'})
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Anonymous report</div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Assignment</h3>
                      
                      {report.assignedTo ? (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>
                            {report.assignedTo.firstName} {report.assignedTo.lastName}
                          </span>
                          <span className="text-gray-500">
                            ({report.assignedTo.email || 'No email'})
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not assigned</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4 mt-4">
                <h3 className="font-medium">Comments & Activity</h3>
                
                {report.comments && report.comments.length > 0 ? (
                  <div className="space-y-4">
                    {report.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {comment.author?.firstName || 'System'} {comment.author?.lastName || ''}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No comments yet</p>
                  </div>
                )}
                
                {report.history && report.history.length > 0 && (
                  <>
                    <h3 className="font-medium mt-6">Status History</h3>
                    <div className="space-y-2">
                      {report.history.map((event, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <History className="h-4 w-4 text-gray-500" />
                          <span>
                            <span className="font-medium">{event.status}</span> on {new Date(event.timestamp).toLocaleString()}
                          </span>
                          {event.user && (
                            <span className="text-gray-500">by {event.user.firstName} {event.user.lastName}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="images" className="mt-4">
                <h3 className="font-medium mb-4">Report Images</h3>
                
                {report.images && report.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.images.map((image, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`Report image ${index + 1}`} 
                          className="w-full h-48 object-cover"
                        />
                        {image.caption && (
                          <div className="p-2 bg-gray-50">
                            <p className="text-sm text-gray-700">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No images available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
