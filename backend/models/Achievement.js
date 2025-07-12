import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  dateAwarded: { type: String },
}, { timestamps: true });

export default mongoose.model('Achievement', AchievementSchema); 