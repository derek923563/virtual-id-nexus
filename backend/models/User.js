import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  eventParticipation: {
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    missedEvents: { type: Number, default: 0 },
    lastActivity: { type: String },
  },
  points: { type: Number, default: 0 },
  publicId: { type: String, unique: true }, // For public sharing of VID
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
}, { timestamps: true, collection: 'members' });

// Pre-save hook to hash password if not already hashed
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model('Member', UserSchema); 