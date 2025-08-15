import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { useToast } from '../ui/use-toast.jsx';
import {
  Bell,
  Check,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCheck,
  Bookmark,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import apiService from '../../services/api.js';

export const NotificationDetailsDialog = ({ notification, onClose, onMarkAsRead, onDelete }) => {
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Store whether report details have been shown to avoid duplicate API calls
  const [detailsShown, setDetailsShown] = useState(false);
  
  const fetchReportDetails = React.useCallback(async () => {
    console.log('Fetching report details for:', notification);
    if (!notification || !notification.relatedTo?.id || notification.relatedTo?.model !== 'report') {
      console.log('Cannot fetch report: Invalid notification or related data', notification?.relatedTo);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Calling API with report ID:', notification.relatedTo.id);
      const response = await apiService.getReportDetails(notification.relatedTo.id);
      console.log('Report details received:', response);
      setReportDetails(response.data || response);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  }, [notification]);
  
  // Only auto-fetch report details when explicitly requested by user action,
  // not when simply opening the dialog
  React.useEffect(() => {
    if (detailsShown && notification?.relatedTo?.model === 'report' && !reportDetails) {
      console.log('Auto-fetching report details after user request');
      fetchReportDetails();
    }
  }, [notification, fetchReportDetails, detailsShown, reportDetails]);
  
  if (!notification) return null;
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'normal':
        return 'text-blue-500';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'report_status':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'assignment':
        return <Bookmark className="w-5 h-5 text-blue-500" />;
      case 'feedback':
        return <CheckCheck className="w-5 h-5 text-green-500" />;
      case 'message':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={!!notification} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col p-2 sm:p-4" 
        style={{ 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '95vw',
          maxWidth: '500px',
          maxHeight: '95vh',
          margin: '0 auto',
          overflowY: 'auto'
        }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(notification._id)}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <DialogHeader className="flex-shrink-0 pt-4">
          <DialogTitle className="text-lg font-semibold truncate pr-10">{notification.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {!notification.isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onMarkAsRead(notification._id);
                  // Add confirmation feedback for better UX
                  if (toast) {
                    toast({
                      title: "Marked as read",
                      description: "Notification has been marked as read.",
                      duration: 2000
                    });
                  }
                }}
                className="h-8 px-2"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark as read
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {notification.createdAt 
                ? format(new Date(notification.createdAt), 'PPpp')
                : 'Unknown date'}
            </span>
          </div>
          <DialogDescription className="mt-2 flex items-center gap-2">
            {getTypeIcon(notification.type)}
            <Badge className="capitalize">{notification.type.replace('_', ' ')}</Badge>
            <Badge 
              variant="outline" 
              className={`ml-2 ${getPriorityColor(notification.priority)}`}
            >
              {notification.priority}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex-1 overflow-y-auto overflow-x-hidden px-1" style={{ maxHeight: 'calc(80vh - 150px)' }}>
          {/* Notification message */}
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700 break-words w-full">
            {notification.message}
          </div>
          
          {/* Related content section */}
          {notification.relatedTo && notification.relatedTo.id && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related to:</h4>
              
              {/* View details button - shown only when details haven't been loaded yet or were hidden */}
              {!reportDetails && !loading && !error && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start animate-fadeIn"
                  onClick={async () => {
                    console.log('View details button clicked');
                    
                    // Mark as viewing details to trigger the useEffect
                    setDetailsShown(true);
                    
                    // Fetch report details directly
                    try {
                      setLoading(true);
                      setError(null);
                      
                      if (notification?.relatedTo?.id) {
                        const reportId = notification.relatedTo.id;
                        console.log('Fetching report with ID:', reportId);
                        
                        const response = await apiService.getReportDetails(reportId);
                        console.log('Report details received:', response);
                        
                        if (response && (response.data || response)) {
                          setReportDetails(response.data || response);
                          
                          // Mark notification as read if not already read
                          if (!notification.isRead) {
                            setTimeout(() => {
                              onMarkAsRead(notification._id);
                            }, 100);
                          }
                        } else {
                          setError('Invalid report data received');
                        }
                      }
                    } catch (err) {
                      console.error('Error fetching report details:', err);
                      setError('Failed to load report details');
                      setDetailsShown(false);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View {notification.relatedTo.model || 'item'} details
                </Button>
              )}
              
              {/* Loading indicator */}
              {loading && (
                <div className="mt-4 text-center py-4">
                  <div className="animate-spin w-6 h-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading report details...</p>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setDetailsShown(true);
                      fetchReportDetails();
                    }} 
                    className="text-sm mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {/* Report details display - only shown after successfully loading details */}
              {reportDetails && !loading && !error && (
                <div className="mt-4 border rounded-md overflow-hidden w-full animate-fadeIn">
                  <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                    <h3 className="font-medium text-sm truncate max-w-[70%]">
                      Report #{reportDetails._id?.substring(0, 8) || 'Unknown ID'}
                      {reportDetails.title && ` - ${reportDetails.title}`}
                    </h3>
                    <Badge 
                      className="capitalize text-xs flex-shrink-0" 
                      variant={
                        reportDetails.status === 'resolved' ? 'success' : 
                        reportDetails.status === 'in_progress' ? 'default' : 
                        reportDetails.status === 'submitted' ? 'outline' : 'secondary'
                      }
                    >
                      {reportDetails.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium truncate">{reportDetails.category || 'Uncategorized'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Priority</p>
                        <Badge 
                          variant={
                            reportDetails.priority === 'high' ? 'destructive' : 
                            reportDetails.priority === 'medium' ? 'default' : 'outline'
                          }
                          className="capitalize text-xs"
                        >
                          {reportDetails.priority || 'Normal'}
                        </Badge>
                      </div>
                    </div>
                    
                    {reportDetails.location?.address && (
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm truncate">
                          {reportDetails.location.address.street && `${reportDetails.location.address.street}, `}
                          {reportDetails.location.address.city && `${reportDetails.location.address.city}, `}
                          {reportDetails.location.address.state && `${reportDetails.location.address.state} `}
                          {reportDetails.location.address.zipCode && reportDetails.location.address.zipCode}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Submitted By</p>
                        <p className="text-sm truncate">
                          {reportDetails.submittedBy?.firstName && reportDetails.submittedBy?.lastName ? 
                            `${reportDetails.submittedBy.firstName} ${reportDetails.submittedBy.lastName}` : 
                            'Anonymous'}
                        </p>
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Reported On</p>
                        <p className="text-sm">
                          {reportDetails.timestamp || reportDetails.createdAt
                            ? format(new Date(reportDetails.timestamp || reportDetails.createdAt), 'PP')
                            : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    
                    {reportDetails.description && (
                      <div>
                        <p className="text-xs text-gray-500">Description</p>
                        <div className="text-sm bg-gray-50 p-2 rounded border break-words max-w-full overflow-hidden">
                          {reportDetails.description}
                        </div>
                      </div>
                    )}
                    
                    {reportDetails.timeline && reportDetails.timeline.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Timeline</p>
                        <div className="border rounded overflow-hidden max-h-32 overflow-y-auto">
                          {reportDetails.timeline.map((entry, index) => (
                            <div 
                              key={index} 
                              className={`p-2 text-xs border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                            >
                              <div className="flex justify-between items-center">
                                <Badge variant="outline" className="capitalize text-xs px-1 py-0">
                                  {entry.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {entry.timestamp ? format(new Date(entry.timestamp), 'MM/dd/yy h:mm a') : ''}
                                </span>
                              </div>
                              {entry.comment && <p className="text-gray-700 mt-1 text-xs break-words">{entry.comment}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {reportDetails.assignedTo && (
                      <div>
                        <p className="text-xs text-gray-500">Assigned To</p>
                        <p className="text-sm font-medium truncate">
                          {typeof reportDetails.assignedTo === 'object' && reportDetails.assignedTo !== null ? 
                           `${reportDetails.assignedTo.firstName || ''} ${reportDetails.assignedTo.lastName || ''}`.trim() : 
                           reportDetails.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                    )}
                    
                    {reportDetails.images && reportDetails.images.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Images</p>
                        <div className="flex flex-wrap gap-2">
                          {reportDetails.images.map((image, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-100 rounded overflow-hidden border">
                              {image.url && (
                                <img 
                                  src={image.url} 
                                  alt={`Report image ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReportDetails(null);
                          setDetailsShown(false);
                          
                          // Show feedback to the user
                          if (toast) {
                            toast({
                              title: "Details hidden",
                              description: "You can view the details again by clicking the button above.",
                              duration: 2000
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                        Hide Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onViewDetails, 
  onDelete 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Prevent click propagation when clicking on menu items
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className={`p-2 sm:p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onClick={() => onViewDetails(notification)}
    >
      <div className="flex justify-between">
        <h4 className="font-medium text-xs sm:text-sm truncate pr-2">{notification.title}</h4>
        <div className="flex gap-1 flex-shrink-0">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </Button>
          )}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                aria-label="More options"
                title="More options"
              >
                <MoreHorizontal className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 sm:w-48">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(notification);
                }}
                className="text-xs sm:text-sm py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                View details
              </DropdownMenuItem>
              {!notification.isRead && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification._id);
                  }}
                  className="text-xs sm:text-sm py-1.5"
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-red-600 text-xs sm:text-sm py-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification._id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
      <div className="flex justify-between items-center mt-2">
        <Badge 
          variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'normal' ? 'default' : 'outline'}
          className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5"
        >
          {notification.type.replace('_', ' ')}
        </Badge>
        <span className="text-[10px] sm:text-xs text-gray-500">
          {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
        </span>
      </div>
    </div>
  );
};
