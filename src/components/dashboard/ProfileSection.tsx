
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
    // Award points for profile update
    addPoints(member.id, 20);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated. +20 points earned!",
    });
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: 'dashboard' }));
  };

  const handleCancel = () => {
    setFormData({
      experience: member.experience,
      dateOfBirth: member.dateOfBirth,
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
          {/* Non-editable fields */}
          <div className="grid grid-cols-1 gap-6">
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
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  value={member.email}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  value={member.phone}
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
                <Label className="text-sm font-medium text-gray-700">Join Date</Label>
                <Input
                  value={new Date(member.joinDate).toLocaleDateString()}
                  disabled
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="border-t pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Editable Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
};
