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

interface MultiStepEventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options: string[];
  required: boolean;
}

interface Organizer {
  name: string;
  phone: string;
  email: string;
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
    
    // Scheduling & Venue
    startDateTime: new Date(),
    endDateTime: new Date(),
    registrationDeadline: new Date(),
    venue: '',
    address: '',
    mapLink: '',
    eventType: 'offline' as Event['eventType'],
    
    // Registration Settings
    maxRegistrations: 50,
    eligibility: {
      ageGroup: '',
      year: '',
      department: '',
      other: '',
    },
    
    // Uploads & Contacts
    posterUrl: '',
    bannerUrl: '',
    organizers: [] as Organizer[],
    customQuestions: [] as CustomQuestion[],
    
    // Fees & Review
    fees: {
      amount: 0,
      paymentLink: '',
      upiId: '',
    },
    status: 'draft' as Event['status'],
  });

  const steps = [
    { title: 'Basic Details', description: 'Event name, description, category' },
    { title: 'Scheduling & Venue', description: 'Date, time, location details' },
    { title: 'Registration Settings', description: 'Limits, eligibility, requirements' },
    { title: 'Uploads & Contacts', description: 'Media, organizers, custom questions' },
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
        maxRegistrations: event.maxRegistrations,
        eligibility: event.eligibility,
        posterUrl: event.posterUrl || '',
        bannerUrl: event.bannerUrl || '',
        organizers: event.organizers,
        customQuestions: event.customQuestions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options || [],
          required: q.required,
        })),
        fees: event.fees,
        status: event.status,
      });
    }
  }, [event]);

  const addOrganizer = () => {
    setFormData(prev => ({
      ...prev,
      organizers: [...prev.organizers, { name: '', phone: '', email: '' }],
    }));
  };

  const removeOrganizer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      organizers: prev.organizers.filter((_, i) => i !== index),
    }));
  };

  const updateOrganizer = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      organizers: prev.organizers.map((org, i) => 
        i === index ? { ...org, [field]: value } : org
      ),
    }));
  };

  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: uuidv4(),
      question: '',
      type: 'text',
      options: [],
      required: false,
    };
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, newQuestion],
    }));
  };

  const removeCustomQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter(q => q.id !== id),
    }));
  };

  const updateCustomQuestion = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      ),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 1:
        return formData.venue.trim() !== '' && formData.address.trim() !== '';
      case 2:
        return formData.maxRegistrations > 0;
      case 3:
        return formData.organizers.length > 0 && 
               formData.organizers.every(org => org.name && org.email && org.phone);
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventData: Partial<Event> = {
        ...formData,
        startDateTime: formData.startDateTime.toISOString(),
        endDateTime: formData.endDateTime.toISOString(),
        registrationDeadline: formData.registrationDeadline.toISOString(),
        currentRegistrations: event?.currentRegistrations || 0,
        points: 0, // Can be added later if needed
      };

      if (event) {
        eventData.id = event.id;
        eventData.createdAt = event.createdAt;
        eventData.updatedAt = new Date().toISOString();
      } else {
        eventData.id = uuidv4();
        eventData.createdAt = new Date().toISOString();
        eventData.updatedAt = new Date().toISOString();
      }

      // Save to localStorage for now (replace with API call)
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      if (event) {
        const index = events.findIndex((e: Event) => e.id === event.id);
        if (index !== -1) {
          events[index] = eventData;
        }
      } else {
        events.push(eventData);
      }
      localStorage.setItem('events', JSON.stringify(events));

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
              <Label htmlFor="name" className="text-sm font-medium">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter event name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
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
              <Label htmlFor="category" className="text-sm font-medium">Event Category</Label>
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
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Date & Time *</Label>
                <DatePicker
                  selected={formData.startDateTime}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, startDateTime: date }))}
                  placeholder="Pick start date"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Date & Time *</Label>
                <DatePicker
                  selected={formData.endDateTime}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, endDateTime: date }))}
                  placeholder="Pick end date"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Registration Deadline *</Label>
              <DatePicker
                selected={formData.registrationDeadline}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                placeholder="Pick registration deadline"
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
            
            <div>
              <Label htmlFor="venue" className="text-sm font-medium">Venue *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Enter venue name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
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
              <Label htmlFor="mapLink" className="text-sm font-medium">Map Link (Optional)</Label>
              <Input
                id="mapLink"
                value={formData.mapLink}
                onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                placeholder="Google Maps link or similar"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="maxRegistrations" className="text-sm font-medium">Maximum Registrations *</Label>
              <Input
                id="maxRegistrations"
                type="number"
                value={formData.maxRegistrations}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRegistrations: parseInt(e.target.value) || 0 }))}
                placeholder="Enter maximum number of participants"
                className="mt-1"
                min="1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Eligibility Criteria</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="ageGroup" className="text-xs text-muted-foreground">Age Group</Label>
                  <Input
                    id="ageGroup"
                    value={formData.eligibility.ageGroup}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      eligibility: { ...prev.eligibility, ageGroup: e.target.value }
                    }))}
                    placeholder="e.g., 18-25"
                  />
                </div>
                <div>
                  <Label htmlFor="year" className="text-xs text-muted-foreground">Academic Year</Label>
                  <Input
                    id="year"
                    value={formData.eligibility.year}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      eligibility: { ...prev.eligibility, year: e.target.value }
                    }))}
                    placeholder="e.g., 2nd Year, Final Year"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="department" className="text-xs text-muted-foreground">Department</Label>
                  <Input
                    id="department"
                    value={formData.eligibility.department}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      eligibility: { ...prev.eligibility, department: e.target.value }
                    }))}
                    placeholder="e.g., Computer Science, Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="other" className="text-xs text-muted-foreground">Other Requirements</Label>
                  <Input
                    id="other"
                    value={formData.eligibility.other}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      eligibility: { ...prev.eligibility, other: e.target.value }
                    }))}
                    placeholder="Any other criteria"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Registration Fees</Label>
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Event Posters & Banners</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="posterUrl" className="text-xs text-muted-foreground">Poster URL</Label>
                  <Input
                    id="posterUrl"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, posterUrl: e.target.value }))}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="bannerUrl" className="text-xs text-muted-foreground">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Organizers *</Label>
                <Button onClick={addOrganizer} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Organizer
                </Button>
              </div>
              <div className="space-y-4 mt-2">
                {formData.organizers.map((organizer, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="text-sm font-medium">Organizer {index + 1}</Label>
                      <Button 
                        onClick={() => removeOrganizer(index)} 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        value={organizer.name}
                        onChange={(e) => updateOrganizer(index, 'name', e.target.value)}
                        placeholder="Full Name"
                      />
                      <Input
                        value={organizer.email}
                        onChange={(e) => updateOrganizer(index, 'email', e.target.value)}
                        placeholder="Email"
                        type="email"
                      />
                      <Input
                        value={organizer.phone}
                        onChange={(e) => updateOrganizer(index, 'phone', e.target.value)}
                        placeholder="Phone Number"
                        type="tel"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Registration Questions</Label>
                <Button onClick={addCustomQuestion} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>
              <div className="space-y-4 mt-2">
                {formData.customQuestions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="text-sm font-medium">Custom Question</Label>
                      <Button 
                        onClick={() => removeCustomQuestion(question.id)} 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        value={question.question}
                        onChange={(e) => updateCustomQuestion(question.id, 'question', e.target.value)}
                        placeholder="Enter your question"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateCustomQuestion(question.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={question.required}
                            onCheckedChange={(checked) => updateCustomQuestion(question.id, 'required', checked)}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
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
                  <Label className="font-medium">Category:</Label>
                  <Badge variant="secondary" className="ml-2">{formData.category}</Badge>
                </div>
                <div>
                  <Label className="font-medium">Date & Time:</Label>
                  <p className="text-muted-foreground">
                    {formData.startDateTime.toLocaleDateString()} - {formData.endDateTime.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Venue:</Label>
                  <p className="text-muted-foreground">{formData.venue} ({formData.eventType})</p>
                </div>
                <div>
                  <Label className="font-medium">Max Registrations:</Label>
                  <p className="text-muted-foreground">{formData.maxRegistrations}</p>
                </div>
                <div>
                  <Label className="font-medium">Registration Fee:</Label>
                  <p className="text-muted-foreground">₹{formData.fees.amount}</p>
                </div>
                <div>
                  <Label className="font-medium">Organizers:</Label>
                  <p className="text-muted-foreground">{formData.organizers.length} organizer(s)</p>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label className="text-sm font-medium">Publication Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Event['status'] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Event</SelectItem>
                  <SelectItem value="closed">Close Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Button onClick={onCancel} variant="ghost">
                Cancel
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  {event ? 'Update Event' : 'Create Event'}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};