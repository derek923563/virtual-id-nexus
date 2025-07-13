import express from 'express';
import bcrypt from 'bcryptjs';
import Member from '../models/User.js';

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
    
    if (otp === '123456') {
      const user = await Member.findById(userId);
      if (!user) {
        console.log('User not found for ID:', userId);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Check if already verified
      if ((type === 'email' && user.emailVerified) || (type === 'phone' && user.phoneVerified)) {
        return res.status(400).json({ success: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} already verified` });
      }
      
      // Set verified flag and award points
      if (type === 'email') user.emailVerified = true;
      if (type === 'phone') user.phoneVerified = true;
      user.points += 10;
      await user.save();
      
      // Transform MongoDB document to include id field
      const userWithId = {
        ...user.toObject(),
        id: user._id.toString()
      };
      
      return res.json({ 
        success: true,
        message: `${type} verified successfully`, 
        pointsAwarded: 10,
        newTotalPoints: user.points,
        user: userWithId
      });
    } else {
      console.log('Invalid OTP provided:', otp);
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    // Password criteria
    if (newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password does not meet criteria.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    console.log('Password updated for user:', user.username, 'New hash:', user.password);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update theme preference
router.put('/theme-preference', async (req, res) => {
  try {
    const { userId, themePreference } = req.body;
    
    if (!userId || !themePreference) {
      return res.status(400).json({ message: 'User ID and theme preference are required' });
    }
    
    if (!['light', 'dark', 'system'].includes(themePreference)) {
      return res.status(400).json({ message: 'Invalid theme preference' });
    }
    
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.themePreference = themePreference;
    await user.save();
    
    // Transform MongoDB document to include id field
    const userWithId = {
      ...user.toObject(),
      id: user._id.toString()
    };
    
    res.json({ 
      message: 'Theme preference updated successfully',
      user: userWithId
    });
  } catch (err) {
    console.error('Theme preference update error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router; 