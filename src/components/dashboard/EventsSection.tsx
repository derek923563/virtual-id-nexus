
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const EventsSection: React.FC = () => {
  // Mock event data - in a real app this would come from an API
  const currentEvents = [
    {
      id: 1,
      title: "Annual Conference 2024",
      date: "2024-06-25",
      time: "09:00 AM",
      location: "Main Auditorium",
      status: "ongoing"
    }
  ];

  const upcomingEvents = [
    {
      id: 2,
      title: "Networking Meetup",
      date: "2024-07-15",
      time: "06:00 PM",
      location: "Community Center",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Workshop: Professional Development",
      date: "2024-08-02",
      time: "02:00 PM",
      location: "Room 101",
      status: "upcoming"
    }
  ];

  const expiredEvents = [
    {
      id: 4,
      title: "Monthly Gathering",
      date: "2024-05-20",
      time: "07:00 PM",
      location: "Main Hall",
      status: "expired"
    },
    {
      id: 5,
      title: "Skills Assessment",
      date: "2024-04-15",
      time: "10:00 AM",
      location: "Testing Center",
      status: "expired"
    }
  ];

  const EventCard = ({ event }: { event: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <Badge 
            variant={event.status === 'ongoing' ? 'default' : 
                    event.status === 'upcoming' ? 'secondary' : 'outline'}
          >
            {event.status}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-600">Stay updated with all your events</p>
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
                <p className="text-gray-500 text-center py-4">No current events</p>
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
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expired Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600">Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              {expiredEvents.length > 0 ? (
                expiredEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-gray-500 text-center py-4">No past events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
