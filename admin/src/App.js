/**
 * Main App Component
 * Sets up routing and layout for the admin panel
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import io from 'socket.io-client';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Employees from './pages/Employees';
import Users from './pages/Users';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MapView from './pages/MapView';

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
      const socket = io('http://localhost:5000');
      
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
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:id" element={<ReportDetail />} />
        <Route path="employees" element={<Employees />} />
        <Route path="users" element={<Users />} />
        <Route path="map" element={<MapView />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
