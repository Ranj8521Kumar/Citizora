import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getImageUrl } from '../utils/imageHelper';
import { 
  Search, 
  MapPin, 
  Clock, 
  TrendingUp,
  ChevronUp,
  Filter,
  Eye,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  Construction,
  FileText,
  Calendar
} from 'lucide-react';

// Helper function to format a structured address
const formatStructuredAddress = (address) => {
  if (!address) return 'Location not specified';
  
  // Build address components in order of specificity
  const parts = [];
  
  // Add street address with house number if available
  if (address.street) {
    const streetPart = address.houseNumber ? 
      `${address.houseNumber} ${address.street}` : 
      address.street;
    parts.push(streetPart);
  }
  
  // Add neighborhood if available
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  
  // Add city/state
  if (address.city) {
    const locationPart = address.state ? 
      `${address.city}, ${address.state}` : 
      address.city;
    parts.push(locationPart);
  } else if (address.state) {
    parts.push(address.state);
  }
  
  // Fallback to description if we couldn't build anything useful
  if (parts.length === 0 && address.description) {
    return address.description;
  }
  
  return parts.join(', ') || 'Location not specified';
};

export function CommunityView({ reports, user, onLogin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedReport, setSelectedReport] = useState(null);
  const [votedReports, setVotedReports] = useState(new Set());

  // Ensure reports is an array and provide safety checks
  const safeReports = Array.isArray(reports) ? reports : [];
  
  // Normalize report statuses and categories for consistent handling
  const normalizedReports = safeReports.map(report => {
    if (!report) return { status: 'unknown', category: 'other' };
    
    const normalizedReport = { ...report };
    
    try {
      // Normalize status (convert underscores to hyphens and lowercase)
      const originalStatus = report.status || '';
      normalizedReport.originalStatus = originalStatus; // keep original for reference
      normalizedReport.status = originalStatus.toString().replace(/_/g, '-').toLowerCase();
      
      // Handle special cases for status
      if (normalizedReport.status === 'in-progress' || normalizedReport.status === 'inprogress') {
        normalizedReport.status = 'in-progress';
      } else if (normalizedReport.status === 'completed') {
        normalizedReport.status = 'resolved';
      } else if (['pending', ''].includes(normalizedReport.status)) {
        normalizedReport.status = 'submitted';
      } else if (normalizedReport.status === 'assigned') {
        normalizedReport.status = 'assigned';
      }
      
      // Normalize category
      const originalCategory = report.category || report.type || '';
      normalizedReport.originalCategory = originalCategory;
      
      // Convert to lowercase and normalize
      const categoryStr = originalCategory.toString().toLowerCase().trim();
      
      // Map similar categories to our standard categories
      if (!categoryStr || categoryStr === 'undefined' || categoryStr === 'null') {
        normalizedReport.category = 'other';
      } else if (categoryStr.includes('road') || categoryStr.includes('street') || categoryStr.includes('transport') || 
                 categoryStr.includes('traffic') || categoryStr.includes('highway')) {
        normalizedReport.category = 'roads';
      } else if (categoryStr.includes('water') || categoryStr.includes('flood') || categoryStr.includes('leak') || 
                 categoryStr.includes('drain') || categoryStr.includes('sewage')) {
        normalizedReport.category = 'water';
      } else if (categoryStr.includes('waste') || categoryStr.includes('trash') || categoryStr.includes('garbage') || 
                 categoryStr.includes('litter') || categoryStr.includes('recycling')) {
        normalizedReport.category = 'waste';
      } else if (categoryStr.includes('electric') || categoryStr.includes('power') || categoryStr.includes('light') || 
                 categoryStr.includes('outage')) {
        normalizedReport.category = 'electricity';
      } else if (categoryStr.includes('safe') || categoryStr.includes('security') || categoryStr.includes('crime') || 
                 categoryStr.includes('hazard')) {
        normalizedReport.category = 'safety';
      } else if (categoryStr.includes('infrastructure') || categoryStr.includes('building') || 
                 categoryStr.includes('facility') || categoryStr.includes('structure')) {
        normalizedReport.category = 'infrastructure';
      } else {
        normalizedReport.category = 'other';
      }
    } catch (err) {
      console.error('Error normalizing report:', err, report);
      normalizedReport.status = 'unknown';
      normalizedReport.category = 'other';
    }
    
    return normalizedReport;
  });

  // Debug log for categories
  console.log('Reports with categories:', normalizedReports.map(r => ({ 
    id: r._id, 
    title: r.title,
    category: r.category, 
    originalCategory: r.originalCategory
  })));
  console.log('Current category filter:', categoryFilter);

  const filteredAndSortedReports = normalizedReports
    .filter(report => {
      const matchesSearch = (report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (report.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (report.location?.address?.description || report.location?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      
      // Debug log for category filtering
      if (categoryFilter !== 'all' && !matchesCategory) {
        console.log('Report filtered out by category:', { 
          id: report._id, 
          title: report.title,
          reportCategory: report.category, 
          filterCategory: categoryFilter
        });
      }
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes': {
          // Safely handle null/undefined votes
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          return bVotes - aVotes;
        }
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, undefined: 0, null: 0 };
          const aPriority = priorityOrder[a.priority || 'undefined'] || 0;
          const bPriority = priorityOrder[b.priority || 'undefined'] || 0;
          return bPriority - aPriority;
        }
        case 'recent':
        default: {
          try {
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            return bDate - aDate;
          } catch (err) {
            console.error('Error sorting by date:', err);
            return 0;
          }
        }
      }
    });

  const stats = {
    total: normalizedReports.length,
    resolved: normalizedReports.filter(r => r.status === 'resolved').length,
    inProgress: normalizedReports.filter(r => r.status === 'in-progress').length,
    assigned: normalizedReports.filter(r => r.status === 'assigned').length,
    closed: normalizedReports.filter(r => r.status === 'closed').length,
    totalVotes: normalizedReports.reduce((sum, r) => sum + (r.votes || 0), 0),
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'roads', name: 'Roads & Transport' },
    { id: 'water', name: 'Water Issues' },
    { id: 'waste', name: 'Waste Management' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'safety', name: 'Public Safety' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'other', name: 'Other' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-orange-500 text-white';
      case 'submitted':
        return 'bg-blue-500 text-white';
      case 'closed':
        return 'bg-gray-500 text-white';
      case 'assigned':
        return 'bg-purple-500 text-white';
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
      case 'assigned':
        return Users;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
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
    } catch {
      return 'Date not available';
    }
  };

  const handleVote = (reportId) => {
    if (!user) {
      onLogin();
      return;
    }
    
    if (!reportId) {
      console.warn('Cannot vote: report ID is undefined');
      return;
    }
    
    setVotedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };
  
  // Debug function to log report images when a report is selected
  useEffect(() => {
    if (selectedReport) {
      console.log(`Selected report ${selectedReport._id || selectedReport.id} images:`, selectedReport.images);
      console.log(`Selected report progress images:`, selectedReport.progressImages);
      
      if (selectedReport.images && selectedReport.images.length > 0) {
        selectedReport.images.forEach((img, idx) => {
          console.log(`Image ${idx + 1}:`, {
            type: typeof img,
            value: img,
            isString: typeof img === 'string',
            isObject: typeof img === 'object' && img !== null,
            hasUrl: typeof img === 'object' && img !== null && 'url' in img
          });
        });
      } else {
        console.log('No images found in selected report');
      }
    }
  }, [selectedReport]);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      console.log('Category not found:', categoryId, 'Available categories:', categories.map(c => c.id));
      return categoryId || 'Other';
    }
    return category.name;
  };
  
  // Format status text for display (capitalize and replace hyphens with spaces)
  const formatStatusText = (status) => {
    if (!status) return 'Submitted';
    
    // Replace hyphens with spaces and capitalize each word
    return status
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
          <p className="text-muted-foreground">See what issues your neighbors are reporting and help prioritize them</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-[rgb(30,64,175)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="text-2xl font-bold">{stats.assigned}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
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
                <Construction className="w-8 h-8 text-[rgb(235,96,23)]" />
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
                <CheckCircle className="w-8 h-8 text-[rgb(5,150,105)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed</p>
                  <p className="text-2xl font-bold">{stats.closed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Community Issues</CardTitle>
                <CardDescription>
                  Help prioritize community issues by voting on reports that matter to you
                </CardDescription>
                
                {/* Filters */}
                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports by title, description, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* All filters in one line */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className={`w-full sm:w-40 ${categoryFilter !== 'all' ? "border-blue-500 ring-1 ring-blue-500" : ""}`}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className={`w-full sm:w-40 ${statusFilter !== 'all' ? "border-blue-500 ring-1 ring-blue-500" : ""}`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className={`w-full sm:w-40 ${sortBy !== 'recent' ? "border-blue-500 ring-1 ring-blue-500" : ""}`}>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="votes">Most Votes</SelectItem>
                        <SelectItem value="priority">Highest Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filter indicators shown below dropdowns */}
                  {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'recent') && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t">
                      {searchTerm && (
                        <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                          <span>Search: {searchTerm}</span>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      )}
                      
                      {categoryFilter !== 'all' && (
                        <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                          <span>Category: {getCategoryName(categoryFilter)}</span>
                          <button 
                            onClick={() => setCategoryFilter('all')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      )}
                      
                      {statusFilter !== 'all' && (
                        <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                          <span>Status: {formatStatusText(statusFilter)}</span>
                          <button 
                            onClick={() => setStatusFilter('all')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      )}
                      
                      {sortBy !== 'recent' && (
                        <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                          <span>Sort: {sortBy === 'votes' ? 'Most Votes' : 'Highest Priority'}</span>
                          <button 
                            onClick={() => setSortBy('recent')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      )}
                      
                      {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'recent') && (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setCategoryFilter('all');
                            setStatusFilter('all');
                            setSortBy('recent');
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredAndSortedReports.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm && "Try removing search terms or "}
                      {statusFilter !== 'all' && <span>Try removing status filter "{formatStatusText(statusFilter)}" or </span>}
                      {categoryFilter !== 'all' && <span>Try removing category filter "{getCategoryName(categoryFilter)}" or </span>}
                      adjust your filters
                    </p>
                    <div className="mt-4">
                      {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCategoryFilter('all');
                          }}
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredAndSortedReports.map((report) => {
                      const StatusIconComponent = getStatusIcon(report.status);
                      const reportId = report._id || report.id;
                      const hasVoted = votedReports.has(reportId);
                      
                      return (
                        <div 
                          key={report._id || report.id || Math.random()} 
                          className={`p-6 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${getPriorityColor(report.priority)}`}
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex gap-4">
                            {/* Vote Button */}
                            <div className="flex flex-col items-center">
                              <Button
                                variant={hasVoted ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(report._id || report.id);
                                }}
                                className={`p-2 ${hasVoted ? 'bg-primary' : ''}`}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-medium mt-1">
                                {(report.votes || 0) + (hasVoted ? 1 : 0)}
                              </span>
                            </div>
                            
                            {/* Report Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(report.status)}>
                                  <StatusIconComponent className="w-3 h-3 mr-1" />
                                  {formatStatusText(report.status)}
                                </Badge>
                                <Badge variant="outline">
                                  {getCategoryName(report.category)}
                                </Badge>
                              </div>
                              
                              <h3 className="font-medium mb-1">{report.title || 'Untitled Report'}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {report.description || 'No description provided'}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location?.address?.description || 
                                   report.location?.description || 
                                   (typeof report.location === 'string' ? report.location : 
                                    report.location?.address?.street ? 
                                      formatStructuredAddress(report.location.address) :
                                      report.location?.coordinates ? 
                                        `Detected location` :
                                        'Location not specified')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(report.createdAt)}
                                </div>
                                {report.estimatedResolution && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Est. {report.estimatedResolution}
                                  </div>
                                )}
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
                      {React.createElement(getStatusIcon(selectedReport.status), { className: "w-3 h-3 mr-1" })}
                      {formatStatusText(selectedReport.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryName(selectedReport.category)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedReport.location?.address?.description || 
                         selectedReport.location?.description || 
                         (typeof selectedReport.location === 'string' ? selectedReport.location : 
                          selectedReport.location?.address?.street ? 
                            formatStructuredAddress(selectedReport.location.address) :
                            selectedReport.location?.coordinates ? 
                              `Detected location` :
                              'Location not specified')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Reported {formatDateTime(selectedReport.createdAt)}</span>
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
                        {selectedReport.images.map((image, index) => {
                          // Use the utility function to get a valid image URL
                          const imageUrl = getImageUrl(image);
                          
                          return (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Report image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                console.error(`Failed to load image: ${imageUrl}`);
                                e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(selectedReport._id || selectedReport.id);
                      }}
                      variant={votedReports.has(selectedReport._id || selectedReport.id) ? "default" : "outline"}
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      {votedReports.has(selectedReport._id || selectedReport.id) ? 'Voted' : 'Vote'} 
                      ({(selectedReport.votes || 0) + (votedReports.has(selectedReport._id || selectedReport.id) ? 1 : 0)})
                    </Button>
                  </div>
                  
                  {!user && (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Sign in to vote on community reports
                      </p>
                      <Button size="sm" onClick={onLogin}>
                        Sign In
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a report to view detailed information and vote
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