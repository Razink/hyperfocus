import { Router } from 'express';
import { RevisionController } from '../controllers/revision.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new RevisionController();

router.use(authenticate);

router.get('/week', controller.getByWeek.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
