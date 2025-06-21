
import React, { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { DashboardContent } from '../components/DashboardContent';

const UserDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full relative">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
      `}>
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      {/* Main content */}
      <main className="flex-1 min-w-0">
        <DashboardContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </main>
    </div>
  );
};

export default UserDashboard;
