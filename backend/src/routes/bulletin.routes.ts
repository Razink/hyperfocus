import { Router } from 'express';
import { BulletinController } from '../controllers/bulletin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new BulletinController();

router.use(authenticate);

// Projection (avant les routes :id pour éviter conflit avec "draft")
router.get('/draft', controller.draft.bind(controller));
router.post('/autofill', controller.autofill.bind(controller));

// CRUD
router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
