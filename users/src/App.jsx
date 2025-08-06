import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { CommunityView } from './components/CommunityView';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [reports, setReports] = useState([
    {
      id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues near the intersection',
      category: 'roads',
      location: 'Main Street & Oak Avenue',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      images: [],
      priority: 'high',
      status: 'in-progress',
      userId: '1',
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-16T14:22:00Z',
      votes: 12,
      estimatedResolution: '3-5 business days'
    },
    {
      id: '2',
      title: 'Broken Streetlight',
      description: 'Streetlight has been out for over a week, creating safety concerns',
      category: 'electricity',
      location: 'Pine Street near the park',
      images: [],
      priority: 'medium',
      status: 'submitted',
      userId: '1',
      createdAt: '2025-01-14T16:45:00Z',
      updatedAt: '2025-01-14T16:45:00Z',
      votes: 8,
      estimatedResolution: '5-7 business days'
    }
  ]);

  const handleLogin = (email) => {
    // Mock login
    setUser({
      id: '1',
      name: 'John Doe',
      email: email
    });
    setShowAuthModal(false);
  };

  const handleRegister = (name, email) => {
    // Mock registration
    setUser({
      id: '1',
      name: name,
      email: email
    });
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const handleSubmitReport = (reportData) => {
    const newReport = {
      ...reportData,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      status: 'submitted'
    };
    setReports(prev => [newReport, ...prev]);
    setCurrentPage('dashboard');
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogin={() => openAuth('login')}
        onLogout={handleLogout}
      />
      
      <main>
        {currentPage === 'landing' && (
          <LandingPage 
            onNavigate={setCurrentPage}
            onLogin={() => openAuth('login')}
            onRegister={() => openAuth('register')}
            reports={reports}
          />
        )}
        
        {currentPage === 'dashboard' && user && (
          <Dashboard 
            user={user}
            reports={reports.filter(r => r.userId === user.id)}
            onNavigate={setCurrentPage}
          />
        )}
        
        {currentPage === 'report' && user && (
          <ReportForm 
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentPage('dashboard')}
          />
        )}
        
        {currentPage === 'community' && (
          <CommunityView 
            reports={reports}
            user={user}
            onLogin={() => openAuth('login')}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}