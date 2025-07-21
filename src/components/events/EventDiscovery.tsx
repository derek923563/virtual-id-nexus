import React, { useState, useEffect } from 'react';
import { Event } from '../../types/events';
import { getEvents } from '../../utils/eventUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, MapPin, Users, Clock, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EventDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const loadEvents = () => {
      const eventData = getEvents();
      const publishedEvents = eventData.filter(event => event.status === 'published');
      setEvents(publishedEvents);
      setFilteredEvents(publishedEvents);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory, activeTab]);

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by time period
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.startDateTime) > now);
        break;
      case 'ongoing':
        filtered = filtered.filter(event => 
          new Date(event.startDateTime) <= now && new Date(event.endDateTime) >= now
        );
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.endDateTime) < now);
        break;
    }

    setFilteredEvents(filtered);
  };

  const getEventStatus = (event: Event): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (now > endDate) {
      return { label: 'Completed', variant: 'secondary' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Live', variant: 'destructive' };
    } else if (now > registrationDeadline) {
      return { label: 'Registration Closed', variant: 'outline' };
    } else if (event.currentRegistrations >= event.maxRegistrations) {
      return { label: 'Full', variant: 'outline' };
    } else {
      return { label: 'Open for Registration', variant: 'default' };
    }
  };

  const canRegister = (event: Event): boolean => {
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    return now <= registrationDeadline && 
           event.currentRegistrations < event.maxRegistrations &&
           event.status === 'published';
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const status = getEventStatus(event);
    const startDateTime = formatDateTime(event.startDateTime);
    const endDateTime = formatDateTime(event.endDateTime);

    return (
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          {event.bannerUrl && (
            <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden">
              <img 
                src={event.bannerUrl} 
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                {event.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {startDateTime.date} {startDateTime.time} - {endDateTime.time}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.venue}</span>
              <Badge variant="outline" className="text-xs">
                {event.eventType}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.currentRegistrations}/{event.maxRegistrations} registered
              </span>
            </div>

            {event.fees.amount > 0 && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <IndianRupee className="h-4 w-4" />
                <span>₹{event.fees.amount}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Registration closes: {formatDateTime(event.registrationDeadline).date}
              </span>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              View Details
            </Button>
            {canRegister(event) && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/events/${event.id}/register`)}
              >
                Register Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events by name, description, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="hackathon">Hackathon</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="meetup">Meetup</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p>
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : `No ${activeTab} events available at the moment.`}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};