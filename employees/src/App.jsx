import React, { useState, useEffect } from 'react';
import { TaskDashboard } from './components/TaskDashboard';
import { ReportDetail } from './components/ReportDetail';
import { CameraInterface } from './components/CameraInterface';
import { StatusUpdate } from './components/StatusUpdate';
import { MapView } from './components/MapView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NavigationBar } from './components/NavigationBar';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Simulate offline/online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setCurrentView('report-detail');
  };

  const handleStatusUpdate = (reportId, status) => {
    // Mock status update
    console.log(`Updating report ${reportId} to status: ${status}`);
    setSyncStatus('pending');
    setTimeout(() => setSyncStatus('synced'), 2000);
  };

  const renderCurrentView = () => {
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
  };

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
}