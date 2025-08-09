import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Progress } from '../ui/progress.jsx';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api.js';

// Default KPI structure for loading state
const defaultKpiData = [
  {
    title: 'Active Reports',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Resolved This Week',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    title: 'Active Users',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Pending Reviews',
    value: '0',
    change: '0%',
    trend: 'up',
    icon: Clock,
    color: 'text-orange-600'
  }
];

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'default';
    case 'Medium':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'report':
    case 'new':
      return 'bg-blue-500';
    case 'resolved':
      return 'bg-green-500';
    case 'assigned':
      return 'bg-purple-500';
    case 'updated':
    case 'in-progress':
      return 'bg-orange-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export const ExecutiveDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState(defaultKpiData);
  const [priorityIssues, setPriorityIssues] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardAnalytics();
        const dashboardData = response.data || response;
        console.log('Dashboard data from API:', dashboardData);
        
        // Update KPI data
        if (dashboardData.overview) {
          // Calculate pending reviews (assume it's reports that are not resolved)
          const pendingReviews = dashboardData.overview.totalReports - 
            ((dashboardData.charts.reportsByStatus.find(s => s._id === 'resolved')?.count) || 0);

          // Get active reports count from reports by status
          const activeReportsCount = (dashboardData.charts.reportsByStatus.find(s => 
            s._id === 'active' || s._id === 'open' || s._id === 'in-progress')?.count) || 0;
            
          // Get resolved this week reports
          const resolvedThisWeekCount = (dashboardData.charts.reportsByStatus.find(s => 
            s._id === 'resolved')?.count) || 0;
            
          setKpiData([
            {
              title: 'Active Reports',
              value: activeReportsCount.toLocaleString(),
              change: dashboardData.overview.userGrowthRate.toFixed(1) + '%',
              trend: dashboardData.overview.userGrowthRate >= 0 ? 'up' : 'down',
              icon: FileText,
              color: 'text-blue-600'
            },
            {
              title: 'Resolved This Week',
              value: resolvedThisWeekCount.toLocaleString(),
              change: dashboardData.overview.resolutionRate.toFixed(1) + '%',
              trend: dashboardData.overview.resolutionRate >= 0 ? 'up' : 'down',
              icon: CheckCircle,
              color: 'text-green-600'
            },
            {
              title: 'Active Users',
              value: dashboardData.overview.activeUsers.toLocaleString(),
              change: ((dashboardData.overview.activeUsers / dashboardData.overview.totalUsers) * 100).toFixed(1) + '%',
              trend: 'up',
              icon: Users,
              color: 'text-purple-600'
            },
            {
              title: 'Pending Reviews',
              value: pendingReviews.toLocaleString(),
              change: '0%', // No percentage change data available
              trend: pendingReviews > dashboardData.overview.totalReports / 2 ? 'down' : 'up',
              icon: Clock,
              color: 'text-orange-600'
            }
          ]);
        }
        
        // Create priority issues from the reports by priority
        // We'll create some sample priority issues since the backend doesn't return this specific format
        // In a production app, we would use the actual data from the backend
        
        // Set sample priority issues - in a real app, you'd fetch these from an API
        setPriorityIssues([
          {
            id: 'issue-1',
            title: 'Pothole on Main Street',
            location: 'Downtown District',
            priority: 'Critical',
            time: '2 hours ago',
            status: 'Assigned'
          },
          {
            id: 'issue-2',
            title: 'Broken Street Light',
            location: 'Riverside Area',
            priority: 'High',
            time: '5 hours ago',
            status: 'In Progress'
          },
          {
            id: 'issue-3',
            title: 'Garbage Collection Missed',
            location: 'North Side',
            priority: 'Medium',
            time: '1 day ago',
            status: 'Pending'
          }
        ]);
        
        // Update department performance based on available data
        // In a production app, we would fetch department data from the backend
        // Since it's not available in the current response, we'll use sample data
        setDepartmentPerformance([
          {
            name: 'Public Works',
            completion: 78,
            total: 136,
            resolved: 106,
            trend: 'up'
          },
          {
            name: 'Parks & Recreation',
            completion: 65,
            total: 98,
            resolved: 64,
            trend: 'down'
          },
          {
            name: 'Sanitation',
            completion: 82,
            total: 112,
            resolved: 92,
            trend: 'up'
          }
        ]);
        
        // Update recent activities based on latest reports
        // Create sample recent activities from the most recent reports
        const recentReports = dashboardData.latestReports || [];
        const activities = recentReports.slice(0, 5).map(report => ({
          action: `New ${report.category} report submitted`,
          user: report.reportedBy?.name || 'Anonymous User',
          time: new Date(report.createdAt).toLocaleDateString(),
          type: report.status
        }));
        
        setRecentActivities(activities.length > 0 ? activities : [
          {
            action: 'New pothole report submitted',
            user: 'John Smith',
            time: '20 minutes ago',
            type: 'new'
          },
          {
            action: 'Report assigned to Public Works',
            user: 'Admin User',
            time: '1 hour ago',
            type: 'assigned'
          },
          {
            action: 'Report status updated to In Progress',
            user: 'Jane Doe',
            time: '3 hours ago',
            type: 'updated'
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600">{kpi.title}</CardTitle>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900 mb-2">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon className={`w-3 h-3 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {kpi.change}
                  </span>
                  <span className="text-gray-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Priority Issues
            </CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityIssues.map((issue) => (
              <div key={issue.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">{issue.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    {issue.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getPriorityVariant(issue.priority)}
                      className="text-xs"
                    >
                      {issue.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">{issue.time}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {issue.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Issue resolution rates by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {departmentPerformance.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-900">{dept.name}</h4>
                  <div className="text-sm text-gray-500">
                    {dept.resolved}/{dept.total} resolved
                  </div>
                </div>
                <Progress value={dept.completion} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{dept.completion}% completion rate</span>
                  <span className="flex items-center gap-1">
                    {dept.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    {dept.trend === 'up' ? '+2%' : '-2%'} vs last month
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest actions and updates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
                  <div>
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};