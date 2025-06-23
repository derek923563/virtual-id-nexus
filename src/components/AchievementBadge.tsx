
import React from 'react';
import { Achievement } from '../types/achievements';
import { Badge } from '@/components/ui/badge';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${sizeClasses[size]} bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center space-x-1`}
      title={achievement.description}
    >
      <span>{achievement.icon}</span>
      <span>{achievement.name}</span>
    </Badge>
  );
};
