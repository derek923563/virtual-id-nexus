const achievements = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Completed registration',
    icon: '🎉',
    condition: (member) => true,
    points: 50
  },
  {
    id: 'profile_complete',
    title: 'Profile Master',
    description: 'Updated profile information',
    icon: '✨',
    condition: (member) => member.experience && member.address,
    points: 30
  },
  {
    id: 'top_volunteer',
    title: 'Top Volunteer',
    description: 'Reached 500+ points',
    icon: '🏆',
    condition: (member) => (member.points || 0) >= 500,
    points: 0
  },
  {
    id: 'active_member',
    title: 'Active Member',
    description: 'Reached 300+ points',
    icon: '⭐',
    condition: (member) => (member.points || 0) >= 300,
    points: 0
  },
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Reached 150+ points',
    icon: '🌟',
    condition: (member) => (member.points || 0) >= 150,
    points: 0
  },
];

export function getLevelInfo(score) {
  if (score >= 1000) return { level: 'Legend', title: 'Master Champion' };
  if (score >= 750) return { level: 'Expert', title: 'Elite Member' };
  if (score >= 500) return { level: 'Advanced', title: 'Champion' };
  if (score >= 300) return { level: 'Intermediate', title: 'Hero' };
  if (score >= 150) return { level: 'Novice', title: 'Explorer' };
  return { level: 'Beginner', title: 'Newcomer' };
}

export function calculateUserScore(member) {
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
}

export async function addPoints(memberId, points, api) {
  try {
    // This should call an API endpoint to update points in the database
    // For now, we'll just log that points should be updated via API
    console.log(`Points should be updated via API: ${points} points for member ${memberId}`);
    // If api is provided, call it
    if (api) {
      await api.put(`/members/${memberId}`, { points });
    }
  } catch (error) {
    console.error('Failed to update points:', error);
  }
}

export default achievements; 