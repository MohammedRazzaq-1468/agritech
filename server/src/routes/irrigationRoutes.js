import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import * as irrigationController from '../controllers/irrigationController.js';

const router = Router();

router.use(requireAuth);

router.post('/advisory', aiLimiter, irrigationController.getIrrigationAdvisory);
router.get('/history', irrigationController.getIrrigationHistory);

export default router;

