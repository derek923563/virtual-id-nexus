import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '' }, // Added icon field
  points: { type: Number, default: 0 }, // Added points field
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  dateAwarded: { type: String },
}, { timestamps: true });

export default mongoose.model('Achievement', AchievementSchema); 