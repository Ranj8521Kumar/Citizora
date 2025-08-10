import React, { useState } from 'react';
import { TaskDashboard } from './components/TaskDashboard';
import { ReportDetail } from './components/ReportDetail';
import { CameraInterface } from './components/CameraInterface';
import { StatusUpdate } from './components/StatusUpdate';
import { MapView } from './components/MapView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NavigationBar } from './components/NavigationBar';
import { AuthProvider } from './components/Auth';
import { useAuth } from './components/Auth/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { ApiProvider } from './services/ApiContext';
import { useApi } from './services/useApi';

// Main App component wrapped with providers
export default function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </AuthProvider>
  );
}

// App content with authentication
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { isOnline, isConnectedToServer, syncStatus, setSyncStatus } = useApi();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState(null);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setCurrentView('report-detail');
  };

  const handleStatusUpdate = async (reportId, status, comment = '') => {
    try {
      setSyncStatus('pending');
      
      // Convert status to API format (replace spaces with underscores)
      const apiStatus = status.replace(/\s+/g, '_').toLowerCase();
      
      // Call the API to update the report status
      const { updateReportStatus } = await import('./services/api');
      await updateReportStatus(reportId, apiStatus, comment);
      
      setSyncStatus('synced');
      
      // If status is "completed", return to dashboard
      if (status.toLowerCase() === 'completed') {
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setSyncStatus('failed');
    }
  };

  // If loading authentication, show a simple loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Loading...</h1>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Determine offline status based on browser online state and server connection
  const isOffline = !isOnline || !isConnectedToServer;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineIndicator isOffline={isOffline} syncStatus={syncStatus} />
      
      <main className="flex-1 pb-20">
        {renderCurrentView()}
      </main>

      <NavigationBar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        isOffline={isOffline}
      />
    </div>
  );

  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard':
        return <TaskDashboard onReportSelect={handleReportSelect} />;
      case 'report-detail':
        return (
          <ReportDetail 
            report={selectedReport} 
            onStatusUpdate={handleStatusUpdate}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'camera':
        return <CameraInterface onBack={() => setCurrentView('dashboard')} />;
      case 'status':
        return <StatusUpdate onBack={() => setCurrentView('dashboard')} />;
      case 'map':
        return <MapView onBack={() => setCurrentView('dashboard')} />;
      default:
        return <TaskDashboard onReportSelect={handleReportSelect} />;
    }
  }
}
