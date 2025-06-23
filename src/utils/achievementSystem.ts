
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
  let totalPoints = 50; // Base registration points
  
  // Profile completion bonus
  if (member.experience && member.address) {
    totalPoints += 30;
  }
  
  // Simulate additional points (in real app, this would come from actual activity)
  const storedPoints = localStorage.getItem(`user_points_${member.id}`) || '0';
  totalPoints += parseInt(storedPoints);
  
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

export const addPoints = (memberId: string, points: number) => {
  const current = parseInt(localStorage.getItem(`user_points_${memberId}`) || '0');
  localStorage.setItem(`user_points_${memberId}`, (current + points).toString());
};
