import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const lessonController = new LessonController();

router.use(authenticate);

router.get('/:id', lessonController.getById);
router.put('/:id', lessonController.update);
router.patch('/:id/revised', lessonController.updateRevised);
router.post('/:id/screenshot', upload.single('screenshot'), lessonController.uploadScreenshot);
router.delete('/:id', lessonController.delete);

export default router;
