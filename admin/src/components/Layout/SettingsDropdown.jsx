import React from 'react';
import { Settings, MonitorSmartphone, Moon, Sun, Globe, PaintBucket, LifeBuoy, Laptop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';

export const SettingsDropdown = ({ onChangeTheme, onNavigateToSettings, currentTheme = 'system' }) => {
  const [theme, setTheme] = React.useState(currentTheme); // Can be 'light', 'dark', or 'system'
  
  // Update local state when prop changes
  React.useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, [currentTheme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(newTheme);
    }
    
    // Show a simple alert for now (we can use a proper toast when components are fixed)
    console.log(`Theme changed to: ${newTheme}`);
    
    if (onChangeTheme) {
      onChangeTheme(newTheme);
    }
  };

  const handleSettingsNavigation = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaintBucket className="mr-2 h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {theme === 'light' && <Badge className="ml-auto">Active</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {theme === 'dark' && <Badge className="ml-auto">Active</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {theme === 'system' && <Badge className="ml-auto">Active</Badge>}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe className="mr-2 h-4 w-4" />
              <span>Language</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <span>English (US)</span>
                  <Badge className="ml-auto">Active</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Spanish</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>French</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>German</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={handleSettingsNavigation}>
            <MonitorSmartphone className="mr-2 h-4 w-4" />
            <span>Display Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
