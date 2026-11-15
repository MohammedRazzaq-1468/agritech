import { cropRecommendationInputSchema } from '../schemas/validation.js';
import * as cropService from '../services/crops/cropService.js';

export async function recommendCrop(req, res, next) {
  try {
    const validatedData = cropRecommendationInputSchema.parse(req.body);
    const userId = req.user.id;

    const recommendation = await cropService.generateCropRecommendation(userId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Crop recommendation generated successfully',
      data: recommendation,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendationHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await cropService.getUserRecommendations(userId);

    return res.json({
      success: true,
      message: 'Crop recommendation history retrieved',
      data: history,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendationById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await cropService.getRecommendationById(userId, id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Crop recommendation not found',
        data: null,
        error: { code: 'NOT_FOUND', details: [`No record with ID ${id}`] }
      });
    }

    return res.json({
      success: true,
      message: 'Crop recommendation details retrieved',
      data: record,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecommendation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await cropService.deleteRecommendation(userId, id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Crop recommendation not found or already removed',
        data: null,
        error: { code: 'NOT_FOUND', details: [`No recommendation found with ID ${id}`] }
      });
    }

    return res.json({
      success: true,
      message: 'Crop recommendation successfully deleted',
      data: { id },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

