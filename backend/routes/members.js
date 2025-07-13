import express from 'express';
import bcrypt from 'bcryptjs';
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
  try {
    const memberData = { ...req.body };
    
    // Hash password if provided
    if (memberData.password) {
      memberData.password = await bcrypt.hash(memberData.password, 10);
    }
    
    // Remove confirmPassword from being saved
    delete memberData.confirmPassword;
    
    const member = new Member(memberData);
    await member.save();
    
    // Transform MongoDB document to include id field
    const memberWithId = {
      ...member.toObject(),
      id: member._id.toString()
    };
    res.status(201).json(memberWithId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Remove confirmPassword from being saved
    delete updateData.confirmPassword;
    
    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) return res.status(404).json({ message: 'Not found' });
    
    // Transform MongoDB document to include id field
    const memberWithId = {
      ...member.toObject(),
      id: member._id.toString()
    };
    res.json(memberWithId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router; 