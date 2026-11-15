import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import * as chatController from '../controllers/chatController.js';

const router = Router();

router.use(requireAuth);

router.post('/message', aiLimiter, chatController.sendMessage);
router.get('/sessions', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.get('/sessions/:id', chatController.getSessionMessages);
router.delete('/sessions/:id', chatController.deleteSession);

export default router;

