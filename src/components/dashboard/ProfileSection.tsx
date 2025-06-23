import React, { useState } from 'react';
import { Member } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { addPoints } from '../../utils/achievementSystem';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface ProfileSectionProps {
  member: Member;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ member }) => {
  const [formData, setFormData] = useState({
    username: member.username,
    experience: member.experience,
    email: member.email,
    phone: member.phone,
    address: member.address,
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [originalEmail] = useState(member.email);
  const [originalPhone] = useState(member.phone);

  const checkIfVerificationNeeded = () => {
    const emailChanged = formData.email !== originalEmail;
    const phoneChanged = formData.phone !== originalPhone;
    
    if (emailChanged && emailVerified) {
      setEmailVerified(false);
    }
    if (phoneChanged && phoneVerified) {
      setPhoneVerified(false);
    }
  };

  const sendEmailOtp = () => {
    console.log('Sending email OTP to:', formData.email);
    setEmailOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your email for the verification code.",
    });
  };

  const sendPhoneOtp = () => {
    console.log('Sending phone OTP to:', formData.phone);
    setPhoneOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your phone for the verification code.",
    });
  };

  const verifyEmailOtp = () => {
    if (emailOtp === '123456') {
      setEmailVerified(true);
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified.",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  const verifyPhoneOtp = () => {
    if (phoneOtp === '123456') {
      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified.",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!emailVerified) {
      toast({
        title: "Email Not Verified",
        description: "Please verify your email before saving.",
        variant: "destructive"
      });
      return;
    }

    if (!phoneVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number before saving.",
        variant: "destructive"
      });
      return;
    }

    addPoints(member.id, 20);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated. +20 points earned!",
    });
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  const handleCancel = () => {
    setFormData({
      username: member.username,
      experience: member.experience,
      email: member.email,
      phone: member.phone,
      address: member.address,
    });
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Update your profile information and earn points!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Non-editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  value={member.firstName}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  value={member.lastName}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Member ID</Label>
                <Input
                  value={member.uniqueId}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <Input
                  value={new Date(member.dateOfBirth).toLocaleDateString()}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Join Date</Label>
              <Input
                value={new Date(member.joinDate).toLocaleDateString()}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Editable fields */}
            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Editable Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience Level</Label>
                <Select 
                  value={formData.experience} 
                  onValueChange={(value) => setFormData({...formData, experience: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email with OTP verification */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      checkIfVerificationNeeded();
                    }}
                    className={emailVerified ? 'bg-green-50 border-green-300' : ''}
                  />
                  {!emailVerified && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={sendEmailOtp}
                      disabled={emailOtpSent}
                      size="sm"
                    >
                      {emailOtpSent ? 'OTP Sent' : 'Verify'}
                    </Button>
                  )}
                </div>
                
                {emailOtpSent && !emailVerified && (
                  <div className="space-y-2">
                    <Label>Enter Email OTP (Demo: use 123456)</Label>
                    <div className="flex gap-2 items-center">
                      <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button type="button" onClick={verifyEmailOtp} size="sm">
                        Verify
                      </Button>
                    </div>
                  </div>
                )}
                
                {emailVerified && (
                  <p className="text-sm text-green-600">✓ Email verified</p>
                )}
              </div>

              {/* Phone with OTP verification */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      checkIfVerificationNeeded();
                    }}
                    className={phoneVerified ? 'bg-green-50 border-green-300' : ''}
                  />
                  {!phoneVerified && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={sendPhoneOtp}
                      disabled={phoneOtpSent}
                      size="sm"
                    >
                      {phoneOtpSent ? 'OTP Sent' : 'Verify'}
                    </Button>
                  )}
                </div>
                
                {phoneOtpSent && !phoneVerified && (
                  <div className="space-y-2">
                    <Label>Enter Phone OTP (Demo: use 123456)</Label>
                    <div className="flex gap-2 items-center">
                      <InputOTP maxLength={6} value={phoneOtp} onChange={setPhoneOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button type="button" onClick={verifyPhoneOtp} size="sm">
                        Verify
                      </Button>
                    </div>
                  </div>
                )}
                
                {phoneVerified && (
                  <p className="text-sm text-green-600">✓ Phone verified</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Changes (+20 points)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
