import React from 'react';
import { Home, Camera, ClipboardList, Map, Settings } from 'lucide-react';
import { Badge } from './ui/badge';

export function NavigationBar({ currentView, onViewChange, isOffline }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Tasks', badge: null },
    { id: 'camera', icon: Camera, label: 'Camera', badge: null },
    { id: 'status', icon: ClipboardList, label: 'Status', badge: '2' },
    { id: 'map', icon: Map, label: 'Map', disabled: isOffline, badge: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-sm">
      <div className="flex justify-around items-center max-w-md mx-auto px-2 py-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const isDisabled = item.disabled;
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center space-y-1 p-3 rounded-xl min-w-0 flex-1 transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : isDisabled 
                    ? 'text-muted-foreground/50' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                {item.badge && !isDisabled && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"} 
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium truncate ${isActive ? 'text-primary-foreground' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}