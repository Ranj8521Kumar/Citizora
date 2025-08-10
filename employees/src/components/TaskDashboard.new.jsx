import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Filter, Search, Star, ArrowRight, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { downloadCSV, downloadJSON } from '../utils/csvExport';
import { ExportButton } from './ui/export-button';
import { getFieldWorkerReports } from '../services/api';
import { formatTimeAgo } from '../utils/dateUtils';

export function TaskDashboard({ onReportSelect }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Convert filter to API format (only send status if not 'all')
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };
        
        if (filter !== 'all') {
          params.status = filter;
        }
        
        const response = await getFieldWorkerReports(params);
        
        // Format reports to match our component structure
        const formattedReports = response.data.reports.map(report => ({
          id: report._id,
          title: report.title,
          location: report.location?.address || 'Unknown location',
          priority: report.priority || 'medium',
          status: report.status.replace('_', '-'),
          timeAgo: formatTimeAgo(report.createdAt),
          description: report.description,
          estimatedTime: report.estimatedTime || 'Unknown',
          category: report.category || 'General',
          // Include original report data for reference
          originalData: report
        }));
        
        setReports(formattedReports);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [filter, pagination.page, pagination.limit]);

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

  // Filter reports by search term (client-side)
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort reports by priority
  const sortedReports = filteredReports.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Calculate status counts from API data
  const statusCounts = {
    all: reports.length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    'in-progress': reports.filter(r => r.status === 'in-progress').length,
    completed: reports.filter(r => r.status === 'completed').length
  };

  const filters = [
    { id: 'all', label: 'All Tasks', count: statusCounts.all },
    { id: 'assigned', label: 'Assigned', count: statusCounts.assigned },
    { id: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] },
    { id: 'completed', label: 'Completed', count: statusCounts.completed }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-foreground text-lg font-semibold">Task Dashboard</h1>
          <ExportButton
            data={reports}
            filename="field-worker-tasks"
            options={[
              { label: 'CSV', onClick: data => downloadCSV(data, 'field-worker-tasks') },
              { label: 'JSON', onClick: data => downloadJSON(data, 'field-worker-tasks') }
            ]}
          />
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map(item => (
              <Button
                key={item.id}
                variant={filter === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(item.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {item.label}
                <Badge variant="secondary" className="ml-1">
                  {item.count}
                </Badge>
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by title or location..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No tasks found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'All your assigned tasks will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map(report => (
              <Card key={report.id} className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => onReportSelect(report)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(report.status)}
                        <h3 className="font-medium text-foreground truncate">{report.title}</h3>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <span className="text-xs text-muted-foreground truncate">
                          {report.location}
                        </span>
                        <span className="hidden sm:block text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{report.timeAgo}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={getPriorityVariant(report.priority)}>
                          {report.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{report.category}</Badge>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="border-t border-border p-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
