/**
 * Main App Component
 * Sets up routing and layout for the employee app
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import io from 'socket.io-client';
import { SOCKET_URL } from './config';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AssignedReports from './pages/AssignedReports';
import ReportDetail from './pages/ReportDetail';
import FieldTasks from './pages/FieldTasks';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import MapView from './pages/MapView';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Ensure only employees can access the app
  if (user.role !== 'employee') {
    return <div>Access denied. This app is for employees only.</div>;
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
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="assigned-reports" element={<AssignedReports />} />
        <Route path="reports/:id" element={<ReportDetail />} />
        <Route path="field-tasks" element={<FieldTasks />} />
        <Route path="map" element={<MapView />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
