import React, { useState, useEffect, useCallback } from 'react';
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

  // Define loadReports with useCallback
  const loadReports = useCallback(async () => {
    try {
      setError(null); // Clear any previous errors
      console.log('Loading reports for user:', user);
      
      // Get data from API - don't show loading indicator for refreshes
      // to prevent the whole app from re-rendering
      const currentReports = reports;
      let showLoadingIndicator = currentReports.length === 0;
      
      try {
        // Only show loading indicator on initial load, not on refreshes
        if (showLoadingIndicator) {
          setLoading(true);
        }
        
        const reportsData = await apiService.getReports();
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
        
        // Update reports state without triggering a complete UI refresh
        setReports(prev => {
          // If we're adding a new report, it's already in the state from handleSubmitReport
          // So we need to merge intelligently without duplicating
          if (prev.length > 0 && processedReports.length > 0) {
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
        if (showLoadingIndicator) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
      // Set empty array on error to prevent filter issues
      setReports([]);
    }
  }, [user, reports]); // Include user and reports as dependencies
  
  // Load reports when user is authenticated
  useEffect(() => {
    console.log('Load reports effect triggered', { user });
    // Always load reports on component mount, even without user for public reports
    loadReports();
  }, [loadReports, user]);

  const handleLogin = (userData) => {
    setUser(userData.user || userData);
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