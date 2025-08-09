import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Badge } from '../ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MapPin,
  Download,
  Trash2,
  UserCheck,
  Loader2,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import apiService from '../../services/api.js';

// Default priority badge variants
const getPriorityVariant = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

// Default status badge variants
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return 'success';
    case 'in_progress':
      return 'default';
    case 'assigned':
      return 'secondary';
    case 'submitted':
      return 'warning';
    case 'in_review':
      return 'warning';
    case 'closed':
      return 'outline';
    default:
      return 'outline';
  }
};

// Format status for display
const formatStatusForDisplay = (status) => {
  if (!status) return '';
  
  // Replace underscores with spaces and capitalize each word
  return status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ReportManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [activeTab, setActiveTab] = useState('all-reports');
  
  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        console.log('Fetching reports with filters:', {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          sort: sortField,
          order: sortDirection,
          query: searchTerm || undefined
        });
        
        const response = await apiService.advancedReportSearch({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          sort: sortField,
          order: sortDirection,
          query: searchTerm || undefined
        });
        
        // Debug log to check the response structure
        console.log('API Response:', response);
        
        // Check for reports in the correct response structure
        let reportData;
        if (response.data?.reports) {
          // Server returns data in response.data.reports
          reportData = response.data.reports;
          console.log('Found reports in response.data.reports', reportData.length);
        } else if (response.reports) {
          // Direct reports array
          reportData = response.reports;
          console.log('Found reports in response.reports', reportData.length);
        } else if (Array.isArray(response)) {
          // Direct array response
          reportData = response;
          console.log('Found reports in direct array', reportData.length);
        } else {
          reportData = [];
          console.log('No reports found in response');
        }
        
        console.log('Report Data:', reportData);
        console.log('Reports Count:', reportData.length);
        
        // Add a fake report if we got no reports to test rendering
        if (reportData.length === 0) {
          reportData.push({
            _id: 'test-id-1',
            title: 'Test Report - Debugging',
            description: 'This is a test report to debug rendering',
            status: 'pending',
            priority: 'high',
            createdAt: new Date().toISOString(),
            location: {
              address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345'
              }
            }
          });
        }
        
        setReports(reportData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load report data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);
  
  // Fetch field workers for assignment
  useEffect(() => {
    const fetchFieldWorkers = async () => {
      try {
        const response = await apiService.getAllUsers();
        const workers = response.users.filter(user => user.role === 'Field Worker' && user.active);
        setFieldWorkers(workers);
      } catch (err) {
        console.error('Error fetching field workers:', err);
      }
    };
    
    fetchFieldWorkers();
  }, []);

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report._id));
    }
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };
  
  // Action controls component for reuse across tabs
  const ActionControls = () => {
    if (selectedReports.length === 0) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
        <span className="text-sm text-blue-700">
          {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Select 
            onValueChange={(value) => handleBulkStatusUpdate(value)}
            disabled={actionInProgress}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Mark as Submitted</SelectItem>
              <SelectItem value="in_review">Mark as In Review</SelectItem>
              <SelectItem value="assigned">Mark as Assigned</SelectItem>
              <SelectItem value="in_progress">Mark as In Progress</SelectItem>
              <SelectItem value="resolved">Mark as Resolved</SelectItem>
              <SelectItem value="closed">Mark as Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={(value) => handleBulkAssign(value)}
            disabled={actionInProgress || fieldWorkers.length === 0}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              {fieldWorkers.map(worker => (
                <SelectItem key={worker._id} value={worker._id}>
                  {worker.firstName} {worker.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            disabled={actionInProgress}
            onClick={() => handleBulkDelete()}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    );
  };
  
  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedReports.length === 0) return;
    
    try {
      setActionInProgress(true);
      await apiService.bulkUpdateReportStatus(selectedReports, newStatus);
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          selectedReports.includes(report._id) 
            ? {...report, status: newStatus} 
            : report
        )
      );
      
      setSelectedReports([]);
      setActionInProgress(false);
    } catch (err) {
      console.error('Error updating report statuses:', err);
      setError('Failed to update report statuses. Please try again.');
      setActionInProgress(false);
    }
  };
  
  // Handle bulk assignment
  const handleBulkAssign = async (workerId) => {
    if (selectedReports.length === 0) return;
    
    try {
      setActionInProgress(true);
      await apiService.bulkAssignReports(selectedReports, workerId);
      
      // Update local state
      const worker = fieldWorkers.find(w => w._id === workerId);
      
      setReports(prevReports => 
        prevReports.map(report => 
          selectedReports.includes(report._id) 
            ? {
                ...report, 
                assignedTo: { _id: workerId, firstName: worker?.firstName, lastName: worker?.lastName },
                status: report.status === 'submitted' ? 'assigned' : report.status
              } 
            : report
        )
      );
      
      setSelectedReports([]);
      setActionInProgress(false);
    } catch (err) {
      console.error('Error assigning reports:', err);
      setError('Failed to assign reports. Please try again.');
      setActionInProgress(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedReports.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) return;
    
    try {
      setActionInProgress(true);
      await apiService.bulkDeleteReports(selectedReports);
      
      // Update local state
      setReports(prevReports => 
        prevReports.filter(report => !selectedReports.includes(report._id))
      );
      
      setSelectedReports([]);
      setActionInProgress(false);
    } catch (err) {
      console.error('Error deleting reports:', err);
      setError('Failed to delete reports. Please try again.');
      setActionInProgress(false);
    }
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Refresh reports
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setSelectedReports([]);
    
    apiService.advancedReportSearch({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      sort: sortField,
      order: sortDirection,
      query: searchTerm || undefined
    })
      .then(response => {
        // Check for reports in the correct response structure
        const reportData = response.data?.reports || response.reports || [];
        setReports(reportData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error refreshing reports:', err);
        setError('Failed to refresh report data. Please try again.');
        setLoading(false);
      });
  };
  
  // Filter reports based on search, filters, and active tab
  const filteredReports = useMemo(() => {
    if (!reports || reports.length === 0) {
      return [];
    }
    
    console.log('Filtering reports:', reports);
    
    return reports.filter(report => {
      // Filter by tab/status first
      if (activeTab !== 'all-reports' && report.status !== activeTab) {
        return false;
      }
      
      // Handle potentially missing properties or different structures
      const title = report?.title || '';
      const description = report?.description || '';
      
      // For location, need to handle the nested structure from the Report model
      let locationText = '';
      if (report?.location?.address) {
        const address = report.location.address;
        locationText = [address.street, address.city, address.state, address.zipCode]
          .filter(Boolean)
          .join(' ');
      }
      
      // Convert status and priority to lowercase if they exist
      const reportStatus = (report?.status || '').toLowerCase();
      const reportPriority = (report?.priority || '').toLowerCase();
      
      const searchTermLower = searchTerm.toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        title.toLowerCase().includes(searchTermLower) ||
        description.toLowerCase().includes(searchTermLower) ||
        locationText.toLowerCase().includes(searchTermLower);
      
      const matchesStatus = statusFilter === 'all' || 
        reportStatus === statusFilter.toLowerCase();
      
      const matchesPriority = priorityFilter === 'all' || 
        reportPriority === priorityFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [reports, searchTerm, statusFilter, priorityFilter, activeTab]);

  // Debug logs
  console.log('Filtered Reports:', filteredReports);
  console.log('Selected Reports:', selectedReports);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="all-reports">All Reports</TabsTrigger>
          <TabsTrigger value="submitted">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Report Management</CardTitle>
                  <CardDescription>Manage citizen reports and assignments</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={handleRefresh}
                    disabled={loading || actionInProgress}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search reports by title, description or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              <ActionControls />

              {/* Reports Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all reports"
                          disabled={actionInProgress}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        <div className="flex items-center">
                          Report
                          {sortField === 'title' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center">
                          Submitted
                          {sortField === 'createdAt' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No reports found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedReports.includes(report._id)}
                              onCheckedChange={() => handleSelectReport(report._id)}
                              aria-label={`Select report ${report.title}`}
                              disabled={actionInProgress}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-gray-900 font-medium">{report.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{report.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(report.status)}>
                              {formatStatusForDisplay(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(report.priority)}>
                              {report.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 truncate max-w-[120px]">
                                {report.location?.address ? 
                                  [report.location.address.street, report.location.address.city]
                                    .filter(Boolean)
                                    .join(', ') 
                                  : 'No location data'
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {report.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <span className="text-sm">
                                  {report.assignedTo.firstName || ''} {report.assignedTo.lastName || ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" aria-label={`More options for ${report.title}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status-specific tab contents - all use the same table layout */}
        <TabsContent value="submitted">
          <Card>
            <CardContent className="p-4">
              <ActionControls />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredReports.length > 0 && selectedReports.length === filteredReports.length} 
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(filteredReports.map(r => r._id));
                            } else {
                              setSelectedReports([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        Report 
                        {sortField === 'title' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Submitted 
                        {sortField === 'createdAt' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-gray-500">No pending reports found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id} className={selectedReports.includes(report._id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedReports.includes(report._id)} 
                              onCheckedChange={() => handleSelectReport(report._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(report.status)}>
                              {formatStatusForDisplay(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {report.location?.address?.city}, {report.location?.address?.street}
                          </TableCell>
                          <TableCell>
                            {report.assignedTo ? `${report.assignedTo.firstName || ''} ${report.assignedTo.lastName || ''}`.trim() : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assigned">
          <Card>
            <CardContent className="p-4">
              <ActionControls />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredReports.length > 0 && selectedReports.length === filteredReports.length} 
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(filteredReports.map(r => r._id));
                            } else {
                              setSelectedReports([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        Report 
                        {sortField === 'title' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Submitted 
                        {sortField === 'createdAt' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-gray-500">No assigned reports found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id} className={selectedReports.includes(report._id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedReports.includes(report._id)} 
                              onCheckedChange={() => handleSelectReport(report._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(report.status)}>
                              {formatStatusForDisplay(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {report.location?.address?.city}, {report.location?.address?.street}
                          </TableCell>
                          <TableCell>
                            {report.assignedTo ? `${report.assignedTo.firstName || ''} ${report.assignedTo.lastName || ''}`.trim() : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in_progress">
          <Card>
            <CardContent className="p-4">
              <ActionControls />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredReports.length > 0 && selectedReports.length === filteredReports.length} 
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(filteredReports.map(r => r._id));
                            } else {
                              setSelectedReports([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        Report 
                        {sortField === 'title' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Submitted 
                        {sortField === 'createdAt' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-gray-500">No in-progress reports found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id} className={selectedReports.includes(report._id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedReports.includes(report._id)} 
                              onCheckedChange={() => handleSelectReport(report._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(report.status)}>
                              {formatStatusForDisplay(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {report.location?.address?.city}, {report.location?.address?.street}
                          </TableCell>
                          <TableCell>
                            {report.assignedTo ? `${report.assignedTo.firstName || ''} ${report.assignedTo.lastName || ''}`.trim() : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resolved">
          <Card>
            <CardContent className="p-4">
              <ActionControls />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredReports.length > 0 && selectedReports.length === filteredReports.length} 
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports(filteredReports.map(r => r._id));
                            } else {
                              setSelectedReports([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        Report 
                        {sortField === 'title' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Submitted 
                        {sortField === 'createdAt' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-gray-500">No resolved reports found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id} className={selectedReports.includes(report._id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedReports.includes(report._id)} 
                              onCheckedChange={() => handleSelectReport(report._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(report.status)}>
                              {formatStatusForDisplay(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {report.location?.address?.city}, {report.location?.address?.street}
                          </TableCell>
                          <TableCell>
                            {report.assignedTo ? `${report.assignedTo.firstName || ''} ${report.assignedTo.lastName || ''}`.trim() : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};