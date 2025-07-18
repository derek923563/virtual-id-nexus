import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Settings, Moon, Sun, Lock, Globe, MessageSquare, Eye, EyeOff, Palette } from 'lucide-react';
import { themes, getTheme, setTheme, isThemeUnlocked } from '../../utils/themeSystem';
import achievements, { getLevelInfo, calculateUserScore, addPoints } from '../../../shared/achievements.js';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { api } from '../../lib/api';

export const SettingsSection: React.FC = () => {
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

  // Get member data for theme unlock check from backend
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
      if (savedLanguage !== null) { // Only show toast if not initial load
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

  const handleThemeChange = (themeId: string) => {
    if (!themesUnlocked) {
      toast({
        title: "Theme Locked",
        description: "Reach 100 points to unlock theme customization!",
        variant: "destructive"
      });
      return;
    }
    
    setTheme(themeId);
    setSelectedTheme(themeId);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${themes.find(t => t.id === themeId)?.name}`,
    });
    
    // Refresh the page to apply theme changes
    setTimeout(() => window.location.reload(), 500);
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
      console.log('Changing password for userId:', member?.id);
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

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || feedback.length < 20 || feedback.length > 1000) {
      setFeedbackError('Feedback must be between 20 and 1000 characters.');
      toast({
        title: "Error",
        description: "Feedback must be between 20 and 1000 characters.",
        variant: "destructive"
      });
      return;
    }
    setFeedbackError('');
    try {
      await api.post('/auth/feedback', {
        firstName: user?.user?.firstName || member?.firstName,
        lastName: user?.user?.lastName || member?.lastName,
        userId: user?.user?.id || member?.id,
        feedback: feedback.trim(),
      });
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
    setFeedback('');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
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
        {/* Theme & Language Settings */}
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

        {/* Theme Customization */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
              {!themesUnlocked && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Unlock at 100 points
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">ID Card Theme</Label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    disabled={!themesUnlocked}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200
                      ${selectedTheme === theme.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}
                      ${themesUnlocked ? 'hover:border-blue-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                      bg-background text-foreground
                    `}
                  >
                    <div className={`w-full h-8 rounded ${theme.gradient} mb-2`}></div>
                    <div className="text-sm font-medium">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={e => { e.preventDefault(); handlePasswordChange(); }}>
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
                {passwordData.newPassword && passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
              {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
            </div>

              <Button type="submit" className="w-full mt-4">
              Update Password
            </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card className="lg:col-span-2 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Feedback</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feedback">Share your thoughts and suggestions</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think about our platform..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
              {feedbackError && <p className="text-red-500 text-sm mt-1">{feedbackError}</p>}
            </div>
            <Button onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
