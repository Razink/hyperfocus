import { Response } from 'express';
import { bulletinService } from '../services/bulletin.service';
import { projectionService } from '../services/projection.service';
import { AuthRequest } from '../middleware/auth.middleware';

function handle(err: any, res: Response) {
  const status = err.status || (err.name === 'ZodError' ? 400 : 500);
  const code = err.code || (err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  const message = err.name === 'ZodError' ? err.errors?.[0]?.message ?? 'Validation' : err.message;
  res.status(status).json({ error: { code, message, ...(err.errors && { details: err.errors }) } });
}

export class BulletinController {
  async list(req: AuthRequest, res: Response) {
    try {
      const bulletins = await bulletinService.list(req.userId!);
      res.json({ bulletins });
    } catch (err: any) { handle(err, res); }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const bulletin = await bulletinService.getById(req.userId!, req.params.id);
      res.json(bulletin);
    } catch (err: any) { handle(err, res); }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const bulletin = await bulletinService.create(req.userId!, req.body);
      res.status(201).json(bulletin);
    } catch (err: any) { handle(err, res); }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const bulletin = await bulletinService.update(req.userId!, req.params.id, req.body);
      res.json(bulletin);
    } catch (err: any) { handle(err, res); }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await bulletinService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err: any) { handle(err, res); }
  }

  /** Pré-rempli un brouillon de projection à partir du bulletin le plus récent. */
  async draft(req: AuthRequest, res: Response) {
    try {
      const schoolYear = String(req.query.schoolYear ?? '');
      const trimester = Number(req.query.trimester ?? 0);
      if (!schoolYear || !trimester) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'schoolYear et trimester requis' } });
      }
      const draft = await projectionService.buildProjectionDraft(req.userId!, schoolYear, trimester);
      res.json(draft);
    } catch (err: any) { handle(err, res); }
  }

  /** Génère un bulletin complet (non sauvegardé) atteignant la moyenne cible. */
  async autofill(req: AuthRequest, res: Response) {
    try {
      const result = await projectionService.autofillFromTarget(req.userId!, req.body);
      res.json(result);
    } catch (err: any) { handle(err, res); }
  }
}
