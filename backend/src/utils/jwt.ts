import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Token invalide');
  }
};
