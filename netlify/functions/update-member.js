import { connectToDatabase } from './utils/mongodb.js';
import { ObjectId } from 'mongodb';
import { requireAuth } from './utils/auth.js';
import bcrypt from 'bcryptjs';

const handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const memberId = event.path.split('/').pop();
    const updateData = JSON.parse(event.body);
    const db = await connectToDatabase();

    // Remove admin-only fields for non-admin users
    if (event.user.role !== 'admin') {
      delete updateData.achievements;
      delete updateData.eventParticipation;
      delete updateData.points;
      delete updateData.role;
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove confirmPassword
    delete updateData.confirmPassword;

    const originalMember = await db.collection('members').findOne({ _id: new ObjectId(memberId) });
    if (!originalMember) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Member not found' })
      };
    }

    await db.collection('members').updateOne(
      { _id: new ObjectId(memberId) },
      { $set: updateData }
    );

    // Check for Profile Master achievement
    const wasEmailVerified = originalMember.emailVerified;
    const wasPhoneVerified = originalMember.phoneVerified;
    
    if (
      updateData.emailVerified && updateData.phoneVerified &&
      (!wasEmailVerified || !wasPhoneVerified)
    ) {
      const hasProfileMaster = await db.collection('achievements').findOne({
        member: new ObjectId(memberId),
        title: 'Profile Master'
      });

      if (!hasProfileMaster) {
        const profileMaster = {
          _id: new ObjectId(),
          title: 'Profile Master',
          description: 'Updated profile information',
          icon: '🎯',
          points: 20,
          member: new ObjectId(memberId),
          dateAwarded: new Date().toISOString()
        };

        await db.collection('achievements').insertOne(profileMaster);
        await db.collection('members').updateOne(
          { _id: new ObjectId(memberId) },
          { 
            $push: { achievements: profileMaster._id },
            $inc: { points: profileMaster.points }
          }
        );
      }
    }

    const updatedMember = await db.collection('members').findOne({ _id: new ObjectId(memberId) });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...updatedMember,
        id: updatedMember._id.toString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

export { handler }; 