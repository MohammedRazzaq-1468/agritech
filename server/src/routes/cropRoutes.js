import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import * as cropController from '../controllers/cropController.js';

const router = Router();

router.use(requireAuth);

// Both /crops/recommend and /crops accept recommendation POST
router.post('/recommend', aiLimiter, cropController.recommendCrop);
router.post('/', aiLimiter, cropController.recommendCrop);

// Informational GET on /recommend
router.get('/recommend', (req, res) => {
  res.json({
    success: true,
    message: 'Crop recommendation endpoint. Submit a POST request with soil and farm conditions to receive recommendations.',
    data: null,
    error: null
  });
});

// Recommendations history routes
router.get('/recommendations', cropController.getRecommendationHistory);
router.get('/', cropController.getRecommendationHistory);
router.get('/recommendations/:id', cropController.getRecommendationById);
router.get('/:id', cropController.getRecommendationById);
router.delete('/recommendations/:id', cropController.deleteRecommendation);
router.delete('/:id', cropController.deleteRecommendation);

export default router;

