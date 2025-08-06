import React from 'react';
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function OfflineIndicator({ isOffline, syncStatus }) {
  if (!isOffline && syncStatus === 'synced') return null;

  const getIndicatorContent = () => {
    if (isOffline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        title: 'Working Offline',
        description: 'Changes will sync when connection is restored',
        variant: 'destructive'
      };
    }
    
    if (syncStatus === 'pending') {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        title: 'Syncing...',
        description: 'Uploading recent changes',
        variant: 'default'
      };
    }
    
    return {
      icon: <Check className="w-4 h-4" />,
      title: 'All changes synced',
      description: 'Your data is up to date',
      variant: 'default'
    };
  };

  const content = getIndicatorContent();

  return (
    <div className="p-4 border-b border-border bg-card">
      <Alert variant={content.variant} className="border-none shadow-none p-3">
        <div className="flex items-center gap-3">
          {content.icon}
          <div className="flex-1 min-w-0">
            <AlertDescription className="font-medium text-sm">
              {content.title}
            </AlertDescription>
            <AlertDescription className="text-xs text-muted-foreground mt-0.5">
              {content.description}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}