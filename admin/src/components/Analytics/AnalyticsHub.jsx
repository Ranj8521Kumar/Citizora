import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Filter, TrendingUp } from 'lucide-react';

const monthlyReports = [
  { month: 'Jan', reports: 1200, resolved: 980, pending: 220 },
  { month: 'Feb', reports: 1350, resolved: 1100, pending: 250 },
  { month: 'Mar', reports: 1180, resolved: 950, pending: 230 },
  { month: 'Apr', reports: 1420, resolved: 1180, pending: 240 },
  { month: 'May', reports: 1380, resolved: 1150, pending: 230 },
  { month: 'Jun', reports: 1250, resolved: 1020, pending: 230 }
];

const categoryData = [
  { name: 'Infrastructure', value: 35, color: '#1E3A8A' },
  { name: 'Public Safety', value: 25, color: '#7C3AED' },
  { name: 'Environment', value: 20, color: '#0D9488' },
  { name: 'Transportation', value: 12, color: '#DC2626' },
  { name: 'Other', value: 8, color: '#6B7280' }
];

const responseTimeData = [
  { department: 'Public Works', avgTime: 2.3, target: 4.0 },
  { department: 'Parks & Rec', avgTime: 1.8, target: 3.0 },
  { department: 'Transportation', avgTime: 3.2, target: 4.5 },
  { department: 'Utilities', avgTime: 1.5, target: 2.0 },
  { department: 'Environmental', avgTime: 4.1, target: 5.0 }
];

const geographicData = [
  { district: 'Downtown', reports: 340, population: 15000 },
  { district: 'North Side', reports: 280, population: 22000 },
  { district: 'South End', reports: 220, population: 18000 },
  { district: 'West Hills', reports: 180, population: 12000 },
  { district: 'East Valley', reports: 160, population: 14000 }
];

const chartTooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px'
};

export const AnalyticsHub = () => {
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600">Performance insights and trends across all departments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="last-30-days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="predictive">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Report Trends</CardTitle>
                <CardDescription>Report submissions and resolution trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyReports}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area 
                        type="monotone" 
                        dataKey="reports" 
                        stackId="1" 
                        stroke="#1E3A8A" 
                        fill="#1E3A8A" 
                        fillOpacity={0.6}
                        name="Total Reports"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="resolved" 
                        stackId="2" 
                        stroke="#0D9488" 
                        fill="#0D9488" 
                        fillOpacity={0.6}
                        name="Resolved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
                <CardDescription>Distribution of reports by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-900">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl text-blue-600 mb-1">2.4 hrs</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                    <Badge variant="secondary" className="mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      12% faster
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl text-green-600 mb-1">87%</div>
                    <div className="text-sm text-gray-600">Resolution Rate</div>
                    <Badge variant="secondary" className="mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +3% this month
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm text-gray-700 mb-3">Recent Achievements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Fastest resolution time this quarter
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      95% citizen satisfaction rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Times by Department */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Response Times by Department</CardTitle>
                <CardDescription>Average response times compared to targets (in hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseTimeData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis type="category" dataKey="department" stroke="#64748b" width={100} />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value} hours`,
                          name === 'avgTime' ? 'Average Time' : 'Target Time'
                        ]}
                        contentStyle={chartTooltipStyle}
                      />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target Time" />
                      <Bar dataKey="avgTime" fill="#1E3A8A" name="Average Time" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Report density by district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="district" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'reports' ? `${value} reports` : `${value} residents`,
                        name === 'reports' ? 'Total Reports' : 'Population'
                      ]}
                      contentStyle={chartTooltipStyle}
                    />
                    <Bar dataKey="reports" fill="#7C3AED" name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Predictive Insights
                </CardTitle>
                <CardDescription>AI-powered forecasting and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-purple-900 mb-2">Peak Season Forecast</h4>
                  <p className="text-sm text-purple-700">
                    Expected 25% increase in infrastructure reports during spring months. 
                    Consider staffing adjustments.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-blue-900 mb-2">Resource Optimization</h4>
                  <p className="text-sm text-blue-700">
                    Downtown district shows clustering of evening reports. 
                    Recommend extending evening shift coverage.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-green-900 mb-2">Efficiency Opportunity</h4>
                  <p className="text-sm text-green-700">
                    Automated routing could reduce response times by 15% 
                    in high-density areas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Seasonal patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Winter Infrastructure Issues', increase: '45%', type: 'Seasonal' },
                    { title: 'Summer Parks Maintenance', increase: '30%', type: 'Recurring' },
                    { title: 'Holiday Period Slowdown', increase: '20%', type: 'Calendar' }
                  ].map((trend, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="text-gray-900">{trend.title}</h4>
                        <p className="text-sm text-gray-600">Expected increase: {trend.increase}</p>
                      </div>
                      <Badge variant="outline">{trend.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};