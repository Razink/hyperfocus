import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({ user, token });
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, token } = await authService.login(req.body);
      res.status(200).json({ user, token });
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getMe(req.userId!);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(error.status || 404).json({
        error: {
          code: error.code || 'USER_NOT_FOUND',
          message: error.message
        }
      });
    }
  }
}
