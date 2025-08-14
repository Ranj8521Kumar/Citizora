// This is a custom component that creates proper Deactivate/Activate buttons
import React from 'react';
import { Button } from '../ui/button.jsx';
import { Ban, CheckCircle } from 'lucide-react';

export const StatusToggleButton = ({ user, onToggle, isDisabled = false }) => {
  // Determine if the user is active
  const isActive = user.status === 'Active';

  if (isActive) {
    return (
      <Button
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700"
        onClick={() => onToggle(user.id)}
        disabled={isDisabled}
      >
        <Ban className="w-4 h-4 mr-1" />
        Deactivate
      </Button>
    );
  } else {
    return (
      <Button
        variant="default"
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => onToggle(user.id)}
        disabled={isDisabled}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Activate
      </Button>
    );
  }
};
