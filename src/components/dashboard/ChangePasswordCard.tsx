import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '../../lib/api';

interface ChangePasswordCardProps {
  memberId: string;
}

const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({ memberId }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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
        ? 'Passwords do not match'
        : ''
    );
  }, [passwordData.newPassword, passwordData.confirmPassword]);

  const handlePasswordChange = async () => {
    if (passwordError || confirmPasswordError) {
      toast({
        title: 'Error',
        description: passwordError || confirmPasswordError,
        variant: 'destructive'
      });
      return;
    }
    try {
      const res = await api.put('/auth/change-password', {
        userId: memberId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast({
        title: 'Password Changed',
        description: res.message || 'Your password has been successfully updated.'
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to update password.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="h-5 w-5" />
          <span>Change Password</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Current Password</Label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowCurrentPassword(v => !v)}
              tabIndex={-1}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <Label>New Password</Label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowNewPassword(v => !v)}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {passwordData.newPassword.length > 0 && passwordError && (
            <div className="text-red-500 text-xs mt-1">{passwordError}</div>
          )}
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(v => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {confirmPasswordError && <div className="text-red-500 text-xs mt-1">{confirmPasswordError}</div>}
        </div>
        <Button onClick={handlePasswordChange} className="w-full mt-2" size="lg">
          Update Password
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordCard; 