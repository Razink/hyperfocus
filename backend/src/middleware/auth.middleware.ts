import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token manquant ou invalide'
        }
      });
    }

    const token = authHeader.substring(7);
    const { userId } = verifyToken(token);

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token invalide ou expiré'
      }
    });
  }
};
