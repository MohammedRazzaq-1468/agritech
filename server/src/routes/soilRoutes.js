import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import * as soilController from '../controllers/soilController.js';

const router = Router();

router.use(requireAuth);

router.post('/advisory', aiLimiter, soilController.getSoilAdvisory);
router.get('/history', soilController.getSoilHistory);

export default router;

