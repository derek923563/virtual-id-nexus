import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event } from '../../types/events';
import { getEventById } from '../../utils/eventUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  IndianRupee, 
  Phone, 
  Mail, 
  ExternalLink,
  ArrowLeft,
  Share2
} from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      setEvent(eventData);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  const getEventStatus = (): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
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

  const canRegister = (): boolean => {
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    return now <= registrationDeadline && 
           event.currentRegistrations < event.maxRegistrations &&
           event.status === 'published';
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const status = getEventStatus();
  const startDateTime = formatDateTime(event.startDateTime);
  const endDateTime = formatDateTime(event.endDateTime);
  const registrationDeadline = formatDateTime(event.registrationDeadline);

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      {/* Event Banner */}
      {event.bannerUrl && (
        <div className="w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden">
          <img 
            src={event.bannerUrl} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant="outline">{event.eventType}</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl mb-2">{event.name}</CardTitle>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={shareEvent}>
                <Share2 className="h-4 w-4" />
              </Button>
              {canRegister() && (
                <Button onClick={() => navigate(`/events/${event.id}/register`)}>
                  Register Now
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Date & Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Start</p>
                <p className="text-muted-foreground">{startDateTime.date}</p>
                <p className="text-muted-foreground">{startDateTime.time}</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium">End</p>
                <p className="text-muted-foreground">{endDateTime.date}</p>
                <p className="text-muted-foreground">{endDateTime.time}</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium">Registration Deadline</p>
                <p className="text-muted-foreground">{registrationDeadline.date} at {registrationDeadline.time}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{event.venue}</p>
                <p className="text-muted-foreground">{event.address}</p>
                {event.mapLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={event.mapLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Map
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          {(event.eligibility.ageGroup || event.eligibility.year || event.eligibility.department || event.eligibility.other) && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.eligibility.ageGroup && (
                    <div>
                      <p className="font-medium">Age Group</p>
                      <p className="text-muted-foreground">{event.eligibility.ageGroup}</p>
                    </div>
                  )}
                  {event.eligibility.year && (
                    <div>
                      <p className="font-medium">Academic Year</p>
                      <p className="text-muted-foreground">{event.eligibility.year}</p>
                    </div>
                  )}
                  {event.eligibility.department && (
                    <div>
                      <p className="font-medium">Department</p>
                      <p className="text-muted-foreground">{event.eligibility.department}</p>
                    </div>
                  )}
                  {event.eligibility.other && (
                    <div>
                      <p className="font-medium">Other Requirements</p>
                      <p className="text-muted-foreground">{event.eligibility.other}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Questions Preview */}
          {event.customQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registration Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The following additional questions will be asked during registration:
                </p>
                <div className="space-y-3">
                  {event.customQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-start space-x-2">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <div>
                        <p>{question.question}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          {question.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.currentRegistrations}/{event.maxRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Registered</p>
                </div>
              </div>

              {event.fees.amount > 0 && (
                <div className="flex items-center space-x-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">₹{event.fees.amount}</p>
                    <p className="text-sm text-muted-foreground">Registration Fee</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{registrationDeadline.date}</p>
                  <p className="text-sm text-muted-foreground">Registration Deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizers */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Organizers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.organizers.map((organizer, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium">{organizer.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${organizer.email}`} className="hover:text-primary">
                        {organizer.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${organizer.phone}`} className="hover:text-primary">
                        {organizer.phone}
                      </a>
                    </div>
                  </div>
                  {index < event.organizers.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Registration CTA */}
          {canRegister() && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Ready to join?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register now to secure your spot!
                </p>
                <Button 
                  onClick={() => navigate(`/events/${event.id}/register`)}
                  className="w-full"
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};