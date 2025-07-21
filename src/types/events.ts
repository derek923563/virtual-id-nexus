
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
  maxRegistrations: number;
  currentRegistrations: number;
  
  // Eligibility
  eligibility: {
    ageGroup: string;
    year: string;
    department: string;
    other: string;
  };
  
  // Media
  posterUrl?: string;
  bannerUrl?: string;
  
  // Contact
  organizers: {
    name: string;
    phone: string;
    email: string;
  }[];
  
  // Custom Questions
  customQuestions: {
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
  }[];
  
  // Fees
  fees: {
    amount: number;
    paymentLink: string;
    upiId: string;
  };
  
  // Status
  status: 'draft' | 'published' | 'closed';
  
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
