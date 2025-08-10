import React, { useState, useEffect } from 'react';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.jsx';
import apiService from '../../services/api.js';
import { NotificationItem, NotificationDetailsDialog } from './NotificationComponents.jsx';

export const NotificationPopover = ({ onViewAll }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch notifications when the component mounts and when the popover opens
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling interval for notifications (every 60 seconds)
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRefresh = async () => {
    await fetchNotifications();
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      // Update the local state to mark notification as read
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      // Update all notifications in the local state to mark them as read
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Call the API to delete the notification
      await apiService.deleteNotification(notificationId);
      
      // Update the local state to remove the notification
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n._id !== notificationId)
      );
      
      // Close details dialog if this was the selected notification
      if (selectedNotification && selectedNotification._id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
  };
  
  const handleCloseDetails = () => {
    setSelectedNotification(null);
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            aria-label="Notifications"
            onClick={() => {
              if (!isOpen) {
                fetchNotifications();
              }
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b flex justify-between items-center p-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  aria-label="Mark all as read"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {error && (
              <div className="p-4 text-center text-red-500 text-sm">
                <p>{error}</p>
                <Button variant="ghost" size="sm" onClick={handleRefresh} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}
            
            {loading && notifications.length === 0 && (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            )}
            
            {!loading && notifications.length === 0 && !error && (
              <div className="p-8 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll be notified about important updates and messages
                </p>
              </div>
            )}
            
            {notifications.slice(0, 5).map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteNotification}
              />
            ))}
            
            {notifications.length > 5 && (
              <div className="p-4 text-center text-sm text-gray-500">
                {notifications.length - 5} more notifications
              </div>
            )}
          </div>
          
          <div className="p-2 border-t text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600"
              onClick={() => {
                setIsOpen(false);
                if (onViewAll) onViewAll();
              }}
            >
              View All Notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <NotificationDetailsDialog
        notification={selectedNotification}
        onClose={handleCloseDetails}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
};
