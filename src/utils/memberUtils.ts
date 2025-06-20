
import { Member } from '../types';

export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VID${timestamp.slice(-6)}${random}`;
};

export const getMembers = (): Member[] => {
  const members = localStorage.getItem('members');
  return members ? JSON.parse(members) : [];
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const existingIndex = members.findIndex(m => m.id === member.id);
  
  if (existingIndex >= 0) {
    members[existingIndex] = member;
  } else {
    members.push(member);
  }
  
  localStorage.setItem('members', JSON.stringify(members));
};

export const deleteMember = (id: string): void => {
  const members = getMembers();
  const filteredMembers = members.filter(m => m.id !== id);
  localStorage.setItem('members', JSON.stringify(filteredMembers));
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find(m => m.id === id);
};
