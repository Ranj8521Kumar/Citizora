import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Badge } from '../ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Progress } from '../ui/progress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import apiService from '../../services/api.js';

// Helper function to determine workload color
const getWorkloadColor = (workload) => {
  if (workload >= 90) return 'bg-red-500';
  if (workload >= 70) return 'bg-orange-500';
  if (workload >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Helper function to determine performance badge variant
const getPerformanceVariant = (performance) => {
  if (performance >= 90) return 'success';
  if (performance >= 70) return 'default';
  if (performance >= 50) return 'secondary';
  return 'outline';
};

export const EmployeeAssignment = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeReports, setEmployeeReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllUsers();
        
        // Filter for field workers only
        const fieldWorkers = response.users.filter(user => 
          user.role === 'Field Worker'
        ).map(worker => ({
          ...worker,
          name: `${worker.firstName} ${worker.lastName}`,
          workload: Math.floor(Math.random() * 100), // This would come from the API in a real implementation
          performance: Math.floor(Math.random() * 100), // This would come from the API in a real implementation
          reportsAssigned: Math.floor(Math.random() * 20), // This would come from the API in a real implementation
          reportsCompleted: Math.floor(Math.random() * 15) // This would come from the API in a real implementation
        }));
        
        setEmployees(fieldWorkers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Fetch employee reports when an employee is selected
  useEffect(() => {
    if (!selectedEmployee) {
      setEmployeeReports([]);
      return;
    }
    
    const fetchEmployeeReports = async () => {
      try {
        setLoadingReports(true);
        const response = await apiService.searchReports({
          assignedTo: selectedEmployee.id
        });
        
        setEmployeeReports(response.reports || []);
        setLoadingReports(false);
      } catch (err) {
        console.error('Error fetching employee reports:', err);
        setLoadingReports(false);
      }
    };
    
    fetchEmployeeReports();
  }, [selectedEmployee]);
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Refresh employees
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    apiService.getAllUsers()
      .then(response => {
        // Filter for field workers only
        const fieldWorkers = response.users.filter(user => 
          user.role === 'Field Worker'
        ).map(worker => ({
          ...worker,
          name: `${worker.firstName} ${worker.lastName}`,
          workload: Math.floor(Math.random() * 100),
          performance: Math.floor(Math.random() * 100),
          reportsAssigned: Math.floor(Math.random() * 20),
          reportsCompleted: Math.floor(Math.random() * 15)
        }));
        
        setEmployees(fieldWorkers);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error refreshing employees:', err);
        setError('Failed to refresh employee data. Please try again.');
        setLoading(false);
      });
  };
  
  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && employee.active) ||
      (statusFilter === 'inactive' && !employee.active);
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading employee data...</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Field Workers</CardTitle>
                  <CardDescription>Manage workload and assignments</CardDescription>
                </div>
                
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employees List */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center">
                          Name
                          {sortField === 'name' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('workload')}>
                        <div className="flex items-center">
                          Workload
                          {sortField === 'workload' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                          No employees found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedEmployees.map((employee) => (
                        <TableRow 
                          key={employee.id} 
                          className={`cursor-pointer ${selectedEmployee?.id === employee.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium">{employee.name}</p>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{employee.workload}%</span>
                              </div>
                              <Progress 
                                value={employee.workload} 
                                className={getWorkloadColor(employee.workload)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Employee Details */}
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                      {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle>{selectedEmployee.name}</CardTitle>
                      <CardDescription>Field Worker</CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={selectedEmployee.active ? 'success' : 'outline'}>
                    {selectedEmployee.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedEmployee.phone || 'No phone number'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedEmployee.location || 'No location set'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span>Joined {new Date(selectedEmployee.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Last active {new Date(selectedEmployee.lastActive || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span>
                        Performance: 
                        <Badge variant={getPerformanceVariant(selectedEmployee.performance)} className="ml-2">
                          {selectedEmployee.performance}%
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Workload Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-500">Workload</div>
                      <div className="mt-1 space-y-1">
                        <div className="text-2xl font-bold">{selectedEmployee.workload}%</div>
                        <Progress 
                          value={selectedEmployee.workload} 
                          className={getWorkloadColor(selectedEmployee.workload)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-500">Reports Assigned</div>
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{selectedEmployee.reportsAssigned}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-500">Reports Completed</div>
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{selectedEmployee.reportsCompleted}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Assigned Reports */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Assigned Reports</h3>
                  
                  {loadingReports ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : employeeReports.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <p className="text-gray-500">No reports assigned to this employee</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employeeReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <div>
                                  <p className="text-gray-900 font-medium">{report.title}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">{report.description}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {report.status === 'Resolved' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : report.status === 'In Progress' ? (
                                    <Clock className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  )}
                                  <span>{report.status}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={report.priority === 'High' ? 'destructive' : 'outline'}>
                                  {report.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 truncate max-w-[120px]">{report.location}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Selected</h3>
                <p className="text-gray-500 max-w-md">
                  Select an employee from the list to view their details, workload, and assigned reports.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};