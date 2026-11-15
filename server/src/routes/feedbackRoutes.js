import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = Router();

router.use(requireAuth);

router.post('/', feedbackController.submitFeedback);

export default router;

