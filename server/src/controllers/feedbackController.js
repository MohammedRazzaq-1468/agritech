import { advisoryFeedbackInputSchema } from '../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export async function submitFeedback(req, res, next) {
  try {
    const validated = advisoryFeedbackInputSchema.parse(req.body);
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('advisory_feedback')
        .insert({
          user_id: userId,
          advisory_type: validated.advisoryType,
          advisory_id: validated.advisoryId,
          rating: validated.rating,
          feedback: validated.feedback
        })
        .select('*')
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for helping improve the advisory system.',
        data,
        error: null
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback received (Dev mode)',
      data: { user_id: userId, ...validated },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

