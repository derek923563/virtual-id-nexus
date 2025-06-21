
import React, { useState } from 'react';
import { Member } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';

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
    // In a real app, this would update the member data via API
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Read-only Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Full Name</Label>
              <p className="text-lg font-semibold">{member.firstName} {member.lastName}</p>
              <p className="text-sm text-gray-500">Name cannot be changed</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-lg font-semibold">{member.email}</p>
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
              <p className="text-lg font-semibold">{member.phone}</p>
              <p className="text-sm text-gray-500">Phone number cannot be changed</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Member ID</Label>
              <p className="text-lg font-semibold font-mono">{member.uniqueId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Join Date</Label>
              <p className="text-lg font-semibold">{new Date(member.joinDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Editable Information */}
        <Card>
          <CardHeader>
            <CardTitle>Editable Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
