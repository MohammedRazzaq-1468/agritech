import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// Administrative guard on all routes
router.use(requireAuth, requireAdmin);

router.get('/overview', adminController.getOverview);

// Crop knowledge base management
router.get('/crops', adminController.getCrops);
router.post('/crops', adminController.createCrop);
router.put('/crops/:id', adminController.updateCrop);
router.delete('/crops/:id', adminController.deleteCrop);

// Agricultural articles management
router.get('/articles', adminController.getArticles);
router.post('/articles', adminController.createArticle);
router.put('/articles/:id', adminController.updateArticle);
router.delete('/articles/:id', adminController.deleteArticle);

export default router;

