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

  create = (req: AuthRequest, res: Response) =>
    handle(() => svc.create(req.params.subjectId as string, req.userId!, req.body).then(a => (res.status(201), a)), res);

  getById = (req: AuthRequest, res: Response) =>
    handle(() => svc.getById(req.params.id as string, req.userId!), res);

  patch = (req: AuthRequest, res: Response) =>
    handle(() => svc.patch(req.params.id as string, req.userId!, req.body), res);

  setLessons = (req: AuthRequest, res: Response) =>
    handle(() => svc.setLessons(req.params.id as string, req.userId!, req.body), res);

  getResourceById = (req: AuthRequest, res: Response) =>
    handle(() => svc.getResourceById(req.params.resourceId as string, req.userId!), res);

  addResourceLink = (req: AuthRequest, res: Response) =>
    handle(() => svc.addResourceLink(req.params.id as string, req.userId!, req.body).then(r => (res.status(201), r)), res);

  addResourceDoc = (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'Aucun fichier fourni' } });
      return;
    }
    handle(() => svc.addResourceDoc(req.params.id as string, req.userId!, req.file!, req.body.title).then(r => (res.status(201), r)), res);
  };

  addResourceImage = (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'Aucun fichier fourni' } });
      return;
    }
    handle(() => svc.addResourceImage(req.params.id as string, req.userId!, req.file!, req.body.title).then(r => (res.status(201), r)), res);
  };

  deleteResource = (req: AuthRequest, res: Response) =>
    handle(() => svc.deleteResource(req.params.resourceId as string, req.userId!), res);
}
