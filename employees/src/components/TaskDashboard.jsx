import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Filter, Search, Star, ArrowRight, Download, Loader2, Pause, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { downloadCSV, downloadJSON } from '../utils/csvExport';
import { ExportButton } from './ui/export-button';
import { getFieldWorkerReports } from '../services/api';
import { formatTimeAgo } from '../utils/dateUtils';
import { DashboardHeader } from './DashboardHeader';

export function TaskDashboard({ onReportSelect, initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  
  // Update filter when initialFilter changes
  useEffect(() => {
    console.log("Initial filter changed to:", initialFilter);
    setFilter(initialFilter);
    // Reset pagination when filter changes
    setPagination(prev => ({...prev, page: 1}));
  }, [initialFilter]);
  
  // Function to handle manual refresh
  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshTimestamp(Date.now());
  };

  // Effect to fetch reports when component mounts, pagination changes, or refresh is triggered
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Convert filter to API format (only send status if not 'all')
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };
        
        // Call API to fetch reports
        const response = await getFieldWorkerReports(params);
        
        // Process the response data
        console.log("API Response:", response.data);
        
        // Format reports to match our component structure
        const formattedReports = response.data.reports.map(report => {
          // Format location as a string
          let formattedLocation = 'Unknown location';
          if (report.location && report.location.address) {
            const address = report.location.address;
            if (typeof address === 'string') {
              formattedLocation = address;
            } else if (typeof address === 'object') {
              // Extract address components and join them
              const parts = [];
              if (address.street) parts.push(address.street);
              if (address.city) parts.push(address.city);
              if (address.state) parts.push(address.state);
              if (address.zipCode) parts.push(address.zipCode);
              formattedLocation = parts.join(', ') || 'Unknown location';
            }
          }

          // Map API status to UI status
          let status;
          console.log(`Original report status: ${report.status}`);
          
          if (report.status === 'resolved') {
            status = 'completed';
          } else {
            status = report.status.replace(/_/g, '-'); // Convert API status format
          }
          
          // Check if the task is paused
          if (report.isPaused) {
            status = 'paused';
          } 
          // Fallback: Check if this is actually a paused task (in_progress with "Task paused" comment)
          else if (status === 'in-progress' && report.timeline && report.timeline.length > 0) {
            const lastEntry = report.timeline[report.timeline.length - 1];
            if (lastEntry && lastEntry.comment && lastEntry.comment.includes('Task paused')) {
              status = 'paused';
            }
          }
          
          return {
            id: report._id,
            title: report.title,
            location: formattedLocation,
            priority: report.priority || 'medium',
            status: status,
            timestamp: report.createdAt,
            timeAgo: formatTimeAgo(report.createdAt),
            category: report.category || 'general',
            description: report.description,
            images: report.images || [],
            timeline: report.timeline || [],
            assignedTo: report.assignedTo,
            reportedBy: report.reportedBy
          };
        });
        
        // Update state with formatted reports
        setReports(formattedReports);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalReports || formattedReports.length,
          pages: response.data.totalPages || Math.ceil(formattedReports.length / prev.limit)
        }));
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchData();
  }, [pagination.page, pagination.limit, refreshTimestamp]);

  // Filter reports based on selected filter and search term
  const filteredReports = reports.filter(report => {
    // First apply status filter
    if (filter !== 'all') {
      if (filter === 'in-progress') {
        if (report.status !== 'in-progress') {
          return false;
        }
      }
      else if (filter === 'paused') {
        if (report.status !== 'paused') {
          return false;
        }
      }
      else if (filter === 'assigned') {
        if (report.status !== 'assigned') {
          return false;
        }
      } 
      else if (filter === 'completed') {
        if (report.status !== 'completed' && report.status !== 'resolved') {
          return false;
        }
      } 
      // For all other tabs, match the exact status
      else if (report.status !== filter) {
        return false;
      }
    }
    
    // Filter by search term
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof report.location === 'string' && 
                          report.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort reports by priority
  const sortedReports = filteredReports.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Calculate status counts from reports data after mapping is applied
  const statusCounts = {
    all: reports.length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    'in-progress': reports.filter(r => r.status === 'in-progress').length,
    paused: reports.filter(r => r.status === 'paused').length,
    completed: reports.filter(r => r.status === 'completed' || r.status === 'resolved').length
  };
  
  // Debug - log status counts
  console.log("Status counts:", statusCounts);
  console.log("Current filter:", filter);

  const filters = [
    { id: 'all', label: 'All Tasks', count: statusCounts.all },
    { id: 'assigned', label: 'Assigned', count: statusCounts.assigned },
    { id: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] },
    { id: 'paused', label: 'Paused', count: statusCounts.paused },
    { id: 'completed', label: 'Completed', count: statusCounts.completed }
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Task Dashboard" 
        onRefresh={handleRefresh} 
        isRefreshing={refreshing || loading}
      >
        <ExportButton
          data={reports}
          filename="field-worker-tasks"
          options={[
            { label: 'CSV', onClick: data => downloadCSV(data, 'field-worker-tasks') },
            { label: 'JSON', onClick: data => downloadJSON(data, 'field-worker-tasks') }
          ]}
        />
      </DashboardHeader>
      
      <div className="bg-card border-t border-border p-4">
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
        {loading && !refreshing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : filter !== 'all' ? 'Try selecting a different filter' : 'No tasks are currently assigned to you'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedReports.map(report => (
              <Card 
                key={report.id} 
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => onReportSelect(report)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-foreground line-clamp-1">{report.title}</h3>
                      <div className="flex items-center">
                        {report.priority === 'urgent' && (
                          <Badge variant="destructive" className="ml-2 text-xs">URGENT</Badge>
                        )}
                        {report.priority === 'high' && (
                          <Badge variant="destructive" className="ml-2 text-xs">High Priority</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-1">{report.location}</p>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                        <span className="text-xs text-muted-foreground">{report.timeAgo}</span>
                      </div>
                      
                      <div className="flex items-center">
                        {report.status === 'assigned' && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Assigned
                          </Badge>
                        )}
                        
                        {report.status === 'in-progress' && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="h-3 w-3" />
                            In Progress
                          </Badge>
                        )}
                        
                        {report.status === 'paused' && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                            <Pause className="h-3 w-3" />
                            Paused
                          </Badge>
                        )}
                        
                        {(report.status === 'completed' || report.status === 'resolved') && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page <= 1 || loading}
          >
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page >= pagination.pages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
