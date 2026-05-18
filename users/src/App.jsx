import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { CommunityView } from './components/CommunityView';
import { ActiveCitizens } from './components/ActiveCitizens';
import { AuthModal } from './components/AuthModal';
import { ResetPassword } from './components/ResetPassword';
import { Header } from './components/Header';
import apiService from './services/api';
import './utils/testConnection';
import heroBg from './assets/hero-bg.png';

/* ── Fixed full-window background system ─────────────────────────────────── */
function GlobalBackground() {
  return (
    <>
      {/* 1. City photo — fixed, covers 100vw × 100vh */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -20,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* 2. Dark overlay — keeps text readable */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -19,
          background:
            'linear-gradient(180deg, rgba(5,13,26,0.65) 0%, rgba(5,13,26,0.75) 60%, rgba(5,13,26,0.92) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Subtle grid lines */}
      <div
        aria-hidden
        className="bg-grid-lines"
        style={{ position: 'fixed', inset: 0, zIndex: -18, pointerEvents: 'none' }}
      />

      {/* ── EDGE GLOWS (positive z-index, always on top, no pointer events) ── */}

      {/* 4. Left edge — glowing blue bar */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '3px',
          height: '100vh',
          zIndex: 9998,
          background: 'linear-gradient(180deg, transparent 0%, #4f8ef7 25%, #0aadde 75%, transparent 100%)',
          boxShadow: '0 0 18px 6px rgba(79,142,247,0.75), 0 0 60px 20px rgba(79,142,247,0.35)',
          pointerEvents: 'none',
        }}
      />

      {/* 5. Left ambient glow pool */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30vw',
          height: '100vh',
          zIndex: 9997,
          background: 'radial-gradient(ellipse at 0% 40%, rgba(79,142,247,0.20) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* 6. Right edge — glowing cyan bar */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '3px',
          height: '100vh',
          zIndex: 9998,
          background: 'linear-gradient(180deg, transparent 0%, #0aadde 25%, #4f8ef7 75%, transparent 100%)',
          boxShadow: '0 0 18px 6px rgba(10,173,222,0.75), 0 0 60px 20px rgba(10,173,222,0.35)',
          pointerEvents: 'none',
        }}
      />

      {/* 7. Right ambient glow pool */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '30vw',
          height: '100vh',
          zIndex: 9997,
          background: 'radial-gradient(ellipse at 100% 60%, rgba(10,173,222,0.18) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* 8. Bottom purple accent */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '35vh',
          zIndex: 9997,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* 9. Top center blue shine */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60vw',
          height: '3px',
          zIndex: 9998,
          background: 'linear-gradient(90deg, transparent 0%, #4f8ef7 30%, #0aadde 50%, #4f8ef7 70%, transparent 100%)',
          boxShadow: '0 0 16px 4px rgba(79,142,247,0.6)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}


export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  // Check for existing token on app load and look for reset password token in URL
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if the current URL is a password reset link
        // First check if it's directly from the query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const resetTokenFromUrl = urlParams.get('token');
        const pageParam = urlParams.get('page');
        
        // Check for reset password in URL path or query params
        if ((pageParam === 'reset-password' && resetTokenFromUrl) || 
            window.location.pathname.includes('/reset-password')) {
          
          // If token is in the URL path, extract it
          let token = resetTokenFromUrl;
          if (!token) {
            const tokenMatch = window.location.pathname.match(/\/reset-password\/(.+)/);
            if (tokenMatch) token = tokenMatch[1];
          }
          
          if (token) {
            // Handle reset password flow
            setResetToken(token);
            setCurrentPage('reset-password');
            setLoading(false);
            
            // Note: We're no longer modifying the URL here as it causes issues with redirection
            // The full URL update will be handled by the ResetPassword component directly
            return;
          }
        }
        
        // Regular authentication flow
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user
          const userData = await apiService.getCurrentUser();
          
          // Check if user has the required role (user)
          if (!userData || userData.role !== 'user') {
            console.error('Access denied: Only citizens can use this application');
            apiService.clearToken();
            setUser(null);
          } else {
            setUser(userData);
          }
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

  // Define loadReports with useCallback
  const loadReports = useCallback(async () => {
    try {
      setError(null); // Clear any previous errors
      console.log('Loading reports for user:', user);
      
      // Always show loading indicator on refresh
      setLoading(true);
      
      try {
        // Add a timestamp parameter to bust any cache
        const reportsData = await apiService.getReports({ 
          _t: new Date().getTime() 
        });
        console.log('Reports data received from API:', reportsData);
        
        // Process the reports data
        let processedReports = [];
        
        // Handle different data structures
        if (Array.isArray(reportsData)) {
          // Direct array of reports
          processedReports = reportsData;
        } else if (typeof reportsData === 'object') {
          // Could be an object with a reports array or data property
          if (reportsData.data) {
            if (Array.isArray(reportsData.data)) {
              processedReports = reportsData.data;
            } else if (typeof reportsData.data === 'object') {
              // It might be a single report or have a nested structure
              processedReports = [reportsData.data];
            }
          } else if (reportsData.reports && Array.isArray(reportsData.reports)) {
            processedReports = reportsData.reports;
          } else {
            // If no recognizable structure, treat the object itself as a single report
            processedReports = [reportsData];
          }
        }
        
        // Ensure all reports are complete objects with at least a status field
        processedReports = processedReports
          .filter(report => report && typeof report === 'object')
          .map(report => {
            const updatedReport = { ...report };
            // Set default values for missing fields to prevent UI errors
            if (!updatedReport.status) updatedReport.status = 'submitted'; // Default status
            if (!updatedReport.title) updatedReport.title = 'Untitled Report';
            if (!updatedReport.description) updatedReport.description = 'No description provided';
            if (!updatedReport.createdAt) updatedReport.createdAt = new Date().toISOString();
            return updatedReport;
          });
        
        console.log('Reports data for Dashboard:', processedReports);
        
        // Update reports state using functional update to avoid dependency
        setReports(prev => {
          // If we're adding a new report, it's already in the state from handleSubmitReport
          // So we need to merge intelligently without duplicating
          if (prev && prev.length > 0 && processedReports.length > 0) {
            // Create a map of existing reports by ID
            const existingReportsMap = new Map(
              prev.map(report => [report._id, report])
            );
            
            // Update existing reports and add new ones
            processedReports.forEach(report => {
              if (report._id && existingReportsMap.has(report._id)) {
                // Update existing report with new data, preserving any client-side state
                const existingReport = existingReportsMap.get(report._id);
                existingReportsMap.set(report._id, { ...existingReport, ...report });
              } else if (report._id) {
                // Add new report
                existingReportsMap.set(report._id, report);
              }
            });
            
            // Convert map back to array and sort by creation date (newest first)
            return Array.from(existingReportsMap.values())
              .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
          }
          
          // If no existing reports or complete refresh needed, return new reports
          return processedReports;
        });
      } catch (error) {
        console.error('Failed to fetch reports from API:', error);
        setError('Failed to load reports. Please try again later.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
      // Set empty array on error to prevent filter issues
      setReports([]);
    }
  }, [user]); // We're using functional updates, so we don't need reports in the dependency array
  
  // Load reports when user is authenticated
  useEffect(() => {
    console.log('Load reports effect triggered', { user });
    // Always load reports on component mount, even without user for public reports
    loadReports();
  }, [loadReports, user]);

  const handleLogin = (userData) => {
    // Make sure the user has the 'user' role
    const user = userData.user || userData;
    if (!user || user.role !== 'user') {
      console.error('Access denied: Only citizens can use this application');
      apiService.clearToken();
      return;
    }
    
    setUser(user);
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData) => {
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
      // Extract image files for separate upload
      const imageFiles = reportData.imageFiles || [];
      
      // Create a copy of the report data without images for initial submission
      const reportDataWithoutImages = {...reportData};
      delete reportDataWithoutImages.imageFiles;
      
      console.log('Submitting report without images:', reportDataWithoutImages);
      
      // First create the report
      const response = await apiService.createReport(reportDataWithoutImages);
      
      // Extract report from response data structure
      const newReport = response.data?.report || response.report || response;
      const reportId = newReport._id;
      
      if (!reportId) {
        console.error('Failed to get report ID from response:', newReport);
        throw new Error('Failed to create report: Invalid server response');
      }
      
      console.log('New report created with ID:', reportId);
      
      // If there are image files, upload them in a separate call
      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} image files for report ${reportId}`);
        
        try {
          // Upload the image files directly
          const uploadResult = await apiService.uploadReportImages(reportId, imageFiles);
          console.log('Images uploaded successfully', uploadResult);
          
          // Update the report with image data
          if (uploadResult && uploadResult.images) {
            newReport.images = uploadResult.images;
            console.log('Updated report with uploaded images:', newReport);
          }
        } catch (imageError) {
          console.error('Failed to upload images:', imageError);
          // The report was created, but image upload failed
          setError('Report created, but image upload failed. You can add images later.');
        }
      }
      
      // Update the reports state with the new report (including images if uploaded)
      setReports(prev => [newReport, ...prev]);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Failed to submit report:', error);
      setError('Failed to submit report. Please try again.');
    }
  };

  const openAuth = (mode) => {
    // Valid modes: 'login', 'register', 'forgotPassword'
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <GlobalBackground />
        <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="w-14 h-14 rounded-full mx-auto mb-5 animate-spin"
            style={{
              border: '2px solid rgba(79,142,247,0.15)',
              borderTopColor: '#4f8ef7',
              boxShadow: '0 0 20px rgba(79,142,247,0.4)',
            }}
          />
          <p className="text-sm font-medium" style={{ color: 'hsl(215 20% 55%)' }}>Loading Citizora…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent', position: 'relative' }}>
      <GlobalBackground />
      <Header 
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogin={() => openAuth('login')}
        onLogout={handleLogout}
      />
      
      <main>
        {error && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
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
            user={user}
          />
        )}
        
        {currentPage === 'dashboard' && user && (
          <Dashboard 
            user={user}
            reports={reports}
            onNavigate={setCurrentPage}
            onRefresh={loadReports}
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
        
        {currentPage === 'reset-password' && (
          <ResetPassword 
            token={resetToken}
            onComplete={(mode) => {
              // Clear reset token
              setResetToken(null);
              
              // Update app state based on mode
              if (mode === 'forgotPassword') {
                openAuth('forgotPassword');
              } else {
                openAuth('login');
              }
              setCurrentPage('landing');
              
              // Note: We're now handling the full URL redirect directly in ResetPassword component
              // with window.location.href = window.location.origin
            }} 
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