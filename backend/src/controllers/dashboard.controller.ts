import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

const dashboardService = new DashboardService();

export class DashboardController {
  async getData(req: AuthRequest, res: Response) {
    try {
      const data = await dashboardService.getData(req.userId!);
      res.json(data);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
}
