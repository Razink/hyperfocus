import { Response } from 'express';
import { ResourceService } from '../services/resource.service';
import { AuthRequest } from '../middleware/auth.middleware';

const svc = new ResourceService();

function handle(fn: () => Promise<any>, res: Response) {
  fn().then(data => res.json(data)).catch((err: any) => {
    res.status(err.status || 500).json({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message } });
  });
}

export class ResourceController {
  getById = (req: AuthRequest, res: Response) =>
    handle(() => svc.getById(req.params.id as string, req.userId!), res);

  addLink = (req: AuthRequest, res: Response) =>
    handle(() => svc.addLink(req.params.lessonId as string, req.userId!, req.body).then(r => (res.status(201), r)), res);

  addDoc = (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'Aucun fichier fourni' } });
      return;
    }
    handle(() => svc.addDoc(req.params.lessonId as string, req.userId!, req.file!, req.body.title).then(r => (res.status(201), r)), res);
  };

  addImage = (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'Aucun fichier fourni' } });
      return;
    }
    handle(() => svc.addImage(req.params.lessonId as string, req.userId!, req.file!, req.body.title).then(r => (res.status(201), r)), res);
  };

  rename = (req: AuthRequest, res: Response) =>
    handle(() => svc.rename(req.params.id as string, req.userId!, req.body), res);

  reorder = (req: AuthRequest, res: Response) =>
    handle(() => svc.reorder(req.params.lessonId as string, req.userId!, req.body), res);

  delete = (req: AuthRequest, res: Response) =>
    handle(() => svc.delete(req.params.id as string, req.userId!), res);
}
