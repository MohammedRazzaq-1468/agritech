import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as savedController from '../controllers/savedController.js';

const router = Router();

router.use(requireAuth);

router.post('/', savedController.saveAdvisory);
router.get('/', savedController.getSavedAdvisories);
router.delete('/:id', savedController.deleteSavedAdvisory);

export default router;

