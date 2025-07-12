
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { DashboardHome } from './dashboard/DashboardHome';
import { EventsSection } from './dashboard/EventsSection';
import { ProfileSection } from './dashboard/ProfileSection';
import { SettingsSection } from './dashboard/SettingsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

interface DashboardContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadMemberData = async () => {
      if (user?.username) {
        try {
          // Get member data from backend API
          const memberData = await api.get(`/members?username=${user.username}`);
          if (memberData && memberData.length > 0) {
            setMember(memberData[0]);
          }
        } catch (error) {
          console.error('Failed to load member data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadMemberData();
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

  const handleMemberUpdate = async (updatedMember: Member) => {
    // Re-fetch member data from backend to ensure latest info
    if (user?.username) {
      try {
        const memberData = await api.get(`/members?username=${user.username}`);
        if (memberData && memberData.length > 0) {
          setMember(memberData[0]);
        }
      } catch (error) {
        console.error('Failed to reload member data:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        return <ProfileSection member={member} onMemberUpdate={handleMemberUpdate} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardHome member={member} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow-sm border-b text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-7 w-7"
              >
                <Menu className="h-4 w-4" />
              </Button>
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
