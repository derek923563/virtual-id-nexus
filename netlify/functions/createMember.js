import { connectToDatabase } from './utils/mongodb.js';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const db = await connectToDatabase();
    const data = JSON.parse(event.body);

    const result = await db.collection('members').insertOne({
      ...data,
      createdAt: new Date(),
    });

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Member created successfully',
        memberId: result.insertedId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create member' }),
    };
  }
}; 