
import React, { useEffect, useRef } from 'react';
import { Member } from '../../types';
import VirtualIdCard from '../VirtualIdCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import achievements, { getLevelInfo, calculateUserScore, addPoints } from '../../../shared/achievements.js';
import { SocialShareButton } from '../SocialShareButton';

interface DashboardHomeProps {
  member: Member;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ member }) => {
  const userScore = member ? calculateUserScore(member) : { totalPoints: 0, level: '', title: '', achievements: [] };
  const maxScore = 1000;
  const cardRef = useRef<HTMLDivElement>(null);

  // Note: Daily visit bonus should be handled via API, not localStorage
  // This is just for demonstration - in a real app, this would call an API

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {member.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Here's your member dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ID Card - Center */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="relative w-full max-w-md">
            <VirtualIdCard member={member} enableSharing={false} cardRef={cardRef} />
            <div className="absolute top-4 right-4 z-30">
              <SocialShareButton cardRef={cardRef} memberName={`${member.firstName} ${member.lastName}`} />
            </div>
          </div>
        </div>

        {/* Score and Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Total Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-blue-600">{userScore.totalPoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">out of {maxScore}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((userScore.totalPoints / maxScore) * 100, 100)}%` }}
                  ></div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Award className="h-3 w-3 mr-1" />
                  {userScore.level} - {userScore.title}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-blue-500" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Experience</span>
                <span className="font-medium">{member.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Member Since</span>
                <span className="font-medium">
                  {new Date(member.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Achievements</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{userScore.achievements.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
