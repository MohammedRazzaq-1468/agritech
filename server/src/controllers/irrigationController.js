import { irrigationAdvisoryInputSchema } from '../schemas/validation.js';
import * as irrigationService from '../services/irrigation/irrigationService.js';

export async function getIrrigationAdvisory(req, res, next) {
  try {
    const validatedData = irrigationAdvisoryInputSchema.parse(req.body);
    const userId = req.user.id;

    const advisory = await irrigationService.generateIrrigationAdvisory(userId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Irrigation advisory generated successfully',
      data: advisory,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getIrrigationHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await irrigationService.getUserIrrigationHistory(userId);

    return res.json({
      success: true,
      message: 'Irrigation history retrieved',
      data: history,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

