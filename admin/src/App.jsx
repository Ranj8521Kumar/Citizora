import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout/DashboardLayout.jsx';
import { ExecutiveDashboard } from './components/Dashboard/ExecutiveDashboard.jsx';
import { AnalyticsHub } from './components/Analytics/AnalyticsHub.jsx';
import { UserManagement } from './components/Users/UserManagement.jsx';

// Placeholder components for additional sections
const ReportManagement = () => {
  return (
    <div className="p-8 text-center bg-white rounded-lg shadow-sm">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl text-gray-900 mb-4">Report Management</h2>
        <p className="text-gray-600 mb-6">
          Advanced report filtering, bulk actions, and assignment tools would be displayed here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Kanban View</h3>
            <p className="text-sm text-gray-600">Drag-and-drop report management</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Advanced Filters</h3>
            <p className="text-sm text-gray-600">Multi-criteria report filtering</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Bulk Operations</h3>
            <p className="text-sm text-gray-600">Mass assignment and updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeAssignment = () => {
  return (
    <div className="p-8 text-center bg-white rounded-lg shadow-sm">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl text-gray-900 mb-4">Employee Assignment</h2>
        <p className="text-gray-600 mb-6">
          Drag-and-drop interface with workload balancing for field workers would be displayed here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Workload Balance</h3>
            <p className="text-sm text-gray-600">Intelligent task distribution</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Performance Tracking</h3>
            <p className="text-sm text-gray-600">Real-time field worker metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemAdministration = () => {
  return (
    <div className="p-8 text-center bg-white rounded-lg shadow-sm">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl text-gray-900 mb-4">System Administration</h2>
        <p className="text-gray-600 mb-6">
          Configuration settings, security settings, and audit logs would be displayed here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Security Settings</h3>
            <p className="text-sm text-gray-600">Access control and permissions</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">Audit Logs</h3>
            <p className="text-sm text-gray-600">Complete activity tracking</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg text-gray-800 mb-2">API Management</h3>
            <p className="text-sm text-gray-600">External integrations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;