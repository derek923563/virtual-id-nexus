
import React, { useState } from 'react';
import { Member } from '../types';
import { generateUniqueId, saveMember } from '../utils/memberUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';

interface MemberRegistrationFormProps {
  member?: Member;
  onSuccess: () => void;
  onCancel: () => void;
}

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ 
  member, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    email: member?.email || '',
    phone: member?.phone || '',
    experience: member?.experience || '',
    dateOfBirth: member?.dateOfBirth || '',
    address: member?.address || '',
    status: member?.status || 'active'
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(!!member);
  const [phoneVerified, setPhoneVerified] = useState(!!member);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const sendEmailOtp = () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email first.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending OTP
    console.log('Sending email OTP to:', formData.email);
    setEmailOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your email for the verification code.",
    });
  };

  const sendPhoneOtp = () => {
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number first.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending OTP
    console.log('Sending phone OTP to:', formData.phone);
    setPhoneOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your phone for the verification code.",
    });
  };

  const verifyEmailOtp = () => {
    // Simulate OTP verification (in real app, this would call an API)
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
    // Simulate OTP verification (in real app, this would call an API)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailVerified) {
      toast({
        title: "Email Not Verified",
        description: "Please verify your email before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!phoneVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    const newMember: Member = {
      id: member?.id || Date.now().toString(),
      uniqueId: member?.uniqueId || generateUniqueId(),
      ...formData,
      joinDate: member?.joinDate || new Date().toISOString(),
      status: formData.status as 'active' | 'inactive'
    };

    saveMember(newMember);
    toast({
      title: member ? "Member Updated" : "Member Registered",
      description: `${newMember.firstName} ${newMember.lastName} has been ${member ? 'updated' : 'registered'} successfully.`,
    });
    onSuccess();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Register New Member'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Verification */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={emailVerified}
                className={emailVerified ? 'bg-green-50 border-green-300' : ''}
              />
              {!emailVerified && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={sendEmailOtp}
                  disabled={emailOtpSent}
                >
                  {emailOtpSent ? 'OTP Sent' : 'Send OTP'}
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

          {/* Phone Verification */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                disabled={phoneVerified}
                className={phoneVerified ? 'bg-green-50 border-green-300' : ''}
              />
              {!phoneVerified && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={sendPhoneOtp}
                  disabled={phoneOtpSent}
                >
                  {phoneOtpSent ? 'OTP Sent' : 'Send OTP'}
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

          {/* Experience Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Select value={formData.experience} onValueChange={(value) => handleChange('experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-2">1-2 years</SelectItem>
                <SelectItem value="2-3">2-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>

          {member && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {member ? 'Update Member' : 'Register Member'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberRegistrationForm;
