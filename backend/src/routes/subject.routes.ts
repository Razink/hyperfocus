import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { LessonController } from '../controllers/lesson.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const subjectController = new SubjectController();
const lessonController = new LessonController();

router.use(authenticate);

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.delete);

router.get('/:subjectId/lessons', lessonController.getBySubjectId);
router.post('/:subjectId/lessons', lessonController.create);

export default router;
