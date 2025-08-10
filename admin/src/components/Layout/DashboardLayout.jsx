import React, { useState, useMemo } from 'react';
import { cn } from '../ui/utils.js';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Badge } from '../ui/badge.jsx';
import { NotificationPopover } from './NotificationPopover.jsx';
import { SettingsDropdown } from './SettingsDropdown.jsx';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Users,
  FileText,
  UserCheck,
  Shield,
  Home,
  X,
  LogOut
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'reports', label: 'Report Management', icon: FileText },
  { id: 'employees', label: 'Employee Assignment', icon: UserCheck },
  { id: 'settings', label: 'System Administration', icon: Shield },
];

export const DashboardLayout = ({ children, activeTab, onTabChange, user, onLogout, theme, onThemeChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentPageTitle = useMemo(() => {
    const currentItem = navigationItems.find(item => item.id === activeTab);
    return currentItem?.label || 'Dashboard';
  }, [activeTab]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-[#1E3A8A] text-white transition-all duration-300 flex flex-col shadow-lg z-50",
        // Desktop: collapsible sidebar
        "hidden lg:flex",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        // Mobile: full width overlay sidebar
        mobileSidebarOpen ? "fixed inset-y-0 left-0 w-64 flex" : "hidden"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden p-4 border-b border-blue-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobileSidebar}
            className="w-full justify-center text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Logo/Brand */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div>
                <h2 className="text-white">CivicConnect</h2>
                <p className="text-blue-200 text-xs">Admin Portal</p>
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile (Mobile) */}
        {mobileSidebarOpen && user && (
          <div className="p-4 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.profileImage} alt={user.firstName} />
                <AvatarFallback className="bg-blue-700 text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-blue-200 text-xs">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 justify-start gap-2 text-blue-200 hover:text-white hover:bg-white/10"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4" role="navigation" aria-label="Main navigation">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 text-blue-100 hover:bg-white/10 hover:text-white transition-colors",
                      isActive && "bg-white/15 text-white",
                      sidebarCollapsed && !mobileSidebarOpen && "justify-center"
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      // Close mobile sidebar when item is clicked
                      if (mobileSidebarOpen) {
                        closeMobileSidebar();
                      }
                    }}
                    aria-label={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
                    title={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!sidebarCollapsed || mobileSidebarOpen) && <span>{item.label}</span>}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Collapse Button */}
        <div className="hidden lg:block p-4 border-t border-blue-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={toggleMobileSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl text-gray-900 truncate">
                  {currentPageTitle}
                </h1>
                <p className="text-sm text-gray-500">Municipal Administration Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Notifications */}
              <NotificationPopover onViewAll={() => onTabChange('notifications')} />
              
              {/* Settings */}
              <SettingsDropdown 
                onNavigateToSettings={() => onTabChange('settings')}
                onChangeTheme={onThemeChange}
                currentTheme={theme}
              />
              
              {/* User Profile */}
              <div className="relative group flex items-center gap-3 pl-4 border-l border-gray-200">
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  {user && (
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6" role="main">
          {children}
        </main>

        {/* Status Bar */}
        <footer className="bg-white border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                System Online
              </span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>API Status: Connected</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                Help
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};