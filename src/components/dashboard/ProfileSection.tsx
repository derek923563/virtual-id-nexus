
import React, { useState } from 'react';
import { Member } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

interface ProfileSectionProps {
  member: Member;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ member }) => {
  const [formData, setFormData] = useState({
    experience: member.experience,
    dateOfBirth: member.dateOfBirth,
    address: member.address,
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    // Redirect to dashboard
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      experience: member.experience,
      dateOfBirth: member.dateOfBirth,
      address: member.address,
    });
    // Redirect to dashboard
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Non-editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">First Name</Label>
              <Input
                value={member.firstName}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Last Name</Label>
              <Input
                value={member.lastName}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input
              value={member.email}
              disabled
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Phone Number</Label>
            <Input
              value={member.phone}
              disabled
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Member ID</Label>
            <Input
              value={member.uniqueId}
              disabled
              className="bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Join Date</Label>
            <Input
              value={new Date(member.joinDate).toLocaleDateString()}
              disabled
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Editable fields */}
          <div>
            <Label htmlFor="experience">Experience Level</Label>
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

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Enter your address"
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
