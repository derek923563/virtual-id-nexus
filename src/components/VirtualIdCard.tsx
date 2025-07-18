
import React from 'react';
import { Member } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AchievementBadge } from './AchievementBadge';
import { Calendar, Mail, Phone, MapPin, Briefcase, Trophy } from 'lucide-react';
import { getTheme } from '../utils/themeSystem';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { getLevelInfo } from '../../shared/achievements.js';
import { SocialShareButton } from './SocialShareButton';

interface VirtualIdCardProps {
  member: Member;
  showFullDetails?: boolean;
  enableSharing?: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}

const VirtualIdCard: React.FC<VirtualIdCardProps> = ({ 
  member, 
  showFullDetails = false, 
  enableSharing = false, 
  cardRef
}) => {
  // Use achievements directly from the backend response
  let userAchievements = member.achievements || [];
  const theme = getTheme();
  // Sort by points descending (toughest/most recent first)
  userAchievements = [...userAchievements].sort((a, b) => (b.points || 0) - (a.points || 0));
  const [open, setOpen] = useState(false);
  const levelInfo = getLevelInfo(member.points || 0);
  // Use cardRef from props if provided, otherwise create a local one
  const localRef = useRef<HTMLDivElement>(null);
  const refToUse = cardRef || localRef;

  return (
    <div className="max-w-md mx-auto" ref={refToUse}>
      <div ref={cardRef}>
        <Card className={`p-6 ${theme.gradient} text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          {enableSharing && (
            <div className="absolute top-4 right-4 z-20">
              <SocialShareButton cardRef={cardRef} memberName={`${member.firstName} ${member.lastName}`} />
            </div>
          )}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Virtual ID Card</h3>
                <p className="text-blue-200 text-sm">ID: {member.uniqueId}</p>
              </div>
              {/* Status badge removed for user side */}
            </div>
            
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <h2 className="text-xl font-bold">{member.firstName} {member.lastName}</h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Trophy className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-semibold">{levelInfo.title}</span>
              </div>
            </div>

            {/* Achievement Badges */}
            {userAchievements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-center">Achievements</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                  {userAchievements.slice(0, 3).map((achievement) => (
                    <AchievementBadge key={achievement._id || achievement.id} achievement={achievement} size="sm" />
                  ))}
                  {userAchievements.length > 3 && (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-white/20 text-white cursor-pointer"
                          onClick={() => setOpen(true)}
                        >
                          +{userAchievements.length - 3} more
                        </Badge>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>All Achievements</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {userAchievements.map((achievement) => (
                            <AchievementBadge key={achievement._id || achievement.id} achievement={achievement} size="md" />
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {showFullDetails && (
        <Card className="mt-4 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{member.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{member.countryCode} {member.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{member.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="text-sm">DOB: {new Date(member.dateOfBirth).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VirtualIdCard;
