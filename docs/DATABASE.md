# AgriSmart AI – Database Architecture & Security Guide

AgriSmart AI utilizes **Supabase PostgreSQL 16+** with native Row Level Security (RLS) policies on every table containing farmer or sensitive information.

---

## 1. Relational Schema Architecture

```
                    ┌─────────────────────────┐
                    │      auth.users         │
                    └────────────┬────────────┘
                                 │ 1:1
                    ┌────────────▼────────────┐
                    │     public.profiles     │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼────────────────────────┐
         │ 1:N                   │ 1:N                    │ 1:N
┌────────▼──────────────┐ ┌──────▼─────────────┐   ┌──────▼──────────────┐
│  crop_recommendations │ │  disease_analyses  │   │   soil_advisories   │
└───────────────────────┘ └────────────────────┘   └─────────────────────┘
         │                       │                        │
         │ 1:N                   │ 1:N                    │ 1:N
┌────────▼──────────────┐ ┌──────▼─────────────┐   ┌──────▼──────────────┐
│ irrigation_advisories │ │   chat_sessions    │   │  saved_advisories   │
└───────────────────────┘ └──────┬─────────────┘   └─────────────────────┘
                                 │ 1:N
                          ┌──────▼─────────────┐
                          │   chat_messages    │
                          └────────────────────┘
```

---

## 2. Table Catalog

| Table Name | Description | Key Constraints |
|---|---|---|
| `profiles` | Farmer profile extending `auth.users` | `PRIMARY KEY (id REFERENCES auth.users)`, `CHECK (role IN ('farmer', 'admin'))` |
| `crops` | Crop knowledge base for AI prompts | `suitable_soils TEXT[]`, `suitable_seasons TEXT[]`, `cultivation_duration_days` |
| `crop_recommendations` | Output from Gemini crop recommendation | `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE` |
| `disease_analyses` | Plant foliage pathology reports | `image_mime_type`, `confidence_level`, `expert_review_recommended` |
| `soil_advisories` | Soil test evaluations & NPK guidance | `soil_test_data JSONB`, `recommendations JSONB` |
| `irrigation_advisories`| Evapotranspiration water plans | `weather_data JSONB`, `irrigation_recommendation JSONB` |
| `chat_sessions` | Farmer consultation sessions | `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE` |
| `chat_messages` | Individual turns in chat session | `session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE` |
| `saved_advisories` | Bookmarked recommendations | `UNIQUE(user_id, advisory_type, advisory_id)` |
| `agricultural_articles`| ICAR & Ministry educational articles| `published_by UUID REFERENCES profiles(id)` |
| `advisory_feedback` | User satisfaction ratings (1-5) | `CHECK (rating BETWEEN 1 AND 5)` |

---

## 3. Row Level Security (RLS) Rules

1. **Farmer Data Isolation:**
   Every query executed on behalf of a farmer is strictly verified against `auth.uid() = user_id`. Attempting to read, update, or delete another farmer's records yields 0 rows or is rejected by PostgreSQL.
2. **Admin Segregation:**
   Administrative tables (`crops` knowledge modification, `agricultural_articles` authoring) verify:
   ```sql
   EXISTS (
       SELECT 1 FROM public.profiles
       WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
   )
   ```
3. **Database Triggers:**
   - `handle_updated_at`: Automatically timestamps `updated_at` before every row update.
   - `handle_new_user`: Automatically creates a `profiles` record upon Supabase Auth user registration with default role `'farmer'`.

---

## 4. Applying Migrations

You can apply the complete database schema, Row Level Security (RLS) policies, triggers, and seed data using either of the following methods:

### Method A: Automated Node.js Migration Runner (CLI)
1. Add your Supabase credentials to `server/.env`:
   ```ini
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   # Either set direct connection URL or DB password:
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   # OR:
   SUPABASE_DB_PASSWORD=your_database_password
   ```
2. Run the migration script:
   ```bash
   # From root:
   npm run db:migrate

   # Or from server directory:
   cd server
   npm run db:migrate
   ```

### Method B: Supabase Cloud SQL Editor (Web Console)
1. Open your Supabase Project Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New query**, open and paste the full contents of `supabase/migrations/001_initial_schema.sql`.
4. Click **Run**. This idempotently provisions all 11 tables, storage bucket, triggers, RLS policies, and Indian agricultural seed records in a single execution.

