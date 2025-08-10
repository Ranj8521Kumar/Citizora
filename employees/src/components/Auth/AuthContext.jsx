import React, { useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, getAuthToken } from '../../services/api';
import { AuthContext } from './AuthContextStore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Effect to check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      if (getAuthToken()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Authentication error:', err.message);
          apiLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
