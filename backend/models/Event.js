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
  venue: { type: String, required: function() { return this.eventType === 'offline' || this.eventType === 'hybrid'; } },
  address: { type: String, required: function() { return this.eventType === 'offline' || this.eventType === 'hybrid'; } },
  mapLink: { type: String },
  eventType: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
  
  // Event Category
  category: { 
    type: String, 
    enum: ['workshop', 'seminar', 'hackathon', 'conference', 'meetup', 'other'], 
    required: true 
  },
  
  // Registration
  currentRegistrations: { type: Number, default: 0 },
  
  // Eligibility
  eligibility: {
    pointsRequired: { type: Number, default: 0 },
  },
  
  // Fees
  fees: {
    amount: { type: Number, default: 0 },
    paymentLink: { type: String },
    upiId: { type: String }
  },
  
  // Status
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  isPaid: { type: Boolean },

  // Luma Integration
  lumaEventId: { type: String, required: true },
  lumaEventLink: { type: String },
  // Legacy participants field (keep for backward compatibility)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

export default mongoose.model('Event', EventSchema); 