
import React from 'react';
import { Home, Calendar, User, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard"
  },
  {
    title: "Events",
    icon: Calendar,
    id: "events"
  },
  {
    title: "Profile",
    icon: User,
    id: "profile"
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings"
  },
];

interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AppSidebar({ sidebarOpen, setSidebarOpen }: AppSidebarProps) {
  const [activeSection, setActiveSection] = React.useState("dashboard");

  const handleMenuClick = (itemId: string) => {
    setActiveSection(itemId);
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: itemId }));
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card text-card-foreground">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Member Portal</h2>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-7 w-7 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                ${activeSection === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
