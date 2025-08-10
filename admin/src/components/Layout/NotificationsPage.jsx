import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Input } from '../ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { 
  RefreshCw, 
  CheckCheck, 
  Bell, 
  Filter, 
  Search,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { NotificationItem, NotificationDetailsDialog } from './NotificationComponents.jsx';
import apiService from '../../services/api.js';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      // Update all notifications in local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by tab
    if (activeTab === 'unread' && notification.isRead) return false;
    if (activeTab === 'read' && !notification.isRead) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // Filter by search term
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Count by type
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notifications and messages</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="outline" className="ml-2">{notifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <Badge variant="outline" className="ml-2">{unreadCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read
                  <Badge variant="outline" className="ml-2">{readCount}</Badge>
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search"
                    placeholder="Search notifications..." 
                    className="pl-9 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="report_status">Report status</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              <div className="border rounded-lg overflow-hidden">
                {error && (
                  <div className="p-6 flex items-center justify-center">
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {loading && notifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
                    <p className="text-gray-500">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      {searchTerm || typeFilter !== 'all' ? 
                        'Try adjusting your search or filters to find what you\'re looking for.' : 
                        'You don\'t have any notifications at the moment.'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map(notification => (
                      <NotificationItem 
                        key={notification._id} 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <div className="border rounded-lg overflow-hidden">
                {unreadCount === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <CheckCheck className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500 text-center">
                      You don't have any unread notifications.
                    </p>
                  </div>
                )}
                
                {unreadCount > 0 && (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map(notification => (
                      <NotificationItem 
                        key={notification._id} 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="read" className="m-0">
              <div className="border rounded-lg overflow-hidden">
                {readCount === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No read notifications</h3>
                    <p className="text-gray-500 text-center">
                      You don't have any read notifications yet.
                    </p>
                  </div>
                )}
                
                {readCount > 0 && (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map(notification => (
                      <NotificationItem 
                        key={notification._id} 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <NotificationDetailsDialog
        notification={selectedNotification}
        onClose={handleCloseDetails}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
};
