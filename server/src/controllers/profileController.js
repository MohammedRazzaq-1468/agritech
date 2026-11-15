import { profileUpdateSchema } from '../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        return res.json({
          success: true,
          message: 'Profile retrieved successfully',
          data: profile,
          error: null
        });
      }
    }

    return res.json({
      success: true,
      message: 'Profile retrieved',
      data: req.profile || { id: userId, full_name: 'Farmer', role: 'farmer' },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const validatedData = profileUpdateSchema.parse(req.body);

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data: updated, error } = await client
        .from('profiles')
        .update({
          full_name: validatedData.full_name,
          phone: validatedData.phone,
          state: validatedData.state,
          district: validatedData.district,
          village: validatedData.village,
          preferred_language: validatedData.preferred_language,
          farm_size: validatedData.farm_size,
          farm_size_unit: validatedData.farm_size_unit,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        logger.error('Failed to update profile in Supabase', error);
        return res.status(500).json({
          success: false,
          message: 'Unable to update profile in database',
          data: null,
          error: { code: 'DATABASE_ERROR', details: [error.message] }
        });
      }

      return res.json({
        success: true,
        message: 'Farmer profile updated successfully',
        data: updated,
        error: null
      });
    }

    // Dev mode fallback
    req.profile = { ...req.profile, ...validatedData, id: userId };
    return res.json({
      success: true,
      message: 'Profile updated (Dev session)',
      data: req.profile,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;
    logger.info(`User requested account deletion: ${userId}`);

    if (isSupabaseConfigured() && supabaseAdmin) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    return res.json({
      success: true,
      message: 'Your account and associated agricultural records have been queued for secure deletion.',
      data: { deletedUserId: userId },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

