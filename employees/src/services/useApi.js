import { useContext } from 'react';
import { ApiContext } from './ApiContextStore';

// Custom hook to use API context
export const useApi = () => {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  
  return context;
};
