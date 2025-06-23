
import { Member } from '../types';

export const checkAndUpdateMemberStatus = (member: Member): Member => {
  const updatedMember = { ...member };
  
  // Auto-mark as inactive if missed 2 consecutive events
  if (member.eventParticipation.missedEvents >= 2) {
    updatedMember.status = 'inactive';
  }
  
  return updatedMember;
};

export const registerMemberForEvent = (memberId: string, eventId: string): void => {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const memberIndex = members.findIndex((m: Member) => m.id === memberId);
  
  if (memberIndex !== -1) {
    // Reset missed events and mark as active when registering for event
    members[memberIndex].eventParticipation.registeredEvents.push(eventId);
    members[memberIndex].eventParticipation.missedEvents = 0;
    members[memberIndex].eventParticipation.lastActivity = new Date().toISOString();
    members[memberIndex].status = 'active';
    
    localStorage.setItem('members', JSON.stringify(members));
  }
};

export const markEventMissed = (memberId: string): void => {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const memberIndex = members.findIndex((m: Member) => m.id === memberId);
  
  if (memberIndex !== -1) {
    members[memberIndex].eventParticipation.missedEvents += 1;
    members[memberIndex] = checkAndUpdateMemberStatus(members[memberIndex]);
    localStorage.setItem('members', JSON.stringify(members));
  }
};
