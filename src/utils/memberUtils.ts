
import { Member } from '../types';

// DEPRECATED: All member data should be fetched from the backend API. This file is no longer used.

export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VID${timestamp.slice(-6)}${random}`;
};
