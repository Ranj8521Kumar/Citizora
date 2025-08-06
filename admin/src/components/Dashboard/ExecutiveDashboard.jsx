import React from 'react';
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
  MapPin
} from 'lucide-react';

const kpiData = [
  {
    title: 'Active Reports',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Resolved This Week',
    value: '856',
    change: '+8%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    title: 'Active Users',
    value: '12,450',
    change: '+5%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Pending Reviews',
    value: '127',
    change: '-3%',
    trend: 'down',
    icon: Clock,
    color: 'text-orange-600'
  }
];

const priorityIssues = [
  {
    id: 1,
    title: 'Water Main Break - Downtown',
    location: 'Main St & 5th Ave',
    priority: 'Critical',
    time: '15 min ago',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Street Light Outage',
    location: 'Oak Boulevard',
    priority: 'High',
    time: '1 hour ago',
    status: 'Assigned'
  },
  {
    id: 3,
    title: 'Pothole Repair Request',
    location: 'Elm Street',
    priority: 'Medium',
    time: '3 hours ago',
    status: 'Pending'
  }
];

const departmentPerformance = [
  { name: 'Public Works', completion: 87, total: 145, resolved: 126 },
  { name: 'Parks & Recreation', completion: 92, total: 78, resolved: 72 },
  { name: 'Transportation', completion: 76, total: 234, resolved: 178 },
  { name: 'Utilities', completion: 94, total: 89, resolved: 84 }
];

const recentActivities = [
  { action: 'New report submitted', user: 'John Citizen', time: '2 minutes ago', type: 'report' },
  { action: 'Issue marked as resolved', user: 'Sarah Williams (Public Works)', time: '5 minutes ago', type: 'resolution' },
  { action: 'Field worker assigned', user: 'Mike Johnson', time: '12 minutes ago', type: 'assignment' },
  { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'system' }
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
      return 'bg-blue-500';
    case 'resolution':
      return 'bg-green-500';
    case 'assignment':
      return 'bg-purple-500';
    case 'system':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const ExecutiveDashboard = () => {
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
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    +2% vs last month
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