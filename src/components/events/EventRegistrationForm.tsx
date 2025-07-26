import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event, EventRegistration } from '../../types/events';
import { getEventById, saveEvent } from '../../utils/eventUtils';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Upload, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const EventRegistrationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    year: '',
    branch: '',
    profileImage: '',
    customAnswers: {} as Record<string, string | string[]>,
    agreeToTerms: false,
    paymentConfirmation: '',
  });

  const steps = [
    { title: 'Personal Details', description: 'Basic information' },
    { title: 'Custom Questions', description: 'Event-specific questions' },
    { title: 'Payment & Confirmation', description: 'Complete registration' },
  ];

  useEffect(() => {
    if (id) {
      (async () => {
        const eventData = await getEventById(id);
      setEvent(eventData);
      setLoading(false);
      // Pre-fill user data if available
      if (user) {
        setFormData(prev => ({
          ...prev,
            email: user.email || user.user?.email || '',
            fullName: user.username || user.user?.username || '',
        }));
      }
      })();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">The event you're trying to register for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  const canRegister = (): boolean => {
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    // Points eligibility check
    if (user && event.eligibility && typeof event.eligibility.pointsRequired === 'number') {
      const userPoints = user.user?.points ?? 0;
      if (userPoints < event.eligibility.pointsRequired) {
        return false;
      }
    }
    // Only allow registration for current or upcoming events
    return now <= registrationDeadline && (event.status === 'current' || event.status === 'upcoming');
  };

  if (!canRegister()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
          <p className="text-muted-foreground mb-4">
            Registration for this event is no longer available.
          </p>
          <Button onClick={() => navigate(`/events/${event.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event Details
          </Button>
        </Card>
      </div>
    );
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.fullName.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.phone.trim() !== '' &&
               formData.institution.trim() !== '';
      case 1:
        // No custom questions, always valid
        return true;
      case 2:
        // Payment confirmation is now optional, but must check 'I have paid' if paid event
        if (event.fees.amount > 0) {
          return formData.agreeToTerms && formData.paymentConfirmation.trim() !== '';
        }
        return formData.agreeToTerms;
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

  const handleCustomAnswerChange = (questionId: string, answer: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: answer,
      },
    }));
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
      const registration: EventRegistration = {
        id: uuidv4(),
        eventId: event.id,
        userId: user?.id || user?.username || 'anonymous',
        userDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          year: formData.year,
          branch: formData.branch,
          profileImage: formData.profileImage,
        },
        customAnswers: [], // No custom questions
        paymentStatus: event.fees.amount > 0 ? 'pending' : undefined,
        registeredAt: new Date().toISOString(),
      };

      // TODO: Replace with API call to register for event
      await saveEvent({ ...event, currentRegistrations: (event.currentRegistrations || 0) + 1 });
      // Optionally, call a registration API endpoint here

      toast({
        title: "Registration successful!",
        description: "You have been registered for the event.",
      });

      navigate(`/events/${event.id}?registered=true`);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="institution" className="text-sm font-medium">Institution/Organization *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Enter your institution"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className="text-sm font-medium">Academic Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2nd Year, Final Year"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="branch" className="text-sm font-medium">Branch/Department</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="e.g., Computer Science"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="profileImage" className="text-sm font-medium">Profile Image URL (Optional)</Label>
              <Input
                id="profileImage"
                value={formData.profileImage}
                onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                placeholder="https://example.com/profile.jpg"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 1:
        // No custom questions
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No additional questions for this event.</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Payment Section */}
            {event.fees.amount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-lg font-medium">
                    <span>Registration Fee:</span>
                    <span>₹{event.fees.amount}</span>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {event.fees.paymentLink && (
                      <Button asChild className="w-full">
                        <a href={event.fees.paymentLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Pay Online
                        </a>
                      </Button>
                    )}
                    {event.fees.upiId && (
                      <div>
                        <Label className="text-sm font-medium">UPI Payment</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="font-mono text-sm">{event.fees.upiId}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="paymentConfirmation" className="text-sm font-medium">
                        Payment Confirmation/Transaction ID
                      </Label>
                      <Input
                        id="paymentConfirmation"
                        value={formData.paymentConfirmation}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentConfirmation: e.target.value }))}
                        placeholder="Enter transaction ID or confirmation number (optional)"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                I agree to the terms and conditions and confirm that all the information provided is accurate. 
                I understand that providing false information may result in cancellation of my registration.
              </Label>
            </div>
            {/* Registration Summary */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Registration Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participant:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {event.fees.amount > 0 && (
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-medium">₹{event.fees.amount}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(`/events/${event.id}`)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Event Details
      </Button>

      {/* Event Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Register for {event.name}</span>
            <Badge variant="secondary">{event.category}</Badge>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={(currentStep + 1) * 33.33} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
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
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit}>
                <Check className="h-4 w-4 mr-2" />
                Complete Registration
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};