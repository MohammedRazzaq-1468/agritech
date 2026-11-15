import { savedAdvisoryInputSchema } from '../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const inMemorySaved = new Map();

export async function saveAdvisory(req, res, next) {
  try {
    const validated = savedAdvisoryInputSchema.parse(req.body);
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('saved_advisories')
        .insert({
          user_id: userId,
          advisory_type: validated.advisoryType,
          advisory_id: validated.advisoryId
        })
        .select('*')
        .single();

      if (error && error.code !== '23505') { // Ignore unique conflict
        throw error;
      }

      return res.status(201).json({
        success: true,
        message: 'Advisory saved to your dashboard bookmarks',
        data: data || { user_id: userId, ...validated },
        error: null
      });
    }

    const key = `${userId}-${validated.advisoryType}-${validated.advisoryId}`;
    const record = { id: key, user_id: userId, ...validated, created_at: new Date().toISOString() };
    inMemorySaved.set(key, record);

    return res.status(201).json({
      success: true,
      message: 'Advisory bookmarked (Dev session)',
      data: record,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getSavedAdvisories(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('saved_advisories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, message: 'Saved advisories retrieved', data, error: null });
      }
    }

    const saved = Array.from(inMemorySaved.values()).filter(s => s.user_id === userId);
    return res.json({ success: true, message: 'Saved advisories retrieved', data: saved, error: null });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedAdvisory(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      await client.from('saved_advisories').delete().eq('id', id).eq('user_id', userId);
    } else {
      inMemorySaved.delete(id);
    }

    return res.json({
      success: true,
      message: 'Saved advisory bookmark removed',
      data: { id },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

