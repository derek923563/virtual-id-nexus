import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  experience: { type: String },
  dateOfBirth: { type: String },
  address: { type: String },
  joinDate: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  password: { type: String, required: true },
  eventParticipation: {
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    missedEvents: { type: Number, default: 0 },
    lastActivity: { type: String },
  },
  points: { type: Number, default: 0 },
  publicId: { type: String, unique: true }, // For public sharing of VID
}, { timestamps: true });

export default mongoose.model('Member', MemberSchema); 