import { connectToDatabase } from './utils/mongodb.js';

export const handler = async (event, context) => {
  try {
    const db = await connectToDatabase();
    const members = await db.collection('members').find({}).toArray();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(members),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch members' }),
    };
  }
}; 