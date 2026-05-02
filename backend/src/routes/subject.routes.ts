import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { LessonController } from '../controllers/lesson.controller';
import { authenticate } from '../middleware/auth.middleware';
import { BulkImportService } from '../services/bulk-import.service';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const subjectController = new SubjectController();
const lessonController = new LessonController();
const bulkImport = new BulkImportService();

router.use(authenticate);

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.delete);

router.get('/:subjectId/lessons', lessonController.getBySubjectId);
router.post('/:subjectId/lessons', lessonController.create);

router.post('/:subjectId/lessons/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const result = await bulkImport.import(req.params.subjectId as string, req.userId!, req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 400).json({ error: { code: err.code || 'VALIDATION_ERROR', message: err.message } });
  }
});

export default router;
