import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MemberRegistrationForm } from '../components/MemberRegistrationForm';
import VirtualIdCard from '../components/VirtualIdCard';
import { EventsManagement } from '../components/EventsManagement';
import { AdminSidebar } from '../components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit, Trash2, LogOut, Users, Calendar, Menu, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AdminPointsManager } from '../components/AdminPointsManager';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '../../src/hooks/useTheme';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Moon, Sun, Lock, Globe, MessageSquare, Palette } from 'lucide-react';
import { themes, getTheme, setTheme, isThemeUnlocked } from '../utils/themeSystem';
import achievements, { getLevelInfo, calculateUserScore, addPoints } from '../../shared/achievements.js';
import ChangePasswordCard from '../components/dashboard/ChangePasswordCard';

const AdminDashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [viewingMember, setViewingMember] = useState<Member | undefined>();
  const [managingPointsFor, setManagingPointsFor] = useState<Member | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { logout, user } = useAuth();
  const [adminMember, setAdminMember] = useState<Member | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [members, searchTerm]);

  // Filter members by role
  const getMembersByRole = (role: 'user' | 'admin') => {
    return members.filter(member => member.role === role);
  };

  const getFilteredMembersByRole = (role: 'user' | 'admin') => {
    return filteredMembers.filter(member => member.role === role);
  };

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('adminSectionChange', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('adminSectionChange', handleSectionChange as EventListener);
    };
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/members');
      setMembers(response);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError('Failed to load members. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load members from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/members/${id}`);
        await loadMembers(); // Reload the list
        toast({
          title: "Member Deleted",
          description: "Member has been successfully deleted.",
        });
      } catch (err: any) {
        console.error('Failed to delete member:', err);
        toast({
          title: "Error",
          description: "Failed to delete member. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditSuccess = () => {
    setEditingMember(undefined);
    loadMembers();
  };

  const handlePointsUpdate = async (memberId: string, pointsChange: number) => {
    try {
      // Find the member to get current points
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const newPoints = Math.max(0, (member.points || 0) + pointsChange);
      
      // Update member points via API
      await api.put(`/members/${memberId}`, { points: newPoints });
      
      // Reload members to get updated data
      await loadMembers();
      
      setManagingPointsFor(undefined);
      toast({
        title: "Points Updated",
        description: `${pointsChange > 0 ? 'Added' : 'Removed'} ${Math.abs(pointsChange)} points for ${member.firstName} ${member.lastName}`,
      });
    } catch (err: any) {
      console.error('Failed to update points:', err);
      toast({
        title: "Error",
        description: "Failed to update points. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch admin member data
  useEffect(() => {
    const fetchAdminMember = async () => {
      if (user?.username) {
        try {
          const res = await api.get(`/members?username=${user.username}`);
          if (res && res.length > 0) setAdminMember(res[0]);
        } catch (e) {
          setAdminMember(null);
        }
      }
    };
    fetchAdminMember();
  }, [user]);

  const AdminSettingsSection: React.FC = () => {
    const { user } = useAuth();
    const { theme, setTheme: setAppTheme } = useTheme();
    const { updateThemePreference } = useAuth();
    const isDarkMode = theme === 'dark';

    const [language, setLanguage] = useState(() => {
      return localStorage.getItem('language') || 'en';
    });

    const [selectedTheme, setSelectedTheme] = useState(() => getTheme().id);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const [feedback, setFeedback] = useState('');
    const [feedbackError, setFeedbackError] = useState('');

    // Get admin member data for theme unlock check from backend
    const [member, setMember] = useState(null);
    useEffect(() => {
      const fetchMember = async () => {
        if (user?.username) {
          try {
            const res = await api.get(`/members?username=${user.username}`);
            if (res && res.length > 0) setMember(res[0]);
          } catch (e) {
            setMember(null);
          }
        }
      };
      fetchMember();
    }, [user]);
    // Replace userScore calculation with calculateUserScore
    const userScore = member ? calculateUserScore(member) : { totalPoints: 0, level: '', title: '', achievements: [] };
    const themesUnlocked = isThemeUnlocked(userScore.totalPoints);

    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Handle dark mode toggle
    const handleDarkModeToggle = async (checked: boolean) => {
      const newTheme = checked ? 'dark' : 'light';
      setAppTheme(newTheme);
      if (updateThemePreference) {
        await updateThemePreference(newTheme);
      }
      toast({
        title: "Theme Updated",
        description: `Switched to ${newTheme} mode`,
      });
    };

    // Password criteria validation
    function validatePassword(pw: string) {
      let error = '';
      if (pw.length < 8) error = 'At least 8 characters';
      else if (!/[A-Z]/.test(pw)) error = 'At least 1 uppercase letter';
      else if (!/[a-z]/.test(pw)) error = 'At least 1 lowercase letter';
      else if (!/[0-9]/.test(pw)) error = 'At least 1 number';
      else if (!/[^A-Za-z0-9]/.test(pw)) error = 'At least 1 special character';
      return error;
    }

    useEffect(() => {
      setPasswordError(validatePassword(passwordData.newPassword));
      setConfirmPasswordError(
        passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
          ? "Passwords do not match"
          : ''
      );
    }, [passwordData.newPassword, passwordData.confirmPassword]);

    // Save language preference
    useEffect(() => {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage !== language) {
        localStorage.setItem('language', language);
        if (savedLanguage !== null) {
          toast({
            title: "Language Updated",
            description: `Language changed to ${getLanguageName(language)}`,
          });
        }
      }
    }, [language]);

    const getLanguageName = (code: string) => {
      const languages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German'
      };
      return languages[code as keyof typeof languages] || 'English';
    };

    const handlePasswordChange = async () => {
      if (passwordError || confirmPasswordError) {
        toast({
          title: "Error",
          description: passwordError || confirmPasswordError,
          variant: "destructive"
        });
        return;
      }
      try {
        const res = await api.put('/auth/change-password', {
          userId: member?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        toast({
          title: "Password Changed",
          description: res.message || "Your password has been successfully updated.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to update password.",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="space-y-8 max-w-4xl mx-auto bg-background text-foreground">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preferences: Only dark mode and language */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
              <div>
                <Label className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4" />
                  <span>Language</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {/* Change Password (shared) */}
          {member && <ChangePasswordCard memberId={member.id} />}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading members...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <Button 
                  onClick={loadMembers} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                      <p className="text-3xl font-bold text-blue-600">{getMembersByRole('user').length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Admins</p>
                      <p className="text-3xl font-bold text-orange-600">{getMembersByRole('admin').length}</p>
                    </div>
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Members</p>
                      <p className="text-3xl font-bold text-green-600">
                        {members.filter(m => m.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Points</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {members.reduce((sum, m) => sum + (m.points || 0), 0)}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'member-management':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Add New Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <MemberRegistrationForm onSuccess={handleEditSuccess} onCancel={() => {}} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Members List (Users Only)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Unique ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredMembersByRole('user').map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.uniqueId}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.points || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingMember(member)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setManagingPointsFor(member)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      case 'events':
        return <EventsManagement />;
      case 'admin-logins':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Logins</h2>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Users List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredMembersByRole('admin').map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingMember(member)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return <AdminSettingsSection />;
      default:
        return renderContent();
    }
  };

  return (
    <div className="min-h-screen flex w-full relative bg-background text-foreground">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
      `}>
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      {/* Main content */}
      <main className="flex-1 min-w-0 bg-background">
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {adminMember ? `Welcome, ${adminMember.firstName}` : 'Admin Dashboard'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">Virtual ID Management System</p>
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
      </main>

      {/* Dialogs */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(undefined)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <MemberRegistrationForm 
              member={editingMember} 
              onSuccess={handleEditSuccess} 
              onCancel={() => setEditingMember(undefined)}
            />
          </DialogContent>
        </Dialog>
      )}

      {viewingMember && (
        <Dialog open={!!viewingMember} onOpenChange={() => setViewingMember(undefined)}>
          <DialogContent className="max-w-md">
            <VirtualIdCard member={viewingMember} />
          </DialogContent>
        </Dialog>
      )}

      {managingPointsFor && (
        <Dialog open={!!managingPointsFor} onOpenChange={() => setManagingPointsFor(undefined)}>
          <DialogContent>
            <AdminPointsManager 
              member={managingPointsFor}
              onUpdate={(pointsChange) => handlePointsUpdate(managingPointsFor.id, pointsChange)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;
