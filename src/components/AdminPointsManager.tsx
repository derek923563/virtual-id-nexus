
import React, { useState } from 'react';
import { Member } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

interface AdminPointsManagerProps {
  member: Member;
  onUpdate: () => void;
}

export const AdminPointsManager: React.FC<AdminPointsManagerProps> = ({ member, onUpdate }) => {
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  const updateMemberPoints = (pointsChange: number) => {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const memberIndex = members.findIndex((m: Member) => m.id === member.id);
    
    if (memberIndex !== -1) {
      members[memberIndex].adminPoints = Math.max(0, (members[memberIndex].adminPoints || 0) + pointsChange);
      localStorage.setItem('members', JSON.stringify(members));
      
      toast({
        title: "Points Updated",
        description: `${pointsChange > 0 ? 'Added' : 'Removed'} ${Math.abs(pointsChange)} points for ${member.firstName} ${member.lastName}`,
      });
      
      onUpdate();
    }
  };

  const handleAddPoints = () => {
    if (pointsToAdd > 0) {
      updateMemberPoints(pointsToAdd);
      setPointsToAdd(0);
    }
  };

  const handleRemovePoints = () => {
    if (pointsToAdd > 0) {
      updateMemberPoints(-pointsToAdd);
      setPointsToAdd(0);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Manage Points</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Current Points</p>
          <p className="text-2xl font-bold text-blue-600">{member.adminPoints || 0}</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points">Points to Add/Remove</Label>
          <Input
            id="points"
            type="number"
            min="0"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
            placeholder="Enter points"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddPoints} 
            disabled={pointsToAdd <= 0}
            className="flex-1"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button 
            onClick={handleRemovePoints} 
            disabled={pointsToAdd <= 0}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Minus className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
