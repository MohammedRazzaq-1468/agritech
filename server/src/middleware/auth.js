import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware: Verify Supabase Authentication JWT
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token.',
        data: null,
        error: { code: 'UNAUTHORIZED', details: ['No authorization header provided'] }
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. Dev/Sandbox Mode Check:
    // Allows seamless testing with seeded Supabase cloud profiles
    if (token === 'dev-farmer-token' || token.startsWith('mock-farmer') || token === 'mock-token') {
      req.user = { id: '8bc1c168-78b2-404a-9b56-88ce5b5e804d', email: 'farmer@agrismart.ai' };
      req.profile = {
        id: '8bc1c168-78b2-404a-9b56-88ce5b5e804d',
        full_name: 'Rajesh Kumar',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        preferred_language: 'en',
        farm_size: 4.5,
        farm_size_unit: 'acre'
      };
      return next();
    } else if (token === 'dev-admin-token' || token.startsWith('mock-admin')) {
      req.user = { id: '4fc0e533-a0f5-44ea-befb-45d9a8b3ac7e', email: 'admin@agrismart.ai' };
      req.profile = {
        id: '4fc0e533-a0f5-44ea-befb-45d9a8b3ac7e',
        full_name: 'System Administrator',
        role: 'admin'
      };
      return next();
    }

    // 2. Supabase Auth JWT Verification:
    if (isSupabaseConfigured()) {
      const authClient = supabaseAdmin || supabase;
      const { data: { user }, error } = await authClient.auth.getUser(token);

      if (error || !user) {
        logger.warn('Supabase JWT verification failed', { error: error?.message });
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session. Please log in again.',
          data: null,
          error: { code: 'INVALID_TOKEN', details: [error?.message || 'Token verification failed'] }
        });
      }

      req.user = user;

      // Fetch or automatically ensure farmer profile exists in Supabase
      const client = supabaseAdmin || supabase;
      let { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { data: newProfile } = await client
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Farmer User',
            role: 'farmer'
          }, { onConflict: 'id' })
          .select()
          .single();
        profile = newProfile;
      }

      req.profile = profile || { id: user.id, full_name: user.email, role: 'farmer' };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Supabase authentication not configured on server. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
      data: null,
      error: { code: 'AUTH_CONFIG_MISSING', details: ['Server Supabase configuration required'] }
    });
  } catch (err) {
    logger.error('Unexpected error in auth middleware', err);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      data: null,
      error: { code: 'AUTH_INTERNAL_ERROR', details: [err.message] }
    });
  }
}

/**
 * Middleware: Verify Admin Role
 */
export function requireAdmin(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    logger.warn('Forbidden access attempt to admin endpoint', { userId: req.user?.id });
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.',
      data: null,
      error: { code: 'FORBIDDEN', details: ['User role is not authorized'] }
    });
  }
  next();
}

