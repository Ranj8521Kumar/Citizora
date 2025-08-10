import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Filter, Search, Star, ArrowRight, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { downloadCSV, downloadJSON } from '../utils/csvExport';
import { ExportButton } from './ui/export-button';

export function TaskDashboard({ onReportSelect }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const reports = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      location: '123 Main St',
      priority: 'high',
      status: 'assigned',
      timeAgo: '2 hours ago',
      description: 'Large pothole causing traffic issues',
      estimatedTime: '45 min',
      category: 'Road Maintenance'
    },
    {
      id: 2,
      title: 'Broken Street Light',
      location: '456 Oak Ave',
      priority: 'medium',
      status: 'in-progress',
      timeAgo: '4 hours ago',
      description: 'Street light not functioning properly',
      estimatedTime: '30 min',
      category: 'Electrical'
    },
    {
      id: 3,
      title: 'Graffiti Removal',
      location: '789 Pine St',
      priority: 'low',
      status: 'assigned',
      timeAgo: '1 day ago',
      description: 'Graffiti on building wall',
      estimatedTime: '20 min',
      category: 'Cleaning'
    },
    {
      id: 4,
      title: 'Water Main Issue',
      location: '321 Elm Dr',
      priority: 'urgent',
      status: 'assigned',
      timeAgo: '30 minutes ago',
      description: 'Water leak reported by resident',
      estimatedTime: '2 hours',
      category: 'Utilities'
    }
  ];

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedReports = filteredReports.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const filters = [
    { id: 'all', label: 'All Tasks', count: reports.length },
    { id: 'assigned', label: 'Assigned', count: reports.filter(r => r.status === 'assigned').length },
    { id: 'in-progress', label: 'In Progress', count: reports.filter(r => r.status === 'in-progress').length },
    { id: 'completed', label: 'Completed', count: reports.filter(r => r.status === 'completed').length }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground">Field Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {filteredReports.length} active tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => downloadCSV(reports, 'task-reports.csv')}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <ExportButton 
              onExportCSV={() => downloadCSV(reports, 'task-reports.csv')}
              onExportJSON={() => downloadJSON(reports, 'task-reports.json')}
              buttonSize="sm"
              label="Export Options"
            />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tasks or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {filters.map((filterOption) => (
            <Button
              key={filterOption.id}
              variant={filter === filterOption.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.id)}
              className="justify-between"
            >
              <span>{filterOption.label}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {filterOption.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {sortedReports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
            onClick={() => onReportSelect(report)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityVariant(report.priority)} className="text-xs">
                      {report.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.category}
                    </Badge>
                  </div>
                  <h3 className="text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {report.location}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {report.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(report.status)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {report.status.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {report.timeAgo}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {report.estimatedTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}