/**
 * Main App Component
 * Sets up routing and layout for the user app
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import io from 'socket.io-client';
import { SOCKET_URL } from './config';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const { user } = useAuth();
  
  // Set up socket connection
  useEffect(() => {
    if (user) {
      const socket = io(SOCKET_URL);
      
      // Join user's room for notifications
      socket.emit('join-room', user._id);
      
      // Clean up on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="report-issue" element={<ReportIssue />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="reports/:id" element={<ReportDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
