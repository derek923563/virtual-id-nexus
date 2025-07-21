import express from 'express';
import bcrypt from 'bcryptjs';
import Member from '../models/User.js';
import Achievement from '../models/Achievement.js';

const router = express.Router();

console.log('--- Members route loaded ---');
console.log('Achievement model:', Achievement);

// Get all members
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (username) {
      // If username is provided, find specific member
      const member = await Member.findOne({ username }).populate('achievements');
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
      const members = await Member.find().populate('achievements');
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
  const member = await Member.findById(req.params.id).populate('achievements');
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
  console.log('--- Registration route HIT ---');
  try {
    const memberData = { ...req.body };
    console.log('Received memberData:', memberData);
    // Remove admin-only fields for admins
    if (memberData.role === 'admin') {
      delete memberData.achievements;
      delete memberData.eventParticipation;
      delete memberData.points;
    }
    // Hash password if provided
    if (memberData.password) {
      memberData.password = await bcrypt.hash(memberData.password, 10);
      console.log('Password hashed');
    }
    // Remove confirmPassword from being saved
    delete memberData.confirmPassword;
    const member = new Member(memberData);
    await member.save();
    console.log('Member saved:', member._id);
    // Do NOT create any achievements here!
    // Transform MongoDB document to include id field
    const memberWithId = {
      ...member.toObject(),
      id: member._id.toString()
    };
    console.log('Sending response for member:', memberWithId.id);
    res.status(201).json(memberWithId);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Remove admin-only fields for admins
    if (updateData.role === 'admin') {
      delete updateData.achievements;
      delete updateData.eventParticipation;
      delete updateData.points;
    }
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    // Remove confirmPassword from being saved
    delete updateData.confirmPassword;
    // Fetch the original member before update
    const originalMember = await Member.findById(req.params.id);
    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) return res.status(404).json({ message: 'Not found' });
    // Only award Profile Master if both are verified and at least one was just verified
    const wasEmailVerified = originalMember?.emailVerified;
    const wasPhoneVerified = originalMember?.phoneVerified;
    if (
      member.emailVerified && member.phoneVerified &&
      (!wasEmailVerified || !wasPhoneVerified)
    ) {
      const hasProfileMaster = await Achievement.findOne({
        member: member._id,
        title: 'Profile Master',
      });
      if (!hasProfileMaster) {
        const profileMaster = await Achievement.create({
          title: 'Profile Master',
          description: 'Updated profile information',
          member: member._id,
          dateAwarded: new Date().toISOString(),
        });
        member.achievements = member.achievements || [];
        member.achievements.push(profileMaster._id);
        await member.save();
      }
    }
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