import { connectToDatabase } from './utils/mongodb.js';
import bcrypt from 'bcryptjs';
import { generateToken } from './utils/auth.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    const db = await connectToDatabase();
    
    const user = await db.collection('members').findOne({ username });
    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    const token = generateToken(user);
    const userWithId = {
      ...user,
      id: user._id.toString(),
      password: undefined
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        role: user.role,
        user: userWithId,
        token
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 