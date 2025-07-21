import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, default: 0 },
  
  // Date and Time
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  
  // Venue and Location
  venue: { type: String, required: true },
  address: { type: String, required: true },
  mapLink: { type: String },
  eventType: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
  
  // Event Category
  category: { 
    type: String, 
    enum: ['workshop', 'seminar', 'hackathon', 'conference', 'meetup', 'other'], 
    required: true 
  },
  
  // Registration
  maxRegistrations: { type: Number, required: true },
  currentRegistrations: { type: Number, default: 0 },
  
  // Eligibility
  eligibility: {
    ageGroup: { type: String },
    year: { type: String },
    department: { type: String },
    other: { type: String }
  },
  
  // Media
  posterUrl: { type: String },
  bannerUrl: { type: String },
  
  // Contact
  organizers: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  }],
  
  // Custom Questions
  customQuestions: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'select', 'checkbox'], required: true },
    options: [{ type: String }],
    required: { type: Boolean, default: false }
  }],
  
  // Fees
  fees: {
    amount: { type: Number, default: 0 },
    paymentLink: { type: String },
    upiId: { type: String }
  },
  
  // Status
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  
  // Legacy participants field (keep for backward compatibility)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

export default mongoose.model('Event', EventSchema); 