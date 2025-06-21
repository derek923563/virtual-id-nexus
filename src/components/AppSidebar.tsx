
import React from 'react';
import { Home, Calendar, User, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
    id: "dashboard"
  },
  {
    title: "Events",
    url: "#events", 
    icon: Calendar,
    id: "events"
  },
  {
    title: "Profile",
    url: "#profile",
    icon: User,
    id: "profile"
  },
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
    id: "settings"
  },
];

export function AppSidebar() {
  const [activeSection, setActiveSection] = React.useState("dashboard");

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">Member Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <button 
                      className="w-full"
                      onClick={() => {
                        setActiveSection(item.id);
                        // Dispatch custom event to update main content
                        window.dispatchEvent(new CustomEvent('sectionChange', { detail: item.id }));
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
