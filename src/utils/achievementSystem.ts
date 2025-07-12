
import { Achievement, UserScore } from '../types/achievements';

export const achievements: Achievement[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'Completed registration',
    icon: '🎉',
    condition: () => true,
    points: 50
  },
  {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Updated profile information',
    icon: '✨',
    condition: (member) => member.experience && member.address,
    points: 30
  },
  {
    id: 'top_volunteer',
    name: 'Top Volunteer',
    description: 'Reached 500+ points',
    icon: '🏆',
    condition: (member, score) => score >= 500,
    points: 0
  },
  {
    id: 'active_member',
    name: 'Active Member',
    description: 'Reached 300+ points',
    icon: '⭐',
    condition: (member, score) => score >= 300,
    points: 0
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reached 150+ points',
    icon: '🌟',
    condition: (member, score) => score >= 150,
    points: 0
  }
];

export const getLevelInfo = (score: number) => {
  if (score >= 1000) return { level: 'Legend', title: 'Master Champion' };
  if (score >= 750) return { level: 'Expert', title: 'Elite Member' };
  if (score >= 500) return { level: 'Advanced', title: 'Champion' };
  if (score >= 300) return { level: 'Intermediate', title: 'Hero' };
  if (score >= 150) return { level: 'Novice', title: 'Explorer' };
  return { level: 'Beginner', title: 'Newcomer' };
};

export const calculateUserScore = (member: any): UserScore => {
  // Use the points directly from the database as total points
  const totalPoints = member.points || 0;
  
  const { level, title } = getLevelInfo(totalPoints);
  
  const earnedAchievements = achievements
    .filter(achievement => achievement.condition(member, totalPoints))
    .map(achievement => achievement.id);
  
  return {
    totalPoints,
    level,
    title,
    achievements: earnedAchievements
  };
};

export const addPoints = async (memberId: string, points: number): Promise<void> => {
  try {
    // This should call an API endpoint to update points in the database
    // For now, we'll just log that points should be updated via API
    console.log(`Points should be updated via API: ${points} points for member ${memberId}`);
    
    // TODO: Implement API call to update points
    // await api.put(`/members/${memberId}`, { points: currentPoints + points });
  } catch (error) {
    console.error('Failed to update points:', error);
  }
};
