import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface ProfileSectionProps {
  member: Member;
  onMemberUpdate?: (updatedMember: Member) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ member, onMemberUpdate }) => {
  const [formData, setFormData] = useState({
    username: member.username,
    experience: member.experience,
    email: member.email,
    address: member.address,
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(member.emailVerified || false);
  const [phoneVerified, setPhoneVerified] = useState(member.phoneVerified || false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername] = useState(member.username);

  // Helper to extract country code and phone number from legacy phone field
  function extractCountryAndNumber(member: Member) {
    if (member.countryCode && member.phoneNumber) {
      return {
        countryCode: member.countryCode,
        phoneNumber: member.phoneNumber
      };
    } else if ((member as any).phone && typeof (member as any).phone === 'string' && (member as any).phone.length >= 4) {
      const phone = (member as any).phone;
      return {
        countryCode: phone.slice(0, 3),
        phoneNumber: phone.slice(3, 13)
      };
    } else {
      return {
        countryCode: '+1',
        phoneNumber: ''
      };
    }
  }

  const initialPhone = extractCountryAndNumber(member);
  const [countryCode, setCountryCode] = useState(initialPhone.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.phoneNumber);

  const experienceOptions = [
    "0-1 years",
    "1-2 years", 
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5+ years"
  ];

  const countryCodes = [
    { code: '+1', country: 'US/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+61', country: 'Australia' },
    { code: '+7', country: 'Russia' },
    { code: '+55', country: 'Brazil' },
    { code: '+52', country: 'Mexico' },
    { code: '+27', country: 'South Africa' },
    { code: '+971', country: 'UAE' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+92', country: 'Pakistan' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+977', country: 'Nepal' },
    { code: '+94', country: 'Sri Lanka' },
  ];

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username === originalUsername) {
      setUsernameAvailable(null); // Don't show green for original username
      return;
    }
    
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await api.get(`/auth/check-username/${username}?excludeUserId=${member.id}`);
      setUsernameAvailable(response.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    setEmailVerified(member.emailVerified || false);
    setPhoneVerified(member.phoneVerified || false);
    const extracted = extractCountryAndNumber(member);
    setCountryCode(extracted.countryCode);
    setPhoneNumber(extracted.phoneNumber);
  }, [member.emailVerified, member.phoneVerified, member.countryCode, member.phoneNumber, (member as any).phone]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsername(formData.username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const sendEmailOtp = async () => {
    if (emailVerified) return;
    setEmailOtpSent(true);
    setShowEmailOtpInput(true);
    toast({
      title: "OTP Sent",
      description: "Demo OTP sent! Use 123456 to verify.",
    });
  };

  const sendPhoneOtp = async () => {
    if (phoneVerified) return;
    setPhoneOtpSent(true);
    setShowPhoneOtpInput(true);
    toast({
      title: "OTP Sent",
      description: "Demo OTP sent! Use 123456 to verify.",
    });
  };

  const verifyEmailOtp = async () => {
    if (emailOtp === '123456') {
      try {
        const response = await api.post('/auth/verify-otp', {
          userId: member.id,
          type: 'email',
          otp: emailOtp
        });
        console.log('OTP verify response:', response);
        if ((response.status === 200 || response.status === 201) && response.data && response.data.success === true) {
      setEmailVerified(true);
          setEmailOtp('');
          setShowEmailOtpInput(false);
          setEmailOtpSent(false);
          toast({
            title: "Email Verified!",
            description: `Email verified successfully! +${response.data.pointsAwarded} points earned!`,
          });
          if (onMemberUpdate) {
            onMemberUpdate({ ...member, ...response.data.user });
          }
        } else {
          toast({
            title: "Error",
            description: response.data?.message || "Failed to verify email. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('OTP verification error:', error);
      toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to verify email. Please try again.",
          variant: "destructive"
      });
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter 123456 for demo verification.",
        variant: "destructive"
      });
    }
  };

  const verifyPhoneOtp = async () => {
    if (phoneOtp === '123456') {
      try {
        const response = await api.post('/auth/verify-otp', {
          userId: member.id,
          type: 'phone',
          otp: phoneOtp
        });
        console.log('OTP verify response:', response);
        if ((response.status === 200 || response.status === 201) && response.data && response.data.success === true) {
      setPhoneVerified(true);
          setPhoneOtp('');
          setShowPhoneOtpInput(false);
          setPhoneOtpSent(false);
          toast({
            title: "Phone Verified!",
            description: `Phone number verified successfully! +${response.data.pointsAwarded} points earned!`,
          });
          if (onMemberUpdate) {
            onMemberUpdate({ ...member, ...response.data.user });
          }
        } else {
          toast({
            title: "Error",
            description: response.data?.message || "Failed to verify phone. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('OTP verification error:', error);
      toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to verify phone. Please try again.",
          variant: "destructive"
      });
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter 123456 for demo verification.",
        variant: "destructive"
      });
    }
  };

  // Phone number validation function
  const handlePhoneNumberChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    
    setPhoneNumber(limitedValue);
  };

  const handleSave = async () => {
    // Validate username
    if (usernameAvailable === false) {
      toast({
        title: "Username Not Available",
        description: "Please choose a different username.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update member data via API
      await api.put(`/members/${member.id}`, {
        ...formData,
        countryCode,
        phoneNumber
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      // Update member data if callback provided
      if (onMemberUpdate) {
        onMemberUpdate({ ...member, ...formData, countryCode, phoneNumber });
      }
      window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: member.username,
      experience: member.experience,
      email: member.email,
      address: member.address,
    });
    setEmailVerified(false);
    setPhoneVerified(false);
    setShowEmailOtpInput(false);
    setShowPhoneOtpInput(false);
    setEmailOtpSent(false);
    setPhoneOtpSent(false);
    setUsernameAvailable(null);
    const initialPhone = extractCountryAndNumber(member);
    setCountryCode(initialPhone.countryCode);
    setPhoneNumber(initialPhone.phoneNumber);
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Update your profile information. Verify your email and phone to earn bonus points!</p>
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
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                <Input
                  value={member.firstName}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                <Input
                  value={member.lastName}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member ID</Label>
                <Input
                  value={member.uniqueId}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed font-mono dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</Label>
                <Input
                  value={new Date(member.dateOfBirth).toLocaleDateString()}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</Label>
              <Input
                value={new Date(member.joinDate).toLocaleDateString()}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
              />
            </div>

            {/* Editable fields */}
            <div className="border-t pt-6 space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className={`${
                      usernameAvailable === true ? 'border-green-300 bg-green-50' : 
                      usernameAvailable === false ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : usernameAvailable === true ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : usernameAvailable === false ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : null}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-sm text-red-600">Username is already taken</p>
                )}
                {usernameAvailable === true && formData.username !== originalUsername && (
                  <p className="text-sm text-green-600">Username is available</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level</Label>
                <Select 
                  value={formData.experience} 
                  onValueChange={(value) => setFormData({...formData, experience: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email with OTP verification */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                    }}
                    className={emailVerified ? 'bg-green-50 border-green-300' : ''}
                  disabled={emailVerified}
                  />
                
                {/* Get OTP Button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={sendEmailOtp}
                  disabled={emailOtpSent || emailVerified}
                      size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/80 border-primary"
                    >
                  {emailOtpSent ? 'OTP Sent' : emailVerified ? 'Email Verified' : 'Get OTP (+10 pts)'}
                    </Button>
                
                {/* OTP Input Section */}
                {showEmailOtpInput && !emailVerified && (
                  <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
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
                        Submit OTP
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
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={phoneVerified}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    className={`flex-1 ${phoneVerified ? 'bg-green-50 border-green-300' : ''}`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    disabled={phoneVerified}
                  />
                </div>
                {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                  <p className="text-sm text-amber-600">Phone number must be 10 digits</p>
                )}
                
                {/* Get OTP Button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={sendPhoneOtp}
                  disabled={phoneOtpSent || phoneVerified || phoneNumber.length !== 10}
                      size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/80 border-primary"
                    >
                  {phoneOtpSent ? 'OTP Sent' : phoneVerified ? 'Phone Verified' : 'Get OTP (+10 pts)'}
                    </Button>
                
                {/* OTP Input Section */}
                {showPhoneOtpInput && !phoneVerified && (
                  <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
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
                        Submit OTP
                      </Button>
                    </div>
                  </div>
                )}
                
                {phoneVerified && (
                  <p className="text-sm text-green-600">✓ Phone verified</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</Label>
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
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={usernameAvailable === false}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
