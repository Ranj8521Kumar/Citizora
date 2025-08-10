import React, { useState, useEffect } from 'react';
import { checkServerConnection } from './api';
import { ApiContext } from './ApiContextStore';

export const ApiProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnectedToServer, setIsConnectedToServer] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'pending', 'failed'
  
  // Effect to monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Effect to check server connection periodically
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!isOnline) {
          setIsConnectedToServer(false);
          return;
        }
        
        const isConnected = await checkServerConnection();
        setIsConnectedToServer(isConnected);
      } catch {
        setIsConnectedToServer(false);
      }
    };
    
    checkConnection();
    const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [isOnline]);
  
  // Context value
  const value = {
    isOnline,
    isConnectedToServer,
    syncStatus,
    setSyncStatus
  };
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
