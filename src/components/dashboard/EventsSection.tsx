
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Event } from '../../types/events';
import { getEvents } from '../../utils/eventUtils';

export const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
  }, []);

  // Categorize events based on dates (for demo purposes, we'll treat all as upcoming)
  const currentEvents = events.filter(event => events.indexOf(event) === 0); // First event as current
  const upcomingEvents = events.filter(event => events.indexOf(event) > 0); // Rest as upcoming
  const expiredEvents: Event[] = []; // No expired events for now

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <Badge variant="secondary">
            {event.points} points
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>{event.description}</p>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Event Date: TBD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
        <p className="text-gray-600 dark:text-gray-300">Stay updated with all your events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Current Events</CardTitle>
            </CardHeader>
            <CardContent>
              {currentEvents.length > 0 ? (
                currentEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No current events</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Past Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600 dark:text-gray-300">Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No past events</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
