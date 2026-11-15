import { soilAdvisoryInputSchema } from '../schemas/validation.js';
import * as soilService from '../services/soil/soilService.js';

export async function getSoilAdvisory(req, res, next) {
  try {
    const validatedData = soilAdvisoryInputSchema.parse(req.body);
    const userId = req.user.id;

    const advisory = await soilService.generateSoilAdvisory(userId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Soil and nutrient advisory generated successfully',
      data: advisory,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getSoilHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await soilService.getUserSoilHistory(userId);

    return res.json({
      success: true,
      message: 'Soil test advisory history retrieved',
      data: history,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

