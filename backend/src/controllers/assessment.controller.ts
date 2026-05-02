import { Response } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const svc = new AssessmentService();

function handle(fn: () => Promise<any>, res: Response) {
  fn()
    .then(data => res.json(data))
    .catch((err: any) =>
      res.status(err.status || 500).json({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message } })
    );
}

export class AssessmentController {
  getBySubject = (req: AuthRequest, res: Response) =>
    handle(() => svc.getBySubject(req.params.subjectId as string, req.userId!), res);

  getById = (req: AuthRequest, res: Response) =>
    handle(() => svc.getById(req.params.id as string, req.userId!), res);

  patch = (req: AuthRequest, res: Response) =>
    handle(() => svc.patch(req.params.id as string, req.userId!, req.body), res);

  setLessons = (req: AuthRequest, res: Response) =>
    handle(() => svc.setLessons(req.params.id as string, req.userId!, req.body), res);
}
