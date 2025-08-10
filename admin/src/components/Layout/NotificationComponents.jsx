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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{notification.title}</DialogTitle>
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkAsRead(notification._id)}
                  className="h-8 px-2"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark as read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification._id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
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
        
        <div className="mt-4">
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
            {notification.message}
          </div>
          
          {notification.relatedTo && notification.relatedTo.id && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related to:</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View {notification.relatedTo.model || 'item'} details
              </Button>
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
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onClick={() => onViewDetails(notification)}
    >
      <div className="flex justify-between">
        <h4 className="font-medium text-sm">{notification.title}</h4>
        <div className="flex gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                aria-label="More options"
                title="More options"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onViewDetails(notification);
              }}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View details
              </DropdownMenuItem>
              {!notification.isRead && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification._id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
      <div className="flex justify-between items-center mt-2">
        <Badge variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'normal' ? 'default' : 'outline'}>
          {notification.type.replace('_', ' ')}
        </Badge>
        <span className="text-xs text-gray-500">
          {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
        </span>
      </div>
    </div>
  );
};
