import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  countryCode: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  experience: { type: String },
  dateOfBirth: { type: String },
  address: { type: String, required: true },
  joinDate: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  password: { type: String, required: true },
  confirmPassword: { type: String },
  role: { type: String, default: 'user' },
  eventParticipation: {
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    missedEvents: { type: Number, default: 0 },
    lastActivity: { type: String },
  },
  points: { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
}, { timestamps: true, collection: 'members' });

export default mongoose.model('Member', UserSchema); 