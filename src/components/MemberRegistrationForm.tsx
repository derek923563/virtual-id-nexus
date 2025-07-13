import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { differenceInYears, isAfter, subYears } from 'date-fns';

interface MemberRegistrationFormProps {
  member?: Member;
  onSuccess: () => void;
  onCancel: () => void;
}

const generateUniqueId = () => {
  return 'M-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Type guard for backend error object
function isFieldError(error: unknown): error is { field: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    typeof (error as any).field === 'string' &&
    typeof (error as any).message === 'string'
  );
}

export const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ member, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    experience: '',
    dateOfBirth: '',
    address: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { register } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

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
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        username: member.username || '',
        email: member.email || '',
        experience: member.experience || '',
        dateOfBirth: member.dateOfBirth || '',
        address: member.address || '',
        status: member.status || 'active'
      });
      setCountryCode(member.countryCode || '+1');
      setPhoneNumber(member.phoneNumber || '');
    }
  }, [member]);

  const validateForm = () => {
    let errors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
     if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!countryCode) {
      errors.countryCode = 'Country code is required';
    }
    if (!phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (passwordError || confirmPasswordError) {
      setFormErrors({ ...errors, password: passwordError, confirmPassword: confirmPasswordError });
      return;
    }

    const memberData: Member = {
      id: member?.id || Date.now().toString(),
      uniqueId: member?.uniqueId || generateUniqueId(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      countryCode,
      phoneNumber,
      experience: formData.experience,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address.trim(),
      password: password,
      confirmPassword: confirmPassword,
      joinDate: member?.joinDate || new Date().toISOString(),
      status: formData.status as 'active' | 'inactive',
      eventParticipation: member?.eventParticipation || {
        registeredEvents: [],
        missedEvents: 0,
        lastActivity: new Date().toISOString()
      },
      points: member?.points || 0
    };

    const result = await register(memberData);
    if (result.success) {
    toast({
      title: member ? "Member Updated" : "Member Created",
      description: `Member "${memberData.firstName} ${memberData.lastName}" has been ${member ? 'updated' : 'created'} successfully.`,
    });
    onSuccess();
    } else {
      // Show specific field error if provided by backend
      if (isFieldError(result.error)) {
        const err = result.error as { field: string; message: string };
        setFormErrors({ ...errors, [err.field]: err.message });
      } else {
        let errorMessage = "Could not register member. Please try again.";
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (isFieldError(result.error)) {
          const err = result.error as { field: string; message: string };
          errorMessage = err.message;
        }
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Member' : 'Register New Member'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
              {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
              {formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName}</p>}
            </div>
          </div>
          
           <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                required
              />
              {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
            </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  const val = e.target.value;
                  if (!val) setEmailError('Email is required');
                  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setEmailError('Invalid email format');
                  else setEmailError('');
                }}
              placeholder="Enter email address"
              required
            />
              {(formErrors.email || emailError) && <p className="text-red-500 text-sm">{formErrors.email || emailError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 US/Canada</SelectItem>
                    <SelectItem value="+44">+44 UK</SelectItem>
                    <SelectItem value="+91">+91 India</SelectItem>
                    <SelectItem value="+81">+81 Japan</SelectItem>
                    <SelectItem value="+61">+61 Australia</SelectItem>
                    <SelectItem value="+49">+49 Germany</SelectItem>
                    <SelectItem value="+33">+33 France</SelectItem>
                    <SelectItem value="+39">+39 Italy</SelectItem>
                    <SelectItem value="+34">+34 Spain</SelectItem>
                    <SelectItem value="+7">+7 Russia</SelectItem>
                    <SelectItem value="+55">+55 Brazil</SelectItem>
                    <SelectItem value="+52">+52 Mexico</SelectItem>
                    <SelectItem value="+27">+27 South Africa</SelectItem>
                    <SelectItem value="+971">+971 UAE</SelectItem>
                    <SelectItem value="+966">+966 Saudi Arabia</SelectItem>
                    <SelectItem value="+92">+92 Pakistan</SelectItem>
                    <SelectItem value="+880">+880 Bangladesh</SelectItem>
                    <SelectItem value="+977">+977 Nepal</SelectItem>
                    <SelectItem value="+94">+94 Sri Lanka</SelectItem>
                  </SelectContent>
                </Select>
            <Input
              id="phone"
              type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(val);
                  }}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
              required
            />
              </div>
              {(formErrors.phoneNumber || formErrors.countryCode) && <p className="text-red-500 text-sm">{formErrors.phoneNumber || formErrors.countryCode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" defaultValue={formData.experience} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1 years">0-1 years</SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="2-3 years">2-3 years</SelectItem>
                  <SelectItem value="3-4 years">3-4 years</SelectItem>
                  <SelectItem value="4-5 years">4-5 years</SelectItem>
                  <SelectItem value="5+ years">5+ years</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Input
                  id="dateOfBirth"
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, dateOfBirth: value });
                    
                    // Clear error when user starts typing
                    if (formErrors.dateOfBirth) {
                      setFormErrors(f => { const { dateOfBirth, ...rest } = f; return rest; });
                    }
                    
                    // Validate date format when user finishes typing
                    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                      const date = new Date(value);
                      const today = new Date();
                      const age = differenceInYears(today, date);
                      
                      if (isAfter(date, today)) {
                        setFormErrors(f => ({ ...f, dateOfBirth: 'Date cannot be in the future.' }));
                      } else if (age < 10) {
                        setFormErrors(f => ({ ...f, dateOfBirth: 'You must be at least 10 years old.' }));
                      } else {
                        setFormErrors(f => { const { dateOfBirth, ...rest } = f; return rest; });
                      }
                    }
                  }}
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                  required
                  className="pr-12"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <DatePicker
                    variant="compact"
              onSelect={(date) => {
                if (date) {
                        const today = new Date();
                        const age = differenceInYears(today, date);
                        if (age < 10) {
                          setFormErrors(f => ({ ...f, dateOfBirth: 'You must be at least 10 years old.' }));
                        } else {
                          setFormErrors(f => { const { dateOfBirth, ...rest } = f; return rest; });
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  setFormData({ ...formData, dateOfBirth: formattedDate });
                }
                      }
                    }}
                    disabledDate={date => {
                      // Disable future dates and dates less than 10 years ago
                      const today = new Date();
                      const minDate = subYears(today, 10);
                      return isAfter(date, minDate) || isAfter(date, today);
              }}
            />
                </div>
              </div>
            {formData.dateOfBirth && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Selected Date: {formData.dateOfBirth}
              </p>
            )}
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                💡 You can type the date (YYYY-MM-DD) or click the calendar icon to select from the calendar
              </p>
              {formErrors.dateOfBirth && <p className="text-red-500 text-sm">{formErrors.dateOfBirth}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              required
            />
            {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordError(validatePassword(e.target.value));
                    setConfirmPasswordError(confirmPassword && e.target.value !== confirmPassword ? 'Passwords do not match' : '');
                  }}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError(password !== e.target.value ? 'Passwords do not match' : '');
                  }}
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              {member ? 'Update Member' : 'Register Member'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};
