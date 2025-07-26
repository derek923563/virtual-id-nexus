import { connectToDatabase } from './utils/mongodb.js';
import { ObjectId } from 'mongodb';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const { userId, type, otp } = JSON.parse(event.body);
    
    // Demo OTP validation
    if (otp !== '123456') {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Invalid OTP' })
      };
    }

    const db = await connectToDatabase();
    const user = await db.collection('members').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'User not found' })
      };
    }

    let pointsAwarded = 0;
    const update = {};

    if (type === 'email') {
      if (user.emailVerified) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Email already verified' })
        };
      }
      update.emailVerified = true;
      pointsAwarded = 10;
    } else if (type === 'phone') {
      if (user.phoneVerified) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Phone already verified' })
        };
      }
      update.phoneVerified = true;
      pointsAwarded = 10;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Invalid verification type' })
      };
    }

    update.points = (user.points || 0) + pointsAwarded;

    // Update user
    await db.collection('members').updateOne(
      { _id: user._id },
      { $set: update }
    );

    // Check and award Profile Master achievement
    if ((type === 'email' && user.phoneVerified) || (type === 'phone' && user.emailVerified)) {
      const hasProfileMaster = await db.collection('achievements').findOne({
        member: user._id,
        title: 'Profile Master'
      });

      if (!hasProfileMaster) {
        const profileMaster = {
          _id: new ObjectId(),
          title: 'Profile Master',
          description: 'Verified both email and phone',
          icon: '🎯',
          points: 20,
          member: user._id,
          dateAwarded: new Date().toISOString()
        };

        await db.collection('achievements').insertOne(profileMaster);
        await db.collection('members').updateOne(
          { _id: user._id },
          { 
            $push: { achievements: profileMaster._id },
            $inc: { points: profileMaster.points }
          }
        );
      }
    }

    const updatedUser = await db.collection('members').findOne({ _id: user._id });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`,
        user: { ...updatedUser, id: updatedUser._id.toString() },
        pointsAwarded
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    };
  }
}; 