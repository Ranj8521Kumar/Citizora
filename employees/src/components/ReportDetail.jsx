import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Camera, MessageCircle, CheckCircle, Play, Pause, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { saveReportNotes } from '../services/api';

export function ReportDetail({ report, onStatusUpdate, onBack }) {
  const [notes, setNotes] = useState('');
  
  // Determine the initial status, checking for paused state
  const getInitialStatus = (report) => {
    if (!report) return 'assigned';
    
    // First convert API format to UI format
    let status = report.status?.replace(/_/g, '-') || 'assigned';
    
    // Check if this is actually a paused task
    if (report.isPaused) {
      // Use the isPaused flag set by the API service
      status = 'paused';
    } 
    else if (status === 'in-progress' && report.timeline) {
      // Check the original data if available
      const timeline = report.originalData?.timeline || report.timeline;
      
      if (timeline && timeline.length > 0) {
        const lastEntry = timeline[timeline.length - 1];
        if (lastEntry && lastEntry.comment && lastEntry.comment.includes('Task paused')) {
          status = 'paused';
        }
      }
      
      // Also check local storage as a last resort
      const pausedReports = JSON.parse(localStorage.getItem('pausedReports') || '{}');
      if (pausedReports[report._id] || pausedReports[report.id]) {
        status = 'paused';
      }
    }
    
    return status;
  };
  
  const [currentStatus, setCurrentStatus] = useState(getInitialStatus(report));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Update status when report changes (e.g., on refresh)
  useEffect(() => {
    setCurrentStatus(getInitialStatus(report));
  }, [report]);

  if (!report) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Prepare a comment based on the status change
      let comment = '';
      if (newStatus === 'paused') {
        comment = 'Task paused';
      } else if (currentStatus === 'paused' && newStatus === 'in-progress') {
        comment = 'Task resumed';
      }
      
      // Update local state
      setCurrentStatus(newStatus);
      
      // Call the parent component handler (which will call the API)
      // Use report._id if it exists, otherwise fall back to report.id
      const reportId = report._id || report.id;
      await onStatusUpdate(reportId, newStatus, comment);
      
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSaveError('Failed to update status. Please try again.');
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Call API to save notes
      // Use report._id if it exists, otherwise fall back to report.id
      const reportId = report._id || report.id;
      await saveReportNotes(reportId, notes);
      
      // Reset notes after saving
      setNotes('');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaveError('Failed to save notes. Please try again.');
      setIsSaving(false);
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'assigned': return 'secondary';
      case 'in-progress': return 'default';
      case 'paused': return 'destructive'; // Using destructive (usually red/orange) for paused
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-foreground">Task Details</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getPriorityVariant(report.priority)}>
            {report.priority.toUpperCase()} PRIORITY
          </Badge>
          <Badge variant={getStatusVariant(currentStatus)}>
            {currentStatus.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {saveError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-destructive text-sm">
            {saveError}
          </div>
        )}
        
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{report.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {(() => {
                  // Safe location rendering logic
                  if (typeof report.location === 'string') {
                    return report.location;
                  }
                  
                  if (typeof report.location === 'object' && report.location !== null) {
                    // Case 1: If location has a string address property
                    if (report.location.address && typeof report.location.address === 'string') {
                      return report.location.address;
                    }
                    
                    // Case 2: If location.address is an object with street, city, etc.
                    if (report.location.address && typeof report.location.address === 'object') {
                      const addr = report.location.address;
                      const parts = [];
                      if (addr.street) parts.push(addr.street);
                      if (addr.city) parts.push(addr.city);
                      if (addr.state) parts.push(addr.state);
                      if (addr.zipCode) parts.push(addr.zipCode);
                      return parts.join(', ') || 'Unknown location';
                    }
                    
                    // Case 3: If location has direct street, city properties
                    if (report.location.street || report.location.city || report.location.state) {
                      const parts = [];
                      if (report.location.street) parts.push(report.location.street);
                      if (report.location.city) parts.push(report.location.city);
                      if (report.location.state) parts.push(report.location.state);
                      if (report.location.zipCode) parts.push(report.location.zipCode);
                      return parts.join(', ') || 'Unknown location';
                    }
                    
                    // Case 4: If location has other properties we can't anticipate
                    return 'Location details available';
                  }
                  
                  return 'Unknown location';
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Reported {report.timeAgo} • Est. {report.estimatedTime}</span>
            </div>
            <Separator />
            <p className="text-foreground">{report.description}</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {currentStatus === 'assigned' && (
                <Button
                  onClick={() => handleStatusChange('in-progress')}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Task
                    </>
                  )}
                </Button>
              )}
              
              {currentStatus === 'in-progress' && (
                <>
                  <Button
                    onClick={() => handleStatusChange('completed')}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('paused')}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                </>
              )}
              
              {currentStatus === 'paused' && (
                <Button
                  onClick={() => handleStatusChange('in-progress')}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Task
                    </>
                  )}
                </Button>
              )}
              
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
              
              <Button variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" />
                Navigate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your progress..."
              className="resize-none"
              rows={4}
              disabled={isSaving}
            />
            <Button 
              className="w-full"
              onClick={handleSaveNotes}
              disabled={!notes.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact Supervisor
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contact
            </Button>
          </CardContent>
        </Card>

        {/* Photo Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Photo Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Mock photo thumbnails */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2 border-dashed">
              <Camera className="w-4 h-4" />
              Add Photo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}