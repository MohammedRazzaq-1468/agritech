import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let supabaseClient = null;
let supabaseAdminClient = null;

const keyForClient = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (env.SUPABASE_URL && keyForClient) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, keyForClient, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      logger.info('Supabase Admin client initialized with Service Role Key');
    }

    logger.info('Supabase client successfully initialized');
  } catch (err) {
    logger.error('Failed to initialize Supabase client', err);
  }
} else {
  logger.warn('Supabase URL or Key is missing. Operating with in-memory persistence fallback for local testing.');
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient || supabaseClient;
export const isSupabaseConfigured = () => Boolean(supabaseClient);

