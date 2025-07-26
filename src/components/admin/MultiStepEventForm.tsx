import React, { useState, useEffect } from 'react';
import { Event } from '../../types/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Upload, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { saveEvent } from '../../utils/eventUtils';

interface MultiStepEventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MultiStepEventForm: React.FC<MultiStepEventFormProps> = ({
  event,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Details
    name: '',
    description: '',
    category: 'workshop' as Event['category'],
    points: 0,
    
    // Scheduling & Venue
    startDateTime: new Date(),
    endDateTime: new Date(),
    registrationDeadline: new Date(),
    venue: '',
    address: '',
    mapLink: '',
    eventType: 'offline' as Event['eventType'],
    
    // Registration Settings
    eligibility: {
      pointsRequired: 0,
    },
    
    // Fees & Review
    fees: {
      amount: 0,
      paymentLink: '',
      upiId: '',
    },
    isPaid: false,
    // Luma Integration
    lumaEventId: '',
    status: 'draft' as Event['status'],
  });

  const steps = [
    { title: 'Basic Details', description: 'Event name, description, category' },
    { title: 'Scheduling & Venue', description: 'Date, time, location details' },
    { title: 'Registration Settings', description: 'Eligibility, requirements' },
    { title: 'Luma Integration', description: 'Luma event ID (required)' },
    { title: 'Review & Publish', description: 'Final review and publication' },
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description,
        category: event.category,
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime),
        registrationDeadline: new Date(event.registrationDeadline),
        venue: event.venue,
        address: event.address,
        mapLink: event.mapLink || '',
        eventType: event.eventType,
        eligibility: event.eligibility,
        fees: event.fees,
        status: event.status,
        points: event.points || 0,
        isPaid: event.isPaid || false,
        lumaEventId: event.lumaEventId || '',
      });
    }
  }, [event]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.name.trim() !== '' && formData.description.trim() !== '' && formData.points > 0;
      case 1:
        if (formData.eventType === 'offline' || formData.eventType === 'hybrid') {
          if (formData.venue.trim() === '' || formData.address.trim() === '') return false;
        }
        // Date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (formData.startDateTime < today) return false;
        if (formData.endDateTime < formData.startDateTime) return false;
        // Registration deadline must be between today and start date (inclusive)
        if (
          formData.registrationDeadline < today ||
          formData.registrationDeadline > formData.startDateTime
        ) return false;
        return true;
      case 2:
        if (formData.eligibility.pointsRequired < 0) return false;
        if (formData.isPaid) {
          if (formData.fees.amount <= 0) return false;
          if (!formData.fees.paymentLink.trim()) return false;
          if (!formData.fees.upiId.trim()) return false;
        }
        return true;
      case 3:
        return !!formData.lumaEventId.trim();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (statusOverride?: 'draft' | 'current' | 'upcoming' | 'past') => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      let eventDataObj: Partial<Event> = {
        ...formData,
        startDateTime: formData.startDateTime.toISOString(),
        endDateTime: formData.endDateTime.toISOString(),
        registrationDeadline: formData.registrationDeadline.toISOString(),
        currentRegistrations: event?.currentRegistrations || 0,
        lumaEventId: formData.lumaEventId || undefined,
      };

      if (formData.eventType === 'online') {
        delete eventDataObj.venue;
        delete eventDataObj.address;
        if (eventDataObj.mapLink === '') delete eventDataObj.mapLink;
      } else {
        if (!eventDataObj.venue) delete eventDataObj.venue;
        if (!eventDataObj.address) delete eventDataObj.address;
      }
      // Remove any empty string fields
      Object.keys(eventDataObj).forEach(key => {
        if (eventDataObj[key as keyof Event] === '' || eventDataObj[key as keyof Event] === undefined) {
          delete eventDataObj[key as keyof Event];
        }
      });

      if (event) {
        eventDataObj.id = event.id;
        eventDataObj.createdAt = event.createdAt;
        eventDataObj.updatedAt = new Date().toISOString();
      } else {
        eventDataObj.createdAt = new Date().toISOString();
        eventDataObj.updatedAt = new Date().toISOString();
      }

      // Determine status
      let statusToSet: Event['status'] = formData.status;
      if (statusOverride === 'draft') {
        statusToSet = 'draft';
      } else if (!statusOverride || statusOverride === 'current' || statusOverride === 'upcoming' || statusOverride === 'past') {
        // Calculate based on dates
        const now = new Date();
        const start = new Date(formData.startDateTime);
        const end = new Date(formData.endDateTime);
        if (end < now) {
          statusToSet = 'past';
        } else if (start > now) {
          statusToSet = 'upcoming';
        } else if (start <= now && end >= now) {
          statusToSet = 'current';
        }
      }
      eventDataObj.status = statusToSet;

      // Save to backend
      await saveEvent(eventDataObj as Event);

      toast({
        title: event ? "Event updated successfully" : "Event created successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error saving event",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Event Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter event name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event"
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="points">Points <span className="text-red-500">*</span></Label>
              <Input
                id="points"
                type="number"
                min={1}
                value={formData.points}
                onChange={e => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                placeholder="Enter points to be allocated"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Event Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Event['category'] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minStartDate = today;
        const minEndDate = formData.startDateTime > today ? formData.startDateTime : today;
        const minRegDeadline = today;
        const maxRegDeadline = formData.startDateTime;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Date <span className="text-red-500">*</span></Label>
                <DatePicker
                  selected={formData.startDateTime}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, startDateTime: date }))}
                  placeholder="Pick start date"
                  minDate={minStartDate}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Date <span className="text-red-500">*</span></Label>
                <DatePicker
                  selected={formData.endDateTime}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, endDateTime: date }))}
                  placeholder="Pick end date"
                  minDate={minEndDate}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Registration Deadline <span className="text-red-500">*</span></Label>
              <DatePicker
                selected={formData.registrationDeadline}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                placeholder="Pick registration deadline"
                minDate={minRegDeadline}
                maxDate={maxRegDeadline}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value as Event['eventType'] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Show venue/address/map only for offline or hybrid */}
            {(formData.eventType === 'offline' || formData.eventType === 'hybrid') && (
              <>
            <div>
              <Label htmlFor="venue">Venue <span className="text-red-500">*</span></Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Enter venue name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="mapLink">Map Link (Optional)</Label>
              <Input
                id="mapLink"
                value={formData.mapLink}
                onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                placeholder="Google Maps link or similar"
                className="mt-1"
              />
            </div>
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="pointsRequired">Minimum Points Required to Register <span className="text-red-500">*</span></Label>
              <Input
                id="pointsRequired"
                type="number"
                min={0}
                value={formData.eligibility.pointsRequired}
                onChange={e => setFormData(prev => ({ ...prev, eligibility: { pointsRequired: parseInt(e.target.value) || 0 } }))}
                placeholder="Enter minimum points required"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Registration Fees</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Label className="text-xs text-muted-foreground">Free</Label>
                <Switch
                  checked={formData.isPaid}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, isPaid: checked }))}
                />
                <Label className="text-xs text-muted-foreground">Paid</Label>
              </div>
              {formData.isPaid && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.fees.amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      fees: { ...prev.fees, amount: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentLink" className="text-xs text-muted-foreground">Payment Link</Label>
                  <Input
                    id="paymentLink"
                    value={formData.fees.paymentLink}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      fees: { ...prev.fees, paymentLink: e.target.value }
                    }))}
                    placeholder="Payment gateway link"
                  />
                </div>
                <div>
                  <Label htmlFor="upiId" className="text-xs text-muted-foreground">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={formData.fees.upiId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      fees: { ...prev.fees, upiId: e.target.value }
                    }))}
                    placeholder="your-upi@provider"
                  />
                </div>
              </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label htmlFor="lumaEventId">Luma Event ID <span className="text-red-500">*</span></Label>
            <Input
              id="lumaEventId"
              type="text"
              placeholder="evt-XXXXXX"
              value={formData.lumaEventId}
              onChange={e => setFormData({ ...formData, lumaEventId: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">The Luma event link will be generated automatically.</p>
            {formData.lumaEventId && (
              <div className="text-xs text-green-500 mt-2">
                Luma Event Link: <span className="font-mono">https://lu.ma/event/{formData.lumaEventId}</span>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Event Name:</Label>
                  <p className="text-muted-foreground">{formData.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Description:</Label>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>
                <div>
                  <Label className="font-medium">Category:</Label>
                  <Badge variant="secondary" className="ml-2">{formData.category}</Badge>
                </div>
                <div>
                  <Label className="font-medium">Points:</Label>
                  <p className="text-muted-foreground">{formData.points}</p>
                </div>
                <div>
                  <Label className="font-medium">Date & Time:</Label>
                  <p className="text-muted-foreground">
                    {formData.startDateTime.toLocaleDateString()} - {formData.endDateTime.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Registration Deadline:</Label>
                  <p className="text-muted-foreground">{formData.registrationDeadline.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Event Type:</Label>
                  <p className="text-muted-foreground">{formData.eventType}</p>
                </div>
                {(formData.eventType === 'offline' || formData.eventType === 'hybrid') && (
                  <>
                    <div>
                      <Label className="font-medium">Venue:</Label>
                      <p className="text-muted-foreground">{formData.venue}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Address:</Label>
                      <p className="text-muted-foreground">{formData.address}</p>
                    </div>
                    {formData.mapLink && (
                      <div>
                        <Label className="font-medium">Map Link:</Label>
                        <a href={formData.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Map</a>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <Label className="font-medium">Minimum Points Required:</Label>
                  <p className="text-muted-foreground">{formData.eligibility.pointsRequired}</p>
                </div>
                <div>
                  <Label className="font-medium">Registration Fee:</Label>
                  <p className="text-muted-foreground">{formData.isPaid ? `₹${formData.fees.amount}` : 'Free'}</p>
                </div>
                {formData.isPaid && (
                  <>
                    <div>
                      <Label className="font-medium">Payment Link:</Label>
                      <p className="text-muted-foreground">{formData.fees.paymentLink}</p>
                    </div>
                    <div>
                      <Label className="font-medium">UPI ID:</Label>
                      <p className="text-muted-foreground">{formData.fees.upiId}</p>
                    </div>
                  </>
                )}
                <div>
                  <Label className="font-medium">Luma Event ID:</Label>
                  <p className="text-muted-foreground">{formData.lumaEventId}</p>
                </div>
                <div>
                  <Label className="font-medium">Luma Event Link:</Label>
                  <a href={`https://lu.ma/event/${formData.lumaEventId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://lu.ma/event/{formData.lumaEventId}</a>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{event ? 'Edit Event' : 'Create New Event'}</CardTitle>
          <Badge variant="outline">{steps[currentStep].title}</Badge>
        </div>
        <div className="space-y-2">
          <Progress value={(currentStep + 1) * 20} className="w-full" />
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-6">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-2">
              {currentStep === steps.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                  <Button variant="outline" onClick={() => handleSubmit('draft')}>Save as Draft</Button>
                  <Button onClick={() => handleSubmit()}>
                  <Save className="h-4 w-4 mr-2" />
                  {event ? 'Update Event' : 'Create Event'}
                </Button>
                </>
              ) : (
                <>
                  <Button onClick={onCancel} variant="ghost">Cancel</Button>
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};