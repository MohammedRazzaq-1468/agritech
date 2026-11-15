import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.delete('/', profileController.deleteAccount);

export default router;

