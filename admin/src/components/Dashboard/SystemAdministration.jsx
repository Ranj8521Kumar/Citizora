import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Switch } from '../ui/switch.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Separator } from '../ui/separator.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { 
  AlertCircle, 
  Loader2, 
  Save, 
  RefreshCw, 
  Shield, 
  Settings, 
  Bell, 
  Mail,
  Database,
  Server,
  Globe,
  Key,
  Lock,
  CheckCircle
} from 'lucide-react';
//import { apiService } from '../../services/api.js';

export const SystemAdministration = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    general: {
      siteName: 'CivicConnect',
      siteDescription: 'Community Issue Reporting Platform',
      contactEmail: 'admin@civicconnect.com',
      maxUploadSize: 10,
      allowRegistration: true,
      requireEmailVerification: true,
      maintenanceMode: false
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: false,
      adminAlertEmails: 'admin@civicconnect.com',
      notifyOnNewReport: true,
      notifyOnReportStatus: true,
      notifyOnUserRegistration: true,
      dailyDigest: true,
      weeklyReport: true
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      twoFactorAuth: false,
      ipBlacklist: '',
      autobanEnabled: true
    },
    api: {
      enablePublicApi: true,
      rateLimitPerMinute: 60,
      requireApiKey: true,
      logApiRequests: true,
      corsAllowedOrigins: 'localhost,civicconnect.com'
    }
  });
  
  // Fetch system settings
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from the API
        // const response = await apiService.getSystemSettings();
        // setSystemSettings(response.settings);
        
        // For now, we'll use the default values defined above
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching system settings:', err);
        setError('Failed to load system settings. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSystemSettings();
  }, []);
  
  // Handle input change for general settings
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  // Handle input change for notification settings
  const handleNotificationsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  // Handle input change for security settings
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseInt(value, 10) : value
      }
    }));
  };
  
  // Handle input change for API settings
  const handleApiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseInt(value, 10) : value
      }
    }));
  };
  
  // Handle switch toggle
  const handleSwitchChange = (checked, section, name) => {
    setSystemSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: checked
      }
    }));
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // In a real implementation, this would save to the API
      // await apiService.updateSystemSettings(systemSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('System settings saved successfully.');
      setSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving system settings:', err);
      setError('Failed to save system settings. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading system settings...</p>
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
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-green-800 font-medium">Success</h3>
              <p className="text-green-600">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Administration</h2>
          <p className="text-muted-foreground">Manage system settings and configurations.</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Server className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings and functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={systemSettings.general.siteName}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={systemSettings.general.siteDescription}
                      onChange={handleGeneralChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={systemSettings.general.contactEmail}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                    <Input
                      id="maxUploadSize"
                      name="maxUploadSize"
                      type="number"
                      min="1"
                      max="50"
                      value={systemSettings.general.maxUploadSize}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowRegistration">Allow User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable new user registrations on the platform
                      </p>
                    </div>
                    <Switch
                      id="allowRegistration"
                      name="allowRegistration"
                      checked={systemSettings.general.allowRegistration}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'general', 'allowRegistration')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to verify their email before accessing the platform
                      </p>
                    </div>
                    <Switch
                      id="requireEmailVerification"
                      name="requireEmailVerification"
                      checked={systemSettings.general.requireEmailVerification}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'general', 'requireEmailVerification')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode" className="text-red-600 font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the site in maintenance mode (only admins can access)
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={systemSettings.general.maintenanceMode}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'general', 'maintenanceMode')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications to users and administrators
                      </p>
                    </div>
                    <Switch
                      id="enableEmailNotifications"
                      name="enableEmailNotifications"
                      checked={systemSettings.notifications.enableEmailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'enableEmailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="enablePushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send browser push notifications to users
                      </p>
                    </div>
                    <Switch
                      id="enablePushNotifications"
                      name="enablePushNotifications"
                      checked={systemSettings.notifications.enablePushNotifications}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'enablePushNotifications')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminAlertEmails">Admin Alert Emails</Label>
                    <Input
                      id="adminAlertEmails"
                      name="adminAlertEmails"
                      value={systemSettings.notifications.adminAlertEmails}
                      onChange={handleNotificationsChange}
                      placeholder="Comma-separated email addresses"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple email addresses with commas
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnNewReport">New Report Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify administrators when new reports are submitted
                      </p>
                    </div>
                    <Switch
                      id="notifyOnNewReport"
                      name="notifyOnNewReport"
                      checked={systemSettings.notifications.notifyOnNewReport}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'notifyOnNewReport')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnReportStatus">Report Status Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when their report status changes
                      </p>
                    </div>
                    <Switch
                      id="notifyOnReportStatus"
                      name="notifyOnReportStatus"
                      checked={systemSettings.notifications.notifyOnReportStatus}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'notifyOnReportStatus')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnUserRegistration">User Registration Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify administrators when new users register
                      </p>
                    </div>
                    <Switch
                      id="notifyOnUserRegistration"
                      name="notifyOnUserRegistration"
                      checked={systemSettings.notifications.notifyOnUserRegistration}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'notifyOnUserRegistration')}
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scheduled Reports</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="dailyDigest">Daily Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Send daily summary of platform activity to administrators
                      </p>
                    </div>
                    <Switch
                      id="dailyDigest"
                      name="dailyDigest"
                      checked={systemSettings.notifications.dailyDigest}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'dailyDigest')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReport">Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Send weekly analytics and statistics to administrators
                      </p>
                    </div>
                    <Switch
                      id="weeklyReport"
                      name="weeklyReport"
                      checked={systemSettings.notifications.weeklyReport}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'notifications', 'weeklyReport')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      name="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={systemSettings.security.sessionTimeout}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      name="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={systemSettings.security.maxLoginAttempts}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autobanEnabled">Auto-ban Failed Logins</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily ban IP addresses after too many failed login attempts
                      </p>
                    </div>
                    <Switch
                      id="autobanEnabled"
                      name="autobanEnabled"
                      checked={systemSettings.security.autobanEnabled}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'security', 'autobanEnabled')}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      name="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={systemSettings.security.passwordMinLength}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                      <Switch
                        id="requireSpecialChars"
                        name="requireSpecialChars"
                        checked={systemSettings.security.requireSpecialChars}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'security', 'requireSpecialChars')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                      <Switch
                        id="requireNumbers"
                        name="requireNumbers"
                        checked={systemSettings.security.requireNumbers}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'security', 'requireNumbers')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                      <Switch
                        id="requireUppercase"
                        name="requireUppercase"
                        checked={systemSettings.security.requireUppercase}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'security', 'requireUppercase')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all admin accounts
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    checked={systemSettings.security.twoFactorAuth}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'security', 'twoFactorAuth')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ipBlacklist">IP Blacklist</Label>
                  <Textarea
                    id="ipBlacklist"
                    name="ipBlacklist"
                    value={systemSettings.security.ipBlacklist}
                    onChange={handleSecurityChange}
                    placeholder="Enter IP addresses to block, one per line"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter one IP address per line to block access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API access and rate limiting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="enablePublicApi" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Enable Public API
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow external applications to access the API
                      </p>
                    </div>
                    <Switch
                      id="enablePublicApi"
                      name="enablePublicApi"
                      checked={systemSettings.api.enablePublicApi}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'api', 'enablePublicApi')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitPerMinute">Rate Limit (requests per minute)</Label>
                    <Input
                      id="rateLimitPerMinute"
                      name="rateLimitPerMinute"
                      type="number"
                      min="10"
                      max="1000"
                      value={systemSettings.api.rateLimitPerMinute}
                      onChange={handleApiChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireApiKey" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Require API Key
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require API key for all API requests
                      </p>
                    </div>
                    <Switch
                      id="requireApiKey"
                      name="requireApiKey"
                      checked={systemSettings.api.requireApiKey}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'api', 'requireApiKey')}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="logApiRequests" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Log API Requests
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Keep detailed logs of all API requests
                      </p>
                    </div>
                    <Switch
                      id="logApiRequests"
                      name="logApiRequests"
                      checked={systemSettings.api.logApiRequests}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'api', 'logApiRequests')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="corsAllowedOrigins">CORS Allowed Origins</Label>
                    <Textarea
                      id="corsAllowedOrigins"
                      name="corsAllowedOrigins"
                      value={systemSettings.api.corsAllowedOrigins}
                      onChange={handleApiChange}
                      placeholder="Comma-separated domains (e.g., example.com,api.example.com)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple domains with commas. Use * for all origins (not recommended).
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  The API documentation is available at <code className="bg-gray-100 px-1 py-0.5 rounded">/api/docs</code>.
                  You can control access to the documentation below.
                </p>
                
                <div className="flex items-center gap-4">
                  <Select defaultValue="authenticated">
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="API Documentation Access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public Access</SelectItem>
                      <SelectItem value="authenticated">Authenticated Users Only</SelectItem>
                      <SelectItem value="admin">Administrators Only</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    View API Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">API Status</p>
                    <p className="text-xs text-gray-500">v1.0.0</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};