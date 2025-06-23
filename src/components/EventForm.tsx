
import React, { useState, useEffect } from 'react';
import { Event } from '../types/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description,
        points: event.points
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.points <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields with valid values.",
        variant: "destructive"
      });
      return;
    }

    const eventData: Event = {
      id: event?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      points: formData.points,
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const existingIndex = events.findIndex((e: Event) => e.id === eventData.id);
    
    if (existingIndex !== -1) {
      events[existingIndex] = eventData;
    } else {
      events.push(eventData);
    }
    
    localStorage.setItem('events', JSON.stringify(events));

    toast({
      title: event ? "Event Updated" : "Event Created",
      description: `Event "${eventData.name}" has been ${event ? 'updated' : 'created'} successfully.`,
    });

    onSuccess();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{event ? 'Edit Event' : 'Create New Event'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter event name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Points for Participants</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              placeholder="Enter points to allocate"
              required
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
