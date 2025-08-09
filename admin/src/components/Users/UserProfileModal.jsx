import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Badge } from '../ui/badge.jsx';
import { format } from 'date-fns';

export const UserProfileModal = ({ user, open, onOpenChange }) => {
  if (!user) return null;

  // Format join date if it exists and is valid
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'PPP'); // Localized date format
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 py-4">
          {/* User Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profileImage || ""} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0] || '').join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="mt-1">
                <Badge variant={
                  user.role === 'Administrator' ? 'default' : 
                  user.role === 'Field Worker' ? 'secondary' : 'outline'
                }>
                  {user.role}
                </Badge>
                <Badge variant={user.status === 'Active' ? 'success' : 'destructive'} className="ml-2">
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user.phone || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Join Date</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Last Active</p>
              <p className="font-medium">{user.lastLogin || 'Never'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Reports Submitted</p>
              <p className="font-medium">{user.reports || 0}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{user.address || 'Not provided'}</p>
            </div>
          </div>

          {/* Activity & Stats (if applicable) */}
          {(user.role === 'Field Worker' || user.role === 'Administrator') && (
            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-3">Activity & Statistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-600 mb-1">Reports Handled</p>
                  <p className="text-xl font-medium">{user.reportsHandled || 0}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-md">
                  <p className="text-sm text-green-600 mb-1">Completed</p>
                  <p className="text-xl font-medium">{user.tasksCompleted || 0}</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-md">
                  <p className="text-sm text-amber-600 mb-1">In Progress</p>
                  <p className="text-xl font-medium">{user.tasksInProgress || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
