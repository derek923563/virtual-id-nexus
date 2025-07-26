import { connectToDatabase } from './utils/mongodb.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const db = await connectToDatabase();
    const { username, password, email, firstName, lastName, countryCode, phoneNumber, address, ...rest } = JSON.parse(event.body);

    // Validate required fields
    if (!username || !password || !email || !firstName || !lastName || !countryCode || !phoneNumber || !address) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'All required fields must be provided' })
      };
    }

    // Check existing username
    const existingUsername = await db.collection('members').findOne({ username });
    if (existingUsername) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username already in use', field: 'username' })
      };
    }

    // Check existing email
    const existingEmail = await db.collection('members').findOne({ email });
    if (existingEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email already in use', field: 'email' })
      };
    }

    // Check existing phone
    const existingPhone = await db.collection('members').findOne({ countryCode, phoneNumber });
    if (existingPhone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Phone number already in use', field: 'phoneNumber' })
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = new ObjectId();

    // Create welcome achievement
    const welcomeAchievement = {
      _id: new ObjectId(),
      title: 'Welcome',
      description: 'Joined the community',
      icon: '👋',
      points: 50,
      member: userId,
      dateAwarded: new Date().toISOString()
    };

    await db.collection('achievements').insertOne(welcomeAchievement);

    const user = {
      _id: userId,
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      address,
      role: 'user',
      uniqueId: `M-${Date.now()}`,
      joinDate: new Date().toISOString(),
      eventParticipation: {
        registeredEvents: [],
        missedEvents: 0,
        lastActivity: new Date().toISOString()
      },
      points: 80,
      achievements: [welcomeAchievement._id],
      ...Object.fromEntries(
        Object.entries(rest).filter(([key]) => key !== 'confirmPassword')
      )
    };

    await db.collection('members').insertOne(user);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Registration successful',
        userId: user._id.toString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 