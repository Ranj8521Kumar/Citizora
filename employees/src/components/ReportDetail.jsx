import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Camera, MessageCircle, CheckCircle, Play, Pause, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

export function ReportDetail({ report, onStatusUpdate, onBack }) {
  const [notes, setNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState(report?.status || 'assigned');

  if (!report) return null;

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    onStatusUpdate(report.id, newStatus);
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
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{report.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{report.location}</span>
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
                >
                  <Play className="w-4 h-4" />
                  Start Task
                </Button>
              )}
              
              {currentStatus === 'in-progress' && (
                <>
                  <Button
                    onClick={() => handleStatusChange('completed')}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('assigned')}
                    className="gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                </>
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
            />
            <Button className="w-full">
              Save Notes
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