import { diseaseDetectionInputSchema } from '../schemas/validation.js';
import * as diseaseService from '../services/disease/diseaseService.js';

export async function analyzeDisease(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Plant photograph required for disease diagnosis',
        data: null,
        error: { code: 'FILE_REQUIRED', details: ['Please attach a photo using field "image"'] }
      });
    }

    const validatedBody = diseaseDetectionInputSchema.parse(req.body);
    const userId = req.user.id;

    const analysis = await diseaseService.analyzePlantDisease(userId, req.file, validatedBody);

    return res.status(200).json({
      success: true,
      message: 'Plant health and disease analysis completed',
      data: analysis,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getDiseaseHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await diseaseService.getUserDiseaseHistory(userId);

    return res.json({
      success: true,
      message: 'Disease analysis history retrieved',
      data: history,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getDiseaseById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await diseaseService.getDiseaseAnalysisById(userId, id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Disease analysis record not found',
        data: null,
        error: { code: 'NOT_FOUND', details: [`No record with ID ${id}`] }
      });
    }

    return res.json({
      success: true,
      message: 'Disease analysis record retrieved',
      data: record,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDisease(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await diseaseService.deleteDiseaseAnalysis(userId, id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Disease record not found or already deleted',
        data: null,
        error: { code: 'NOT_FOUND', details: [`No record with ID ${id}`] }
      });
    }

    return res.json({
      success: true,
      message: 'Disease analysis record deleted successfully',
      data: { id },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

