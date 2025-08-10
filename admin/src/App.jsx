import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/Layout/DashboardLayout.jsx';
import { ExecutiveDashboard } from './components/Dashboard/ExecutiveDashboard.jsx';
import { AnalyticsHub } from './components/Analytics/AnalyticsHub.jsx';
import { UserManagement } from './components/Users/UserManagement.jsx';
import { ReportManagement } from './components/Dashboard/ReportManagement.jsx';
import { EmployeeAssignment } from './components/Dashboard/EmployeeAssignment.jsx';
import { SystemAdministration } from './components/Dashboard/SystemAdministration.jsx';
import { NotificationsPage } from './components/Layout/NotificationsPage.jsx';
import { AuthModal } from './components/Auth/AuthModal.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import { Shield } from 'lucide-react';
import apiService from './services/api';
import './utils/testConnection';

// Real components are now imported at the top of the file

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user
          const userData = await apiService.getCurrentUser();
          
          // Verify user is an admin
          if (userData.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
          }
          
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        apiService.clearToken();
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    apiService.clearToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'analytics':
        return <AnalyticsHub />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'employees':
        return <EmployeeAssignment />;
      case 'settings':
        return <SystemAdministration />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CivicConnect Admin</h1>
            <p className="text-gray-600 mt-2">Administrative portal for city management</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              {error}
              <button 
                onClick={() => setError(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Login to Admin Portal
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin} 
        />
      </div>
    );
  }

  return (
    <>
      <DashboardLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      >
        {renderContent()}
      </DashboardLayout>
      <Toaster />
    </>
  );
};

export default App;