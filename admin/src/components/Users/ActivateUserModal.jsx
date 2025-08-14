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
import { Loader2, CheckCircle } from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import apiService from '../../services/api.js';

export const ActivateUserModal = ({ user, open, onOpenChange, onSuccess }) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!user || !user.id) {
      showToast({
        title: 'Error',
        message: 'User ID is missing. Cannot activate user.',
        type: 'error'
      });
      return;
    }

    setIsActivating(true);
    
    try {
      console.log(`Activating user ${user.name} (${user.id})`);
      
      // Call the API to activate the user (set isActive to true)
      const result = await apiService.toggleUserStatus(user.id, true);
      
      console.log('User activation result:', result);
      
      // Persist in localStorage for development/demo
      if (window.location.hostname === 'localhost') {
        localStorage.setItem(`user_${user.id}_status`, 'active');
      }
      
      showToast({
        title: 'Success',
        message: 'User has been activated successfully',
        type: 'success'
      });
      
      // Call the success handler and close the modal
      onSuccess?.(user.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error activating user:', error);
      
      showToast({
        title: 'Error',
        message: 'Failed to activate user. Please try again.',
        type: 'error'
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Activate User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to activate this user? The user will be able to access the system again.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800 font-medium">User to be activated:</p>
            <p className="text-green-900 mt-1">{user?.name || 'Unknown User'}</p>
            <p className="text-green-600 text-sm mt-1">{user?.email || 'No email'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isActivating}
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleActivate}
            disabled={isActivating}
          >
            {isActivating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
