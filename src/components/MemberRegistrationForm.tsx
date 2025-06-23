import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from '@/hooks/use-toast';

interface MemberRegistrationFormProps {
  member?: Member;
  onSuccess: () => void;
  onCancel: () => void;
}

const generateUniqueId = () => {
  return 'M-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

export const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ member, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    experience: '',
    dateOfBirth: '',
    address: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        username: member.username || '',
        email: member.email || '',
        phone: member.phone || '',
        experience: member.experience || '',
        dateOfBirth: member.dateOfBirth || '',
        address: member.address || '',
        status: member.status || 'active'
      });
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
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const memberData: Member = {
      id: member?.id || Date.now().toString(),
      uniqueId: member?.uniqueId || generateUniqueId(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      experience: formData.experience,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address.trim(),
      password: member?.password || 'user123',
      confirmPassword: member?.confirmPassword || 'user123',
      joinDate: member?.joinDate || new Date().toISOString(),
      status: formData.status as 'active' | 'inactive',
      eventParticipation: member?.eventParticipation || {
        registeredEvents: [],
        missedEvents: 0,
        lastActivity: new Date().toISOString()
      },
      adminPoints: member?.adminPoints || 0
    };

    // Save to localStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const existingIndex = members.findIndex((m: Member) => m.id === memberData.id);
    
    if (existingIndex !== -1) {
      members[existingIndex] = memberData;
    } else {
      members.push(memberData);
    }
    
    localStorage.setItem('members', JSON.stringify(members));

    toast({
      title: member ? "Member Updated" : "Member Created",
      description: `Member "${memberData.firstName} ${memberData.lastName}" has been ${member ? 'updated' : 'created'} successfully.`,
    });

    onSuccess();
  };

  return (
    <Card className="w-full max-w-2xl">
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
            {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
            {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Enter your experience"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <DatePicker
              id="dateOfBirth"
              onSelect={(date) => {
                if (date) {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  setFormData({ ...formData, dateOfBirth: formattedDate });
                }
              }}
            />
            {formData.dateOfBirth && (
              <p className="text-gray-500 text-sm mt-1">
                Selected Date: {formData.dateOfBirth}
              </p>
            )}
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
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" defaultValue={formData.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
  );
};
