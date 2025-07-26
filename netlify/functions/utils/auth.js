import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticateRequest = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

export const requireAuth = (handler) => async (event, context) => {
  const user = authenticateRequest(event);
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }
  event.user = user;
  return handler(event, context);
}; 