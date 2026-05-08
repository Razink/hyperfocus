import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new ExamController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
