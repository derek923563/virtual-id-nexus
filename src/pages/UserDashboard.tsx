
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { DashboardContent } from '../components/DashboardContent';

const UserDashboard: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
