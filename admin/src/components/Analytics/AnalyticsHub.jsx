import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Filter, TrendingUp, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '../../services/api.js';

// Default colors for charts
const categoryColors = {
  'Infrastructure': '#1E3A8A',
  'Public Safety': '#7C3AED',
  'Environment': '#0D9488',
  'Transportation': '#DC2626',
  'Other': '#6B7280',
  'Utilities': '#0369A1',
  'Parks': '#15803D',
  'Sanitation': '#B45309',
  'Community': '#4F46E5'
};

const chartTooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px'
};

export const AnalyticsHub = () => {
  const [timeframe, setTimeframe] = useState('last-30-days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for different data sets
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [geographicData, setGeographicData] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    responseTimeChange: 0,
    resolutionRate: 0,
    resolutionRateChange: 0,
    achievements: []
  });
  
  // Convert timeframe selection to API parameter
  const getTimeframeParam = (selection) => {
    switch(selection) {
      case 'last-7-days': return '7d';
      case 'last-30-days': return '30d';
      case 'last-90-days': return '90d';
      case 'last-year': return '365d';
      default: return '30d';
    }
  };
  
      // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const timeParam = getTimeframeParam(timeframe);
      
      // Fetch main analytics data
      const analyticsData = await apiService.getAnalyticsData(timeParam);
      
      // Process reports over time data for monthly trends
      if (analyticsData.data?.charts?.reportsOverTime && 
          Array.isArray(analyticsData.data.charts.reportsOverTime) && 
          analyticsData.data.charts.reportsOverTime.length > 0) {
        try {
          // Ensure we have at least 2 data points for the Area chart
          // The Area component in recharts needs at least 2 points to render properly
          let monthlyData = analyticsData.data.charts.reportsOverTime.map(item => {
            // Ensure item and _id exist
            if (!item || !item._id) {
              return {
                month: 'Unknown',
                reports: 0,
                resolved: 0
              };
            }
            
            return {
              month: `${item._id.month || 'Unknown'}/${item._id.year || 'Unknown'}`,
              reports: parseInt(item.count) || 0,
              resolved: Math.round((parseInt(item.count) || 0) * ((parseFloat(analyticsData.data.overview?.resolutionRate) || 0) / 100)) || 0
            };
          }).filter(item => item.month !== 'Unknown/Unknown'); // Filter out invalid entries
          
          // If we have only one data point, duplicate it with a slight difference to ensure the chart renders
          if (monthlyData.length === 1) {
            const dataPoint = {...monthlyData[0]};
            dataPoint.month = `${dataPoint.month} (cont.)`;
            monthlyData.push(dataPoint);
          }
          
          // If no valid data points, set empty array
          if (monthlyData.length === 0) {
            monthlyData = [];
          }
          
          setMonthlyReports(monthlyData);
        } catch (err) {
          console.error('Error processing monthly reports data:', err);
          setMonthlyReports([]);
        }
      } else {
        // Provide default empty data structure to prevent rendering errors
        setMonthlyReports([]);
      }      // Set performance metrics
      setPerformanceMetrics({
        responseTime: analyticsData.data?.overview?.averageResolutionHours || 0,
        responseTimeChange: 0, // Not provided in current API, using placeholder
        resolutionRate: analyticsData.data?.overview?.resolutionRate || 0,
        resolutionRateChange: 0, // Not provided in current API, using placeholder
        achievements: [
          `${analyticsData.data?.overview?.totalReports || 0} total reports processed`,
          `${analyticsData.data?.overview?.activeUsers || 0} active users this period`
        ]
      });
      
      // Fetch category breakdown
      const categoryResponse = await apiService.getCategoryBreakdown();
      if (categoryResponse.categories) {
        // Map categories to include colors
        const mappedCategories = categoryResponse.categories.map(cat => ({
          name: cat.name,
          value: parseFloat(cat.percentage),
          color: categoryColors[cat.name] || '#6B7280' // Default color if not found
        }));
        setCategoryData(mappedCategories);
      }
      
      // Fetch response times by department
      const responseTimeResponse = await apiService.getResponseTimesByDepartment();
      if (responseTimeResponse.departments) {
        setResponseTimeData(responseTimeResponse.departments);
      }
      
      // Fetch geographic distribution
      const geoResponse = await apiService.getGeographicDistribution();
      if (geoResponse.districts) {
        setGeographicData(geoResponse.districts);
      }
      
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);
  
  // Handle timeframe change
  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchAnalyticsData();
  };
  
  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }
  
  // If error, show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600">Performance insights and trends across all departments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
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
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
                  {monthlyReports && Array.isArray(monthlyReports) && monthlyReports.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyReports}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Area 
                          type="monotone" 
                          dataKey="reports" 
                          stroke="#1E3A8A" 
                          fill="#1E3A8A" 
                          fillOpacity={0.6}
                          name="Total Reports"
                          isAnimationActive={false} // Disable animation to prevent undefined property errors
                        />
                        <Area 
                          type="monotone" 
                          dataKey="resolved" 
                          stroke="#0D9488" 
                          fill="#0D9488" 
                          fillOpacity={0.6}
                          name="Resolved"
                          isAnimationActive={false} // Disable animation to prevent undefined property errors
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500">No data available for the selected timeframe</p>
                    </div>
                  )}
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
                  {categoryData && Array.isArray(categoryData) && categoryData.length > 0 ? (
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
                            <Cell key={`cell-${index}`} fill={entry.color || '#6B7280'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500">No category data available</p>
                    </div>
                  )}
                </div>
                {categoryData && categoryData.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {categoryData.map((category) => (
                      <div key={category.name || 'unknown'} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          />
                          <span className="text-sm text-gray-700">{category.name || 'Unknown'}</span>
                        </div>
                        <span className="text-sm text-gray-900">{category.value || 0}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl text-blue-600 mb-1">
                          {(performanceMetrics.responseTime || 0).toFixed(1)} hrs
                        </div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                        <Badge variant="secondary" className="mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {(performanceMetrics.responseTimeChange || 0) > 0 ? 
                            `${performanceMetrics.responseTimeChange || 0}% slower` : 
                            `${Math.abs(performanceMetrics.responseTimeChange || 0)}% faster`}
                        </Badge>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl text-green-600 mb-1">
                          {(performanceMetrics.resolutionRate || 0)}%
                        </div>
                        <div className="text-sm text-gray-600">Resolution Rate</div>
                        <Badge variant="secondary" className="mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {(performanceMetrics.resolutionRateChange || 0) > 0 ? 
                            `+${performanceMetrics.resolutionRateChange || 0}% this period` : 
                            `${performanceMetrics.resolutionRateChange || 0}% this period`}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm text-gray-700 mb-3">Recent Achievements</h4>
                      <div className="space-y-2 text-sm">
                        {performanceMetrics.achievements && Array.isArray(performanceMetrics.achievements) && performanceMetrics.achievements.length > 0 ? (
                          performanceMetrics.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2 text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {achievement}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No recent achievements to display</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-500">No performance metrics available</p>
                  </div>
                )}
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
                  {responseTimeData && responseTimeData.length > 0 ? (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500">No response time data available</p>
                    </div>
                  )}
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
                {geographicData && geographicData.length > 0 ? (
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500">No geographic data available</p>
                  </div>
                )}
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