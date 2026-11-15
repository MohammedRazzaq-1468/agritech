import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload, validateImageMagicBytes } from '../middleware/upload.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import * as diseaseController from '../controllers/diseaseController.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/analyze',
  aiLimiter,
  upload.single('image'),
  validateImageMagicBytes,
  diseaseController.analyzeDisease
);

router.get('/history', diseaseController.getDiseaseHistory);
router.get('/:id', diseaseController.getDiseaseById);
router.delete('/:id', diseaseController.deleteDisease);

export default router;

