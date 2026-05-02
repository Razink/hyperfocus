import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new AssessmentController();

router.use(authenticate);

router.get('/:id', ctrl.getById);
router.patch('/:id', ctrl.patch);
router.put('/:id/lessons', ctrl.setLessons);

export default router;

// Sub-router mounted under /api/subjects/:subjectId/assessments
export const subjectAssessmentRouter = Router({ mergeParams: true });
subjectAssessmentRouter.use(authenticate);
subjectAssessmentRouter.get('/', ctrl.getBySubject);
