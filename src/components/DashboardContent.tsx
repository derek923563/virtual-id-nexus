
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { getMemberById } from '../utils/memberUtils';
import { useAuth } from '../context/AuthContext';
import { DashboardHome } from './dashboard/DashboardHome';
import { EventsSection } from './dashboard/EventsSection';
import { ProfileSection } from './dashboard/ProfileSection';
import { SettingsSection } from './dashboard/SettingsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';

export const DashboardContent: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.memberId) {
      const memberData = getMemberById(user.memberId);
      setMember(memberData || null);
    }
  }, [user]);

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('sectionChange', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('sectionChange', handleSectionChange as EventListener);
    };
  }, []);

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Member Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load your member information.</p>
            <Button onClick={logout}>Return to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome member={member} />;
      case 'events':
        return <EventsSection />;
      case 'profile':
        return <ProfileSection member={member} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardHome member={member} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {member.firstName}</h1>
                <p className="text-gray-600">Member ID: {member.uniqueId}</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};
