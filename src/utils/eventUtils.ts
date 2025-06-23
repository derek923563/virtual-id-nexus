
import { Event } from '../types/events';

export const getEvents = (): Event[] => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

export const saveEvent = (event: Event): void => {
  const events = getEvents();
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  if (existingIndex !== -1) {
    events[existingIndex] = { ...event, updatedAt: new Date().toISOString() };
  } else {
    events.push({ ...event, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem('events', JSON.stringify(events));
};

export const deleteEvent = (id: string): void => {
  const events = getEvents();
  const filteredEvents = events.filter(e => e.id !== id);
  localStorage.setItem('events', JSON.stringify(filteredEvents));
};

export const getEventById = (id: string): Event | null => {
  const events = getEvents();
  return events.find(e => e.id === id) || null;
};
