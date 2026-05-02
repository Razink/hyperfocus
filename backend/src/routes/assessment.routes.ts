import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadAssessmentDoc, uploadAssessmentImage } from '../middleware/upload.middleware';

const router = Router();
const ctrl = new AssessmentController();

router.use(authenticate);

router.get('/resources/:resourceId', ctrl.getResourceById);
router.delete('/resources/:resourceId', ctrl.deleteResource);
router.get('/:id', ctrl.getById);
router.patch('/:id', ctrl.patch);
router.put('/:id/lessons', ctrl.setLessons);
router.post('/:id/resources/link', ctrl.addResourceLink);
router.post('/:id/resources/doc', uploadAssessmentDoc.single('file'), ctrl.addResourceDoc);
router.post('/:id/resources/image', uploadAssessmentImage.single('file'), ctrl.addResourceImage);

export default router;

// Sub-router mounted under /api/subjects/:subjectId/assessments
export const subjectAssessmentRouter = Router({ mergeParams: true });
subjectAssessmentRouter.use(authenticate);
subjectAssessmentRouter.get('/', ctrl.getBySubject);
