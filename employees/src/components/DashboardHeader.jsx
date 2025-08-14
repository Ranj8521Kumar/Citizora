import React from 'react';
import { ProfileMenu } from './ProfileMenu';
import { Button } from './ui/button';
import { RefreshCcw } from 'lucide-react';

export function DashboardHeader({ title, children, onRefresh, isRefreshing }) {
  return (
    <div className="bg-card border-b border-border p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-lg font-semibold">{title}</h1>
          {onRefresh && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onRefresh}
              className="h-8 w-8"
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {children}
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
}
