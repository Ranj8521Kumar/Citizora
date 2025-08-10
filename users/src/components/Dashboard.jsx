import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  MapPin, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Construction,
  FileText,
  Eye,
  Calendar
} from 'lucide-react';

export function Dashboard({ user, reports, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-secondary text-secondary-foreground';
      case 'in-progress':
        return 'bg-orange-500 text-white';
      case 'submitted':
        return 'bg-blue-500 text-white';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'in-progress':
        return Construction;
      case 'submitted':
        return FileText;
      case 'closed':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-accent text-accent-foreground';
      case 'medium':
        return 'bg-yellow-500 text-yellow-50';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date not available: ' + error.message;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available: ' + error.message;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.firstName || user.name || 'User'}</p>
            </div>
            <Button onClick={() => onNavigate('report')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Report</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Construction className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>Track the status of your submitted issues</CardDescription>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start by reporting your first civic issue'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <Button onClick={() => onNavigate('report')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Report an Issue
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredReports.map((report) => {
                      const StatusIcon = getStatusIcon(report.status);
                      return (
                        <div 
                          key={report._id || report.id || Math.random()} 
                          className="p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(report.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {(report.status || 'submitted').replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(report.priority)}>
                                  {report.priority || 'medium'}
                                </Badge>
                              </div>
                              
                              <h3 className="font-medium mb-1">{report.title || 'Untitled Report'}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {report.description || 'No description provided'}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location?.address?.description || report.location?.description || 'Location not specified'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(report.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {(report.votes || 0)} votes
                                </div>
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Detail Sidebar */}
          <div>
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Report Details</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedReport.title || 'Untitled Report'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReport.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {(selectedReport.status || 'submitted').replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                      {selectedReport.priority || 'medium'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedReport.location?.address?.description || selectedReport.location?.description || 'Location not specified'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Submitted {formatDateTime(selectedReport.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>{(selectedReport.votes || 0)} community votes</span>
                    </div>
                    
                    {selectedReport.estimatedResolution && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Est. resolution: {selectedReport.estimatedResolution}</span>
                      </div>
                    )}
                  </div>
                  
                  {(selectedReport.images && selectedReport.images.length > 0) && (
                    <div>
                      <h4 className="font-medium mb-2">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.images.map((image, index) => (
                          <img
                            key={index}
                            src={typeof image === 'string' ? image : image.url}
                            alt={`Report image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Status Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">
                          Submitted on {formatDate(selectedReport.createdAt)}
                        </span>
                      </div>
                      {selectedReport.status !== 'submitted' && selectedReport.updatedAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="text-muted-foreground">
                            Updated on {formatDate(selectedReport.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a report to view detailed information
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}