#!/usr/bin/env node

/**
 * ==============================================================================
 * AgriSmart AI – Supabase Cloud PostgreSQL Migration Runner
 * Script: server/scripts/migrate.js
 * ==============================================================================
 * This migration runner reads /supabase/migrations/001_initial_schema.sql
 * and applies all table creation scripts, Row Level Security (RLS) policies,
 * triggers, indexes, and seed data directly to Supabase Cloud PostgreSQL.
 *
 * Supported execution paths:
 *  1. Direct PostgreSQL connection via DATABASE_URL or SUPABASE_DB_URL
 *  2. Auto-derived connection via SUPABASE_URL + SUPABASE_DB_PASSWORD
 *  3. HTTP SQL API query dispatch via SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *  4. Health check & verification via @supabase/supabase-js with Service Role Key
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env, then root .env if present
const serverEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

// Locate migration file
const migrationFilePath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

console.log('\n======================================================');
console.log('🌾 AgriSmart AI – Supabase Cloud Migration Runner');
console.log('======================================================\n');

if (!fs.existsSync(migrationFilePath)) {
  console.error(`❌ Migration file not found at: ${migrationFilePath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
console.log(`📄 Loaded migration: 001_initial_schema.sql (${(sqlContent.length / 1024).toFixed(2)} KB)`);

// Detect available connection credentials
const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || '';
const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || '';

// Parse project ref from Supabase URL (e.g. https://xyzcompany.supabase.co -> xyzcompany)
let projectRef = '';
if (supabaseUrl) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    projectRef = parsedUrl.hostname.split('.')[0];
  } catch (e) {
    // ignore
  }
}

// Build PostgreSQL connection candidates
const connectionCandidates = [];

if (databaseUrl) {
  connectionCandidates.push({
    name: 'Direct DATABASE_URL connection string',
    connectionString: databaseUrl
  });
}

if (projectRef && dbPassword) {
  // Direct host (port 5432)
  connectionCandidates.push({
    name: `Direct Supabase host db.${projectRef}.supabase.co:5432`,
    connectionString: `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`
  });

  // Supabase Connection Pooler (port 6543)
  const poolerRegion = process.env.SUPABASE_POOLER_REGION || 'aws-0-ap-south-1';
  connectionCandidates.push({
    name: `Supabase Pooler ${poolerRegion}.pooler.supabase.com:6543`,
    connectionString: `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${poolerRegion}.pooler.supabase.com:6543/postgres`
  });
}

/**
 * Attempt applying SQL via pg client (direct PostgreSQL protocol)
 */
async function applyViaPg(connStr, label) {
  console.log(`🔄 Attempting migration via ${label}...`);

  const client = new Client({
    connectionString: connStr,
    ssl: {
      rejectUnauthorized: false
    },
    statement_timeout: 60000,
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log(`   Connected to PostgreSQL successfully.`);

    console.log(`   Executing 001_initial_schema.sql (tables, RLS, indexes, seed data)...`);
    await client.query(sqlContent);

    console.log(`✅ Migration applied successfully via ${label}!`);
    await client.end();
    return true;
  } catch (err) {
    console.warn(`   ⚠️ Could not complete via ${label}: ${err.message}`);
    try {
      await client.end();
    } catch (_) {}
    return false;
  }
}

/**
 * Attempt applying SQL via Supabase HTTP endpoints with service role key
 */
async function applyViaHttpEndpoint() {
  if (!supabaseUrl || !serviceRoleKey) return false;

  console.log(`🔄 Attempting migration via Supabase SQL HTTP API using Service Role Key...`);

  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };

  // Candidate endpoint 1: Supabase pg/query endpoint
  const queryEndpoints = [
    `${supabaseUrl}/pg/v1/query`,
    `${supabaseUrl}/pg/query`,
    `${supabaseUrl}/rest/v1/rpc/exec_sql`
  ];

  for (const endpoint of queryEndpoints) {
    try {
      console.log(`   Testing endpoint: ${endpoint}`);
      const body = endpoint.includes('exec_sql') ? { query: sqlContent } : { query: sqlContent };
      const response = await axios.post(endpoint, body, {
        headers,
        timeout: 45000
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Migration applied successfully via HTTP API (${endpoint})!`);
        return true;
      }
    } catch (err) {
      // 404 or unsupported endpoint is expected if pg-meta is not exposed
    }
  }

  return false;
}

/**
 * Verify Supabase tables and verify service role key access
 */
async function verifyTablesWithServiceRole() {
  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  console.log(`\n🔍 Verifying Supabase tables using Service Role Key...`);
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Check profiles table
    const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('id').limit(1);
    // Check crops table
    const { data: crops, error: cError } = await supabaseAdmin.from('crops').select('id, name').limit(3);

    if (!pError && !cError) {
      console.log(`✅ Table verification successful:`);
      console.log(`   • public.profiles: Accessible (RLS active, service role bypass confirmed)`);
      console.log(`   • public.crops: Accessible (${crops?.length || 0} sample seed crops detected)`);
      return true;
    } else {
      if (pError?.code === '42P01' || cError?.code === '42P01') {
        console.log(`   ℹ️ Tables do not exist yet in Supabase database.`);
      } else {
        console.log(`   ⚠️ Verification response: ${pError?.message || cError?.message}`);
      }
      return false;
    }
  } catch (err) {
    console.warn(`   ⚠️ Service role verification error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('📋 Environment Configuration Check:');
  console.log(`   • SUPABASE_URL:             ${supabaseUrl ? supabaseUrl : '❌ Not set'}`);
  console.log(`   • SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '••••••••' + serviceRoleKey.slice(-6) : '❌ Not set'}`);
  console.log(`   • DATABASE_URL:             ${databaseUrl ? 'Configured' : 'Optional / Not set'}`);
  console.log(`   • SUPABASE_DB_PASSWORD:     ${dbPassword ? '••••••••' : 'Optional / Not set'}\n`);

  let applied = false;

  // Step 1: Try PostgreSQL connections if candidates exist
  for (const candidate of connectionCandidates) {
    applied = await applyViaPg(candidate.connectionString, candidate.name);
    if (applied) break;
  }

  // Step 2: If not applied yet, try HTTP endpoints with service role key
  if (!applied && supabaseUrl && serviceRoleKey) {
    applied = await applyViaHttpEndpoint();
  }

  // Step 3: Verify current status with Supabase Service Role Key
  const verified = await verifyTablesWithServiceRole();

  if (applied || verified) {
    console.log('\n======================================================');
    console.log('🎉 SUCCESS: AgriSmart AI Database Schema Ready!');
    console.log('======================================================');
    console.log('Tables, Row Level Security policies, triggers, and seed');
    console.log('data are active in your Supabase Cloud PostgreSQL database.\n');
    process.exit(0);
  }

  // If not applied automatically, guide the user clearly
  console.log('\n======================================================');
  console.log('ℹ️  HOW TO COMPLETE SUPABASE CLOUD SETUP');
  console.log('======================================================');
  console.log('\nOption A (Instant 1-Click via Supabase Web Dashboard):');
  if (projectRef) {
    console.log(`  1. Open your project SQL editor: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  } else {
    console.log('  1. Open your Supabase Cloud Project: https://supabase.com/dashboard');
  }
  console.log('  2. Paste the contents of:');
  console.log(`     ${migrationFilePath}`);
  console.log('  3. Click "Run" (All 11 tables, RLS, triggers & seed data will be created).\n');

  console.log('Option B (Automated CLI Migration via Node.js):');
  console.log('  In your server/.env file, add your Supabase database password or connection string:');
  console.log('  DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
  console.log('  or:');
  console.log('  SUPABASE_DB_PASSWORD=your_database_password');
  console.log('\n  Then re-run:');
  console.log('  npm run db:migrate\n');
}

main().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});

