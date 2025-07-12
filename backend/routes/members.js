import express from 'express';
import Member from '../models/User.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (username) {
      // If username is provided, find specific member
      const member = await Member.findOne({ username });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      // Transform MongoDB document to include id field
      const memberWithId = {
        ...member.toObject(),
        id: member._id.toString()
      };
      res.json([memberWithId]); // Return as array to match frontend expectation
    } else {
      // Return all members
      const members = await Member.find();
      // Transform MongoDB documents to include id field
      const membersWithId = members.map(member => ({
        ...member.toObject(),
        id: member._id.toString()
      }));
      res.json(membersWithId);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Not found' });
  // Transform MongoDB document to include id field
  const memberWithId = {
    ...member.toObject(),
    id: member._id.toString()
  };
  res.json(memberWithId);
});

// Create member
router.post('/', async (req, res) => {
  const member = new Member(req.body);
  await member.save();
  // Transform MongoDB document to include id field
  const memberWithId = {
    ...member.toObject(),
    id: member._id.toString()
  };
  res.status(201).json(memberWithId);
});

// Update member
router.put('/:id', async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!member) return res.status(404).json({ message: 'Not found' });
  // Transform MongoDB document to include id field
  const memberWithId = {
    ...member.toObject(),
    id: member._id.toString()
  };
  res.json(memberWithId);
});

// Delete member
router.delete('/:id', async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router; 