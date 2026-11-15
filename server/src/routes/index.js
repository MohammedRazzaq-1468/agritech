import { Router } from 'express';
import profileRoutes from './profileRoutes.js';
import cropRoutes from './cropRoutes.js';
import diseaseRoutes from './diseaseRoutes.js';
import soilRoutes from './soilRoutes.js';
import irrigationRoutes from './irrigationRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import chatRoutes from './chatRoutes.js';
import savedRoutes from './savedRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import adminRoutes from './adminRoutes.js';
import { INDIAN_STATES, SOIL_TYPES, SEASONS } from '../constants/indianAgri.js';

const router = Router();

// Root API v1 Route (resolves GET /api/v1 and GET /api/v1/)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AgriSmart AI API v1 Operational',
    data: {
      timestamp: new Date().toISOString(),
      service: 'AgriSmart AI Core Service',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        health: '/api/v1/health',
        constants: '/api/v1/constants',
        crops: '/api/v1/crops',
        disease: '/api/v1/disease',
        soil: '/api/v1/soil',
        irrigation: '/api/v1/irrigation',
        weather: '/api/v1/weather',
        chat: '/api/v1/chat',
        saved: '/api/v1/saved',
        profile: '/api/v1/profile'
      }
    },
    error: null
  });
});

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AgriSmart AI API v1 Operational',
    data: {
      timestamp: new Date().toISOString(),
      service: 'AgriSmart AI Core Service',
      version: '1.0.0'
    },
    error: null
  });
});

// Agricultural Metadata Helper (public reference for dropdowns)
router.get('/constants', (req, res) => {
  res.json({
    success: true,
    message: 'Agricultural domain reference constants',
    data: {
      states: INDIAN_STATES,
      soilTypes: SOIL_TYPES,
      seasons: SEASONS
    },
    error: null
  });
});

// Domain Routes
router.use('/profile', profileRoutes);
router.use('/crops', cropRoutes);
router.use('/disease', diseaseRoutes);
router.use('/soil', soilRoutes);
router.use('/irrigation', irrigationRoutes);
router.use('/weather', weatherRoutes);
router.use('/chat', chatRoutes);
router.use('/saved', savedRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

export default router;

