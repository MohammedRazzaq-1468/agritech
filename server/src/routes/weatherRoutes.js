import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as weatherController from '../controllers/weatherController.js';

const router = Router();

// Weather endpoints can be accessed by authenticated farmers
router.use(requireAuth);

router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getForecast);
router.get('/advisory', weatherController.getWeatherAdvisory);

export default router;

