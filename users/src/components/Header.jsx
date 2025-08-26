import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Home, 
  LayoutDashboard, 
  Plus, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export function Header({ user, currentPage, onNavigate, onLogin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', page: 'landing', icon: Home },
    { name: 'Community', page: 'community', icon: Users },
    { name: 'Active Citizens', page: 'citizens', icon: Users },
  ];

  const userNavigation = user ? [
    { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', page: 'report', icon: Plus },
  ] : [];

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold text-primary">Citizora</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.page)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === item.page
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            
            {userNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.page)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === item.page
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm">Welcome, {user.firstName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      currentPage === item.page
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              {userNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      currentPage === item.page
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              <div className="pt-2 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Welcome, {user.firstName}
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      onLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}