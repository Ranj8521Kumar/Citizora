/**
 * Authentication Context
 * Provides authentication state and methods to the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token and get user data
        const response = await axios.get(`${API_URL}/api/users/me`);
        
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (err) {
        console.error('Auth check error:', err);
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { token, data } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(data.user);
        setIsAuthenticated(true);
        
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      
      const response = await axios.patch(`${API_URL}/api/users/profile`, userData);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
