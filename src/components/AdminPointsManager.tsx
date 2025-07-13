
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Member } from '../types';

interface AdminPointsManagerProps {
  member: Member;
  onUpdate: (pointsChange: number) => void;
}

export const AdminPointsManager: React.FC<AdminPointsManagerProps> = ({ member, onUpdate }) => {
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  const handleAddPoints = () => {
    if (pointsToAdd > 0) {
      onUpdate(pointsToAdd);
      setPointsToAdd(0);
    }
  };

  const handleRemovePoints = () => {
    if (pointsToAdd > 0) {
      onUpdate(-pointsToAdd);
      setPointsToAdd(0);
    }
  };

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Manage Total Points - {member.firstName} {member.lastName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Current Total Points</p>
          <p className="text-2xl font-bold text-blue-600">{member.points || 0}</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Points to Add/Remove</label>
          <Input
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
            placeholder="Enter points"
            min="0"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddPoints} 
            disabled={pointsToAdd <= 0}
            className="flex-1"
          >
            Add Points
          </Button>
          <Button 
            onClick={handleRemovePoints} 
            disabled={pointsToAdd <= 0}
            variant="outline"
            className="flex-1"
          >
            Remove Points
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
