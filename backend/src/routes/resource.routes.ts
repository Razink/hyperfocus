import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadDoc, uploadImage } from '../middleware/upload.middleware';

const router = Router();
const ctrl = new ResourceController();

router.use(authenticate);

// Standalone resource actions (by resource id)
router.patch('/:id', ctrl.rename);
router.delete('/:id', ctrl.delete);

export default router;

// Sub-router mounted under /api/lessons/:lessonId/resources
export const lessonResourceRouter = Router({ mergeParams: true });
lessonResourceRouter.use(authenticate);

lessonResourceRouter.post('/link', ctrl.addLink);
lessonResourceRouter.post('/doc', uploadDoc.single('file'), ctrl.addDoc);
lessonResourceRouter.post('/image', uploadImage.single('file'), ctrl.addImage);
lessonResourceRouter.put('/reorder', ctrl.reorder);
