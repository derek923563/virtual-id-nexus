
import { Event } from '../types/events';
import { api } from '../lib/api';

export const getEvents = async (): Promise<Event[]> => {
  return await api.get('/events');
};

export const saveEvent = async (event: Event): Promise<Event> => {
  const eventToSend = { ...event };
  if (!event.id && (event as any)._id) {
    delete (eventToSend as any)._id;
  }
  if (event.id) {
    // Update existing event
    return await api.put(`/events/${event.id}`, eventToSend);
  } else {
    // Create new event
    return await api.post('/events', eventToSend);
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    return await api.get(`/events/${id}`);
  } catch {
    return null;
  }
};

export function isDraft(event: Event): boolean {
  return event.status === 'draft';
}

export function isPublished(event: Event): boolean {
  // Treat any non-draft as published for legacy support
  return event.status !== 'draft';
}

// Classify published events for UI display
export function classifyPublishedEvent(event: Event): 'current' | 'upcoming' | 'past' | null {
  if (!isPublished(event)) return null;
  const now = new Date();
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  if (end < now) return 'past';
  if (start > now) return 'upcoming';
  if (start <= now && end >= now) return 'current';
  return null;
}
