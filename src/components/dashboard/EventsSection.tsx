
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Event } from '../../types/events';
import { getEvents, saveEvent, deleteEvent, isDraft, isPublished, classifyPublishedEvent } from '../../utils/eventUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export const EventsSection: React.FC<{ renderHeader?: React.ReactNode }> = ({ renderHeader }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [member, setMember] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMember = async () => {
      if (user?.username) {
        try {
          const res = await api.get(`/members?username=${user.username}`);
          if (res && res.length > 0) setMember(res[0]);
        } catch (e) {
          setMember(null);
        }
      }
    };
    fetchMember();
  }, [user]);

  const memberPoints = member?.points ?? 0;
  // Dynamically check eligibility
  const minPointsRequired = selectedEvent?.eligibility?.pointsRequired ?? 0;
  const canRegister = memberPoints >= minPointsRequired;

  console.log('user:', user);
  console.log('user.user:', user?.user);
  console.log('memberPoints:', memberPoints);

  useEffect(() => {
    (async () => {
      const loadedEvents = await getEvents();
      setEvents(loadedEvents);
    })();
  }, []);

  // Filtering logic
  const draftEvents = events.filter(isDraft);
  const publishedEvents = events.filter(isPublished);
  const currentEvents = publishedEvents.filter(e => classifyPublishedEvent(e) === 'current');
  const upcomingEvents = publishedEvents.filter(e => classifyPublishedEvent(e) === 'upcoming');
  const pastEvents = publishedEvents.filter(e => classifyPublishedEvent(e) === 'past');

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handlePublish = async (event: Event) => {
    const updated = { ...event, status: 'published' as 'published' };
    await saveEvent(updated);
    const updatedEvents = await getEvents();
    setEvents(updatedEvents);
    setSelectedEvent(null);
    setModalOpen(false);
  };

  const handleDelete = async (event: Event) => {
    await deleteEvent(event.id);
    setModalOpen(false);
    const updatedEvents = await getEvents();
    setEvents(updatedEvents);
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="mb-4 cursor-pointer" onClick={() => handleEventClick(event)}>
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
            <span>{new Date(event.startDateTime).toLocaleDateString()} - {new Date(event.endDateTime).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isAdmin = user?.role === 'admin'; // Adjust this line if your user object structure is different

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
        <p className="text-gray-600 dark:text-gray-300">Stay updated with all your events</p>
      </div>
        {renderHeader}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex justify-center mb-6">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          {isAdmin && <TabsTrigger value="draft">Drafts</TabsTrigger>}
        </TabsList>
        <TabsContent value="current">
              {currentEvents.length > 0 ? (
                currentEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No current events</p>
              )}
        </TabsContent>
        <TabsContent value="upcoming">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming events</p>
              )}
        </TabsContent>
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            pastEvents.map(event => <EventCard key={event.id} event={event} />)
          ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No past events</p>
          )}
        </TabsContent>
        {isAdmin && (
          <TabsContent value="draft">
            {draftEvents.length > 0 ? (
              draftEvents.map(event => (
                <div key={event.id} className="mb-4">
                  <EventCard key={event.id} event={event} />
                  <Button className="mt-2 w-full" onClick={() => handlePublish(event)}>Publish</Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No drafts</p>
            )}
          </TabsContent>
        )}
      </Tabs>
      {/* Event Details Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.name}</DialogTitle>
                <DialogDescription>{selectedEvent.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div><strong>Category:</strong> <Badge>{selectedEvent.category}</Badge></div>
                {selectedEvent.points !== undefined && <div><strong>Points:</strong> {selectedEvent.points}</div>}
                <div><strong>Event Type:</strong> {selectedEvent.eventType}</div>
                {selectedEvent.startDateTime && selectedEvent.endDateTime && (
                  <div><strong>Dates:</strong> {new Date(selectedEvent.startDateTime).toLocaleDateString('en-GB')} - {new Date(selectedEvent.endDateTime).toLocaleDateString('en-GB')}</div>
                )}
                {selectedEvent.registrationDeadline && (
                  <div><strong>Registration Deadline:</strong> {new Date(selectedEvent.registrationDeadline).toLocaleDateString('en-GB')}</div>
                )}
                {selectedEvent.venue && <div><strong>Venue:</strong> {selectedEvent.venue}</div>}
                {selectedEvent.address && <div><strong>Address:</strong> {selectedEvent.address}</div>}
                {selectedEvent.mapLink && <div><strong>Map Link:</strong> <a href={selectedEvent.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Map</a></div>}
                {selectedEvent.eligibility && typeof selectedEvent.eligibility.pointsRequired === 'number' && (
                  <div><strong>Minimum Points Required to Register:</strong> {selectedEvent.eligibility.pointsRequired}</div>
                )}
                {selectedEvent.isPaid && selectedEvent.fees && (
                  <>
                    <div><strong>Fee:</strong> ₹{selectedEvent.fees.amount}</div>
                    {selectedEvent.fees.paymentLink && <div><strong>Payment Link:</strong> <a href={selectedEvent.fees.paymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedEvent.fees.paymentLink}</a></div>}
                    {selectedEvent.fees.upiId && <div><strong>UPI ID:</strong> {selectedEvent.fees.upiId}</div>}
                  </>
                )}
                {selectedEvent.lumaEventLink && (
                  <div><strong>Luma Event Link:</strong> <a href={selectedEvent.lumaEventLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedEvent.lumaEventLink}</a></div>
                )}
              </div>
              {/* Luma Registration Button */}
              {selectedEvent.lumaEventId && (
                <div className="flex flex-col items-center mt-6">
                  {minPointsRequired > 0 && !canRegister && (
                    <div className="mb-2 text-red-600 font-semibold text-center">
                      You don't have enough points for this event.
                    </div>
                  )}
                  <a
                    href={`https://lu.ma/event/${selectedEvent.lumaEventId}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full text-lg shadow-md transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={canRegister ? 0 : -1}
                    aria-disabled={!canRegister}
                    style={{ pointerEvents: canRegister ? undefined : 'none', opacity: canRegister ? 1 : 0.5 }}
                  >
                    Register for Event
                  </a>
                </div>
              )}
              <DialogFooter>
                {selectedEvent.status === 'draft' && (
                  <>
                    <Button onClick={() => handlePublish(selectedEvent)}>Publish</Button>
                    <Button variant="destructive" onClick={() => handleDelete(selectedEvent)}>Delete</Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
