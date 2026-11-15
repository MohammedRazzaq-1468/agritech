import { adminCropInputSchema, adminArticleInputSchema } from '../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export async function getOverview(req, res, next) {
  try {
    let stats = {
      totalFarmers: 142,
      totalCropRecommendations: 384,
      totalDiseaseScans: 219,
      totalArticles: 12,
      totalCropsKnowledge: 15
    };

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const [farmers, recs, disease, articles, crops] = await Promise.all([
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('crop_recommendations').select('id', { count: 'exact', head: true }),
        client.from('disease_analyses').select('id', { count: 'exact', head: true }),
        client.from('agricultural_articles').select('id', { count: 'exact', head: true }),
        client.from('crops').select('id', { count: 'exact', head: true })
      ]);

      stats = {
        totalFarmers: farmers.count || 0,
        totalCropRecommendations: recs.count || 0,
        totalDiseaseScans: disease.count || 0,
        totalArticles: articles.count || 0,
        totalCropsKnowledge: crops.count || 0
      };
    }

    return res.json({
      success: true,
      message: 'Admin overview statistics retrieved',
      data: stats,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getCrops(req, res, next) {
  try {
    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client.from('crops').select('*').order('name');
      if (!error && data) {
        return res.json({ success: true, message: 'Crops knowledge base retrieved', data, error: null });
      }
    }
    return res.json({ success: true, message: 'Crops knowledge base (default)', data: [], error: null });
  } catch (err) {
    next(err);
  }
}

export async function createCrop(req, res, next) {
  try {
    const validated = adminCropInputSchema.parse(req.body);

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client.from('crops').insert(validated).select('*').single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Crop entry added to knowledge base', data, error: null });
    }

    return res.status(201).json({ success: true, message: 'Crop entry created (dev mode)', data: validated, error: null });
  } catch (err) {
    next(err);
  }
}

export async function updateCrop(req, res, next) {
  try {
    const { id } = req.params;
    const validated = adminCropInputSchema.partial().parse(req.body);

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client.from('crops').update(validated).eq('id', id).select('*').single();
      if (error) throw error;
      return res.json({ success: true, message: 'Crop entry updated', data, error: null });
    }

    return res.json({ success: true, message: 'Crop updated (dev mode)', data: { id, ...validated }, error: null });
  } catch (err) {
    next(err);
  }
}

export async function deleteCrop(req, res, next) {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { error } = await client.from('crops').delete().eq('id', id);
      if (error) throw error;
    }

    return res.json({ success: true, message: 'Crop entry deleted from knowledge base', data: { id }, error: null });
  } catch (err) {
    next(err);
  }
}

export async function getArticles(req, res, next) {
  try {
    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client.from('agricultural_articles').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return res.json({ success: true, message: 'Articles retrieved', data, error: null });
      }
    }
    return res.json({ success: true, message: 'Articles retrieved', data: [], error: null });
  } catch (err) {
    next(err);
  }
}

export async function createArticle(req, res, next) {
  try {
    const validated = adminArticleInputSchema.parse(req.body);
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('agricultural_articles')
        .insert({ ...validated, published_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Article published', data, error: null });
    }

    return res.status(201).json({ success: true, message: 'Article created (dev mode)', data: validated, error: null });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const validated = adminArticleInputSchema.partial().parse(req.body);

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client.from('agricultural_articles').update(validated).eq('id', id).select('*').single();
      if (error) throw error;
      return res.json({ success: true, message: 'Article updated', data, error: null });
    }

    return res.json({ success: true, message: 'Article updated', data: { id, ...validated }, error: null });
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { error } = await client.from('agricultural_articles').delete().eq('id', id);
      if (error) throw error;
    }

    return res.json({ success: true, message: 'Article deleted', data: { id }, error: null });
  } catch (err) {
    next(err);
  }
}

