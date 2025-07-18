import express from 'express';
import Achievement from '../models/Achievement.js';

const router = express.Router();

// Get all achievements
router.get('/', async (req, res) => {
  const achievements = await Achievement.find();
  res.json(achievements);
});

// Get achievement by ID
router.get('/:id', async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);
  if (!achievement) return res.status(404).json({ message: 'Not found' });
  res.json(achievement);
});

// Create achievement
router.post('/', async (req, res) => {
  try {
    const { member, title, description, dateAwarded } = req.body;
    if (!member) {
      return res.status(400).json({ message: 'Member ID is required.' });
    }
    // Import Member model
    const Member = (await import('../models/User.js')).default;
    const memberDoc = await Member.findById(member);
    if (!memberDoc) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    // Create and save achievement
    const achievement = new Achievement({ member, title, description, dateAwarded });
    await achievement.save();
    // Add achievement to member's achievements array
    memberDoc.achievements = memberDoc.achievements || [];
    memberDoc.achievements.push(achievement._id);
    await memberDoc.save();
    res.status(201).json(achievement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update achievement
router.put('/:id', async (req, res) => {
  const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!achievement) return res.status(404).json({ message: 'Not found' });
  res.json(achievement);
});

// Delete achievement
router.delete('/:id', async (req, res) => {
  await Achievement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router; 