
export interface Event {
  id: string;
  name: string;
  description: string;
  points?: number;
  
  // Date and Time
  startDateTime: string;
  endDateTime: string;
  registrationDeadline: string;
  
  // Venue and Location
  venue: string;
  address: string;
  mapLink?: string;
  eventType: 'online' | 'offline' | 'hybrid';
  
  // Event Category
  category: 'workshop' | 'seminar' | 'hackathon' | 'conference' | 'meetup' | 'other';
  
  // Registration
  currentRegistrations: number;
  
  // Eligibility
  eligibility: {
    pointsRequired: number;
  };
  
  // Fees
  fees: {
    amount: number;
    paymentLink: string;
    upiId: string;
  };
  
  // Status
  /**
   * Only 'draft' or 'published' should be used, but allow string for legacy data.
   * TODO: Migrate all events in DB to use only 'draft' or 'published'.
   */
  status: 'draft' | 'published' | string;
  isPaid?: boolean;

  // Luma Integration
  lumaEventLink?: string;
  lumaEventId: string; // required
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    year?: string;
    branch?: string;
    profileImage?: string;
  };
  customAnswers: {
    questionId: string;
    answer: string | string[];
  }[];
  paymentStatus?: 'pending' | 'completed' | 'failed';
  registeredAt: string;
}
