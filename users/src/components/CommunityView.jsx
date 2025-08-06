import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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

export function CommunityView({ reports, user, onLogin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedReport, setSelectedReport] = useState(null);
  const [votedReports, setVotedReports] = useState(new Set());

  const filteredAndSortedReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const stats = {
    total: reports.length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    totalVotes: reports.reduce((sum, r) => sum + r.votes, 0),
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'roads', name: 'Roads & Transport' },
    { id: 'water', name: 'Water Issues' },
    { id: 'waste', name: 'Waste Management' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'safety', name: 'Public Safety' },
    { id: 'infrastructure', name: 'Infrastructure' },
  ];

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleVote = (reportId) => {
    if (!user) {
      onLogin();
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

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  <p className="text-sm text-muted-foreground">Community Votes</p>
                  <p className="text-2xl font-bold">{stats.totalVotes}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
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
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="votes">Most Voted</SelectItem>
                        <SelectItem value="priority">Highest Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredAndSortedReports.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredAndSortedReports.map((report) => {
                      const StatusIcon = getStatusIcon(report.status);
                      const hasVoted = votedReports.has(report.id);
                      
                      return (
                        <div 
                          key={report.id} 
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
                                  handleVote(report.id);
                                }}
                                className={`p-2 ${hasVoted ? 'bg-primary' : ''}`}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-medium mt-1">
                                {report.votes + (hasVoted ? 1 : 0)}
                              </span>
                            </div>
                            
                            {/* Report Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(report.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {report.status.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline">
                                  {getCategoryName(report.category)}
                                </Badge>
                              </div>
                              
                              <h3 className="font-medium mb-1">{report.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {report.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location}
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
                    <h3 className="font-medium mb-2">{selectedReport.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryName(selectedReport.category)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedReport.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Reported {formatDateTime(selectedReport.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedReport.votes} community votes</span>
                    </div>
                    
                    {selectedReport.estimatedResolution && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Est. resolution: {selectedReport.estimatedResolution}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedReport.images.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Report image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(selectedReport.id);
                      }}
                      variant={votedReports.has(selectedReport.id) ? "default" : "outline"}
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      {votedReports.has(selectedReport.id) ? 'Voted' : 'Vote'} 
                      ({selectedReport.votes + (votedReports.has(selectedReport.id) ? 1 : 0)})
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