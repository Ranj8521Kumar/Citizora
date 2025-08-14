import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Loader2, AlertTriangle } from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import apiService from '../../services/api.js';

export const DeactivateUserModal = ({ user, open, onOpenChange, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user || !user.id) {
      showToast({
        title: 'Error',
        message: 'User ID is missing. Cannot deactivate user.',
        type: 'error'
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log(`Deactivating user ${user.name} (${user.id})`);
      
      // Call the API to deactivate the user (set isActive to false)
      const result = await apiService.toggleUserStatus(user.id, false);
      
      console.log('User deactivation result:', result);
      
      // Persist in localStorage for development/demo
      if (window.location.hostname === 'localhost') {
        localStorage.setItem(`user_${user.id}_status`, 'inactive');
      }
      
      showToast({
        title: 'Success',
        message: 'User has been deactivated successfully',
        type: 'success'
      });
      
      onSuccess?.(user.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deactivating user:', error);
      
      showToast({
        title: 'Error',
        message: 'Failed to deactivate user. Please try again.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Deactivate User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this user? The user will be marked as inactive in the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-medium">User to be deactivated:</p>
            <p className="text-red-900 mt-1">{user?.name || 'Unknown User'}</p>
            <p className="text-red-600 text-sm mt-1">{user?.email || 'No email'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              'Deactivate User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
