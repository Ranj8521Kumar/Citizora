import React, { useState } from 'react';
import { TaskDashboard } from './components/TaskDashboard';
import { ReportDetail } from './components/ReportDetail';
import { CameraInterface } from './components/CameraInterface';
import { StatusUpdate } from './components/StatusUpdate';
import { MapView } from './components/MapView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NavigationBar } from './components/NavigationBar';
import { AuthProvider, useAuth } from './components/Auth';
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
    // When changing to dashboard view, reset to showing all tasks
    if (view === 'dashboard') {
      setCurrentView('dashboard');
    } else {
      setCurrentView(view);
    }
  };

  const handleReportSelect = (report) => {
    // Make sure the report has properly formatted fields before passing to ReportDetail
    const formattedReport = {
      ...report,
      
      // Ensure location is a string, not an object
      location: formatLocation(report.location)
    };
    
    setSelectedReport(formattedReport);
    setCurrentView('report-detail');
  };
  
  // Helper function to format location data as a string
  const formatLocation = (location) => {
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object' && location !== null) {
      // If location has a string address property
      if (location.address && typeof location.address === 'string') {
        return location.address;
      }
      
      // If location.address is an object with street, city, etc.
      if (location.address && typeof location.address === 'object') {
        const addr = location.address;
        const parts = [];
        if (addr.street) parts.push(addr.street);
        if (addr.city) parts.push(addr.city);
        if (addr.state) parts.push(addr.state);
        if (addr.zipCode) parts.push(addr.zipCode);
        return parts.join(', ') || 'Unknown location';
      }
      
      // If location has direct street, city properties
      if (location.street || location.city || location.state) {
        const parts = [];
        if (location.street) parts.push(location.street);
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        if (location.zipCode) parts.push(location.zipCode);
        return parts.join(', ') || 'Unknown location';
      }
    }
    
    return 'Unknown location';
  };

  const handleStatusUpdate = async (reportId, status, comment = '') => {
    try {
      setSyncStatus('pending');
      
      // Convert UI status to API format - fieldworkers can only use in_progress or resolved
      let apiStatus;
      switch (status.toLowerCase()) {
        case 'in-progress':
          // Check if we're transitioning from paused to in-progress
          if (selectedReport && selectedReport.status === 'paused') {
            comment = comment || 'Task resumed';
          }
          apiStatus = 'in_progress';
          break;
        case 'completed':
          apiStatus = 'resolved'; // API uses 'resolved' instead of 'completed'
          break;
        case 'paused':
          // When "pausing", we're actually using in_progress state but with a "paused" comment
          apiStatus = 'in_progress';
          comment = comment || 'Task paused';
          break;
        case 'assigned':
          apiStatus = 'in_progress';
          comment = comment || 'Task assigned';
          break;
        default:
          apiStatus = 'in_progress'; // Default to in_progress for safety
      }
      
      // Call the API to update the report status
      const { updateReportStatus } = await import('./services/api');
      const updatedReport = await updateReportStatus(reportId, apiStatus, comment);
      
      setSyncStatus('synced');
      
      // Update the selected report with the new data
      if (selectedReport && selectedReport.id === reportId) {
        const updatedReportData = updatedReport.data.report;
        
        // Update the selected report preserving the UI status if it's paused
        setSelectedReport({
          ...selectedReport,
          ...updatedReportData,
          // Preserve the UI status if we're pausing
          status: status === 'paused' ? 'paused' : apiStatus.replace(/_/g, '-'),
          // Make the timeline available for the ReportDetail component
          timeline: updatedReportData.timeline,
          // Ensure location is still a string
          location: updatedReportData.location ? formatLocation(updatedReportData.location) : selectedReport.location
        });
      }
      
      // If status is "completed", return to dashboard with completed filter
      if (status.toLowerCase() === 'completed') {
        // This will trigger a re-render of TaskDashboard with the completed filter
        setCurrentView('dashboard-completed');
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
        currentView={currentView.startsWith('dashboard') ? 'dashboard' : currentView} 
        onViewChange={handleViewChange}
        isOffline={isOffline}
      />
    </div>
  );

  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard':
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="all" />;
      case 'dashboard-completed':
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="completed" />;
      case 'dashboard-assigned':
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="assigned" />;
      case 'dashboard-in-progress':
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="in-progress" />;
      case 'dashboard-paused':
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="paused" />;
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
        return <TaskDashboard onReportSelect={handleReportSelect} initialFilter="all" />;
    }
  }
}
