import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { CommunityView } from './components/CommunityView';
import { ActiveCitizens } from './components/ActiveCitizens';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import apiService from './services/api';
import './utils/testConnection';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [reports, setReports] = useState([]);
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
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load reports when user is authenticated
  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const reportsData = await apiService.getReports();
      // Ensure reportsData is an array
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
      // Set empty array on error to prevent filter issues
      setReports([]);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData.user || userData);
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData, token) => {
    setUser(userData.user || userData);
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiService.clearToken();
    setUser(null);
    setReports([]);
    setCurrentPage('landing');
  };

  const handleSubmitReport = async (reportData) => {
    try {
      const response = await apiService.createReport(reportData);
      // Extract report from response data structure
      const newReport = response.data?.report || response;
      setReports(prev => [newReport, ...prev]);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Failed to submit report:', error);
      setError('Failed to submit report. Please try again.');
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 mx-4 mt-4 rounded-md">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-destructive hover:text-destructive/80"
            >
              ×
            </button>
          </div>
        )}

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
            reports={reports.filter(r => r.submittedBy?._id === user._id || r.submittedBy === user._id)}
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
        
        {currentPage === 'citizens' && (
          <ActiveCitizens />
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