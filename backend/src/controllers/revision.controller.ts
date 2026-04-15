import { Response } from 'express';
import { RevisionService } from '../services/revision.service';
import { AuthRequest } from '../middleware/auth.middleware';

const revisionService = new RevisionService();

export class RevisionController {
  async getByWeek(req: AuthRequest, res: Response) {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({
          error: { code: 'MISSING_PARAMS', message: 'Les paramètres start et end sont requis' }
        });
      }
      const sessions = await revisionService.getByWeek(req.userId!, start as string, end as string);
      res.json(sessions);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const sessions = await revisionService.getAll(req.userId!);
      res.json(sessions);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const session = await revisionService.create(req.userId!, req.body);
      res.status(201).json(session);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const session = await revisionService.update(req.userId!, req.params.id, req.body);
      res.json(session);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await revisionService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
}
