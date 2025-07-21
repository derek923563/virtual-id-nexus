import express from 'express';
import bcrypt from 'bcryptjs';
import Member from '../models/User.js';
import Achievement from '../models/Achievement.js';
import achievements from '../../shared/achievements.js';
import Feedback from '../models/Feedback.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register (for users)
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', { 
      username: req.body.username, 
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    const { username, password, email, firstName, lastName, countryCode, phoneNumber, address, ...rest } = req.body;
    
    // Validate required fields
    if (!username || !password || !email || !firstName || !lastName || !countryCode || !phoneNumber || !address) {
      console.log('Missing required fields:', { username, email, firstName, lastName, countryCode, phoneNumber, address });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check for existing username
    const existingUsername = await Member.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already in use', field: 'username' });
    }

    // Check for existing email
    const existingEmail = await Member.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use', field: 'email' });
    }

    // Check for existing phone number with country code
    const existingPhone = await Member.findOne({ countryCode, phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already in use', field: 'phoneNumber' });
    }

    // Remove admin-only fields for admins
    if (req.body.role === 'admin') {
      delete req.body.achievements;
      delete req.body.eventParticipation;
      delete req.body.points;
    }

    // Create new user
    const user = new Member({
      username,
      password: await bcrypt.hash(password, 10),
      email,
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      address,
      role: 'user',
      uniqueId: req.body.uniqueId || `M-${Date.now()}`,
      joinDate: new Date().toISOString(),
      eventParticipation: {
        registeredEvents: [],
        missedEvents: 0,
        lastActivity: new Date().toISOString()
      },
      points: 80, // Initial points: 50 (registration) + 30 (profile completion)
      // Remove confirmPassword from being saved
      ...Object.fromEntries(
        Object.entries(req.body).filter(([key]) => key !== 'confirmPassword')
      )
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', { id: user._id, username: user.username });

    // Only assign the Welcome achievement on registration
    let welcomeAchievement;
    try {
      const welcomeDef = achievements.find(a => a.title === 'Welcome');
      welcomeAchievement = await Achievement.create({
        title: welcomeDef.title,
        description: welcomeDef.description,
        icon: welcomeDef.icon,
        points: welcomeDef.points,
        member: user._id,
        dateAwarded: new Date().toISOString(),
      });
    } catch (achErr) {
      console.error('Error creating Welcome achievement:', achErr);
    }
    user.achievements = welcomeAchievement ? [welcomeAchievement._id] : [];
    await user.save();
    console.log('User updated with achievements:', user.achievements);

    res.status(201).json({ message: 'Registration successful', userId: user._id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Login (admin or user)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Member.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    console.log('Login successful for user:', {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    // Transform MongoDB document to include id field
    const userWithId = {
      ...user.toObject(),
      id: user._id.toString()
    };
    res.json({ success: true, role: user.role, user: userWithId });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { excludeUserId } = req.query;
    
    let query = { username };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const existingUser = await Member.findOne(query);
    res.json({ available: !existingUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    // In a real app, you would send an actual email with OTP
    // For demo purposes, we'll just return success
    console.log('Sending email OTP to:', email);
    res.json({ message: 'OTP sent successfully', otp: '123456' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send phone OTP
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { countryCode, phoneNumber } = req.body;
    // In a real app, you would send an actual SMS with OTP
    // For demo purposes, we'll just return success
    console.log('Sending phone OTP to:', countryCode, phoneNumber);
    res.json({ message: 'OTP sent successfully', otp: '123456' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP and award points
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, type, otp } = req.body;
    console.log('OTP verification request:', { userId, type, otp });
    
    if (otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

      const user = await Member.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
    let pointsAwarded = 0;
    if (type === 'email') {
      if (user.emailVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified' });
      }
      user.emailVerified = true;
      pointsAwarded = 10;
      user.points = (user.points || 0) + pointsAwarded;
    } else if (type === 'phone') {
      if (user.phoneVerified) {
        return res.status(400).json({ success: false, message: 'Phone already verified' });
      }
      user.phoneVerified = true;
      pointsAwarded = 10;
      user.points = (user.points || 0) + pointsAwarded;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid verification type' });
    }

      await user.save();
      
    // Award Profile Master achievement if both verifications are true and not already awarded
    if (user.emailVerified && user.phoneVerified) {
      const hasProfileMaster = await Achievement.findOne({
        member: user._id,
        title: 'Profile Master',
      });
      if (!hasProfileMaster) {
        const profileMasterDef = achievements.find(a => a.title === 'Profile Master');
        const profileMaster = await Achievement.create({
          title: profileMasterDef.title,
          description: profileMasterDef.description,
          icon: profileMasterDef.icon,
          points: profileMasterDef.points,
          member: user._id,
          dateAwarded: new Date().toISOString(),
        });
        user.achievements = user.achievements || [];
        user.achievements.push(profileMaster._id);
        await user.save();
      }
    }

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`,
      user,
      pointsAwarded
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update theme preference
router.put('/theme-preference', async (req, res) => {
  try {
    const { userId, themePreference } = req.body;
    if (!userId || !themePreference) {
      return res.status(400).json({ message: 'userId and themePreference are required.' });
    }
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.themePreference = themePreference;
    await user.save();
    res.json({ success: true, message: 'Theme preference updated.', themePreference });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'userId, currentPassword, and newPassword are required.' });
    }
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { firstName, lastName, userId, feedback } = req.body;
    if (!firstName || !lastName || !userId || !feedback) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (feedback.length < 20 || feedback.length > 1000) {
      return res.status(400).json({ message: 'Feedback must be between 20 and 1000 characters.' });
    }
    const uniqueId = uuidv4();
    const newFeedback = new Feedback({
      uniqueId,
      firstName,
      lastName,
      userId,
      feedback,
      timestamp: new Date()
    });
    await newFeedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 