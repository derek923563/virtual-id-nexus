import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, required: true, minlength: 20, maxlength: 1000 },
});

export default mongoose.model('Feedback', FeedbackSchema); 