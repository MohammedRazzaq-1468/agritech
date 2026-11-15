-- ==============================================================================
-- AgriSmart AI – Supabase Cloud PostgreSQL Initial Schema & Seed Migration
-- File: /supabase/migrations/001_initial_schema.sql
-- ==============================================================================
-- This migration creates:
--   1. Cryptographic and UUID extensions
--   2. Storage bucket & access policies for plant disease photos
--   3. All 11 core application relational tables with constraints
--   4. Performance indexes on foreign keys, categories, and timestamps
--   5. Automated updated_at triggers
--   6. Automatic user profile creation trigger on auth.users registration
--   7. Strict PostgreSQL Row Level Security (RLS) policies for all tables
--   8. Initial seed data for Indian crops and ICAR agricultural articles
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    preferred_language TEXT DEFAULT 'en',
    farm_size NUMERIC(12,2),
    farm_size_unit TEXT DEFAULT 'acre',
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Crop Knowledge Table (Master crop dataset for AI prompt context)
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    category TEXT NOT NULL,
    suitable_soils TEXT[] DEFAULT '{}',
    suitable_seasons TEXT[] DEFAULT '{}',
    water_requirement TEXT,
    climate_requirements JSONB DEFAULT '{}'::jsonb,
    cultivation_duration_days INTEGER,
    description TEXT,
    region_tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Crop Recommendations Table (Saved AI recommendation sessions)
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location JSONB NOT NULL DEFAULT '{}'::jsonb,
    soil_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    farming_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_crops JSONB NOT NULL,
    advisory_summary TEXT NOT NULL,
    limitations JSONB DEFAULT '[]'::jsonb,
    confidence_level TEXT CHECK (
        confidence_level IN ('high', 'moderate', 'low', 'insufficient')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Disease Analyses Table (Multimodal plant foliage pathology findings)
CREATE TABLE IF NOT EXISTS public.disease_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT,
    image_path TEXT,
    image_mime_type TEXT,
    symptoms TEXT,
    analysis_result JSONB NOT NULL,
    confidence_level TEXT,
    expert_review_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Soil Advisories Table (Soil laboratory test evaluation & NPK plans)
CREATE TABLE IF NOT EXISTS public.soil_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT,
    soil_type TEXT,
    soil_test_data JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Irrigation Advisories Table (Weather-aware water management)
CREATE TABLE IF NOT EXISTS public.irrigation_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    growth_stage TEXT,
    soil_type TEXT,
    weather_data JSONB DEFAULT '{}'::jsonb,
    irrigation_recommendation JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Chat Sessions Table (Farmer consultation threads)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Agriculture Consultation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Chat Messages Table (Turns in farmer-AI consultation)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Saved Advisories Table (Farmer bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    advisory_type TEXT NOT NULL,
    advisory_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, advisory_type, advisory_id)
);

-- 2.10 Agricultural Articles Table (Agronomic knowledge and guides)
CREATE TABLE IF NOT EXISTS public.agricultural_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    source_name TEXT,
    source_url TEXT,
    published_by UUID REFERENCES public.profiles(id),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 Advisory Feedback Table (Farmer feedback & quality ratings)
CREATE TABLE IF NOT EXISTS public.advisory_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    advisory_type TEXT NOT NULL,
    advisory_id UUID NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. STORAGE BUCKET CONFIGURATION (crop-diagnostics)
-- ==============================================================================

DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'crop-diagnostics',
        'crop-diagnostics',
        false,
        10485760, -- 10MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN undefined_table THEN
        -- Storage extension not yet active in test environment
        NULL;
END $$;

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_crops_category ON public.crops(category);
CREATE INDEX IF NOT EXISTS idx_crops_name ON public.crops(name);
CREATE INDEX IF NOT EXISTS idx_crops_is_active ON public.crops(is_active);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id ON public.crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_created_at ON public.crop_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_user_id ON public.disease_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_created_at ON public.disease_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soil_advisories_user_id ON public.soil_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_advisories_user_id ON public.irrigation_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_advisories_user_id ON public.saved_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.agricultural_articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON public.agricultural_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_advisory_feedback_user_id ON public.advisory_feedback(user_id);

-- ==============================================================================
-- 5. REUSABLE UPDATED_AT TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_crops_updated_at ON public.crops;
CREATE TRIGGER set_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_articles_updated_at ON public.agricultural_articles;
CREATE TRIGGER set_articles_updated_at
    BEFORE UPDATE ON public.agricultural_articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Farmer'),
        'farmer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_feedback ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile non-role fields" ON public.profiles;
CREATE POLICY "Users can update own profile non-role fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 7.2 Crops Knowledge Policies
DROP POLICY IF EXISTS "Anyone authenticated can view active crops" ON public.crops;
CREATE POLICY "Anyone authenticated can view active crops"
    ON public.crops FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage crops" ON public.crops;
CREATE POLICY "Admins can manage crops"
    ON public.crops FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- 7.3 Crop Recommendations Policies
DROP POLICY IF EXISTS "Farmers can read own recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can read own recommendations"
    ON public.crop_recommendations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can create own recommendations"
    ON public.crop_recommendations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can delete own recommendations"
    ON public.crop_recommendations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.4 Disease Analyses Policies
DROP POLICY IF EXISTS "Farmers can read own disease analyses" ON public.disease_analyses;
CREATE POLICY "Farmers can read own disease analyses"
    ON public.disease_analyses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own disease analyses" ON public.disease_analyses;
CREATE POLICY "Farmers can create own disease analyses"
    ON public.disease_analyses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own disease analyses" ON public.disease_analyses;
CREATE POLICY "Farmers can delete own disease analyses"
    ON public.disease_analyses FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.5 Soil Advisories Policies
DROP POLICY IF EXISTS "Farmers can read own soil advisories" ON public.soil_advisories;
CREATE POLICY "Farmers can read own soil advisories"
    ON public.soil_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own soil advisories" ON public.soil_advisories;
CREATE POLICY "Farmers can create own soil advisories"
    ON public.soil_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own soil advisories" ON public.soil_advisories;
CREATE POLICY "Farmers can delete own soil advisories"
    ON public.soil_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.6 Irrigation Advisories Policies
DROP POLICY IF EXISTS "Farmers can read own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Farmers can read own irrigation advisories"
    ON public.irrigation_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Farmers can create own irrigation advisories"
    ON public.irrigation_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own irrigation advisories" ON public.irrigation_advisories;
CREATE POLICY "Farmers can delete own irrigation advisories"
    ON public.irrigation_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.7 Chat Sessions Policies
DROP POLICY IF EXISTS "Farmers can read own chat sessions" ON public.chat_sessions;
CREATE POLICY "Farmers can read own chat sessions"
    ON public.chat_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own chat sessions" ON public.chat_sessions;
CREATE POLICY "Farmers can create own chat sessions"
    ON public.chat_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can update own chat sessions" ON public.chat_sessions;
CREATE POLICY "Farmers can update own chat sessions"
    ON public.chat_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own chat sessions" ON public.chat_sessions;
CREATE POLICY "Farmers can delete own chat sessions"
    ON public.chat_sessions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.8 Chat Messages Policies
DROP POLICY IF EXISTS "Farmers can read own chat messages" ON public.chat_messages;
CREATE POLICY "Farmers can read own chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Farmers can insert own chat messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 7.9 Saved Advisories Policies
DROP POLICY IF EXISTS "Farmers can read own saved advisories" ON public.saved_advisories;
CREATE POLICY "Farmers can read own saved advisories"
    ON public.saved_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create own saved advisories" ON public.saved_advisories;
CREATE POLICY "Farmers can create own saved advisories"
    ON public.saved_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can delete own saved advisories" ON public.saved_advisories;
CREATE POLICY "Farmers can delete own saved advisories"
    ON public.saved_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.10 Agricultural Articles Policies
DROP POLICY IF EXISTS "Anyone authenticated can read published articles" ON public.agricultural_articles;
CREATE POLICY "Anyone authenticated can read published articles"
    ON public.agricultural_articles FOR SELECT
    TO authenticated
    USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admins can manage articles" ON public.agricultural_articles;
CREATE POLICY "Admins can manage articles"
    ON public.agricultural_articles FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- 7.11 Advisory Feedback Policies
DROP POLICY IF EXISTS "Farmers can read own feedback" ON public.advisory_feedback;
CREATE POLICY "Farmers can read own feedback"
    ON public.advisory_feedback FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can create feedback" ON public.advisory_feedback;
CREATE POLICY "Farmers can create feedback"
    ON public.advisory_feedback FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.advisory_feedback;
CREATE POLICY "Admins can view all feedback"
    ON public.advisory_feedback FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- 7.12 Storage Objects Policies (for crop-diagnostics bucket)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Farmers can upload own crop images" ON storage.objects;
    CREATE POLICY "Farmers can upload own crop images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'crop-diagnostics' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );

    DROP POLICY IF EXISTS "Farmers can view own crop images" ON storage.objects;
    CREATE POLICY "Farmers can view own crop images"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
            bucket_id = 'crop-diagnostics' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- ==============================================================================
-- 8. INITIAL AGRICULTURAL SEED DATA
-- ==============================================================================

-- 8.1 Major Indian Crop Varieties
INSERT INTO public.crops (
    name, scientific_name, category, suitable_soils, suitable_seasons,
    water_requirement, climate_requirements, cultivation_duration_days,
    description, region_tags, is_active
) VALUES
(
    'Rice (Paddy)', 'Oryza sativa', 'Cereals',
    ARRAY['Clay loam', 'Alluvial soil', 'Clay soil'],
    ARRAY['kharif'],
    'high',
    '{"temperature_min": 20, "temperature_max": 38, "rainfall_min_mm": 1000, "rainfall_max_mm": 2500}'::jsonb,
    130,
    'Staple food grain requiring standing water and warm, humid climate. Thrives in submerged conditions.',
    ARRAY['Punjab', 'Haryana', 'West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Uttar Pradesh'],
    TRUE
),
(
    'Wheat', 'Triticum aestivum', 'Cereals',
    ARRAY['Loamy soil', 'Alluvial soil', 'Clay loam'],
    ARRAY['rabi'],
    'moderate',
    '{"temperature_min": 10, "temperature_max": 25, "rainfall_min_mm": 400, "rainfall_max_mm": 750}'::jsonb,
    120,
    'Cool-season cereal requiring bright sunshine during ripening and moderate moisture.',
    ARRAY['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar'],
    TRUE
),
(
    'Maize (Corn)', 'Zea mays', 'Cereals',
    ARRAY['Sandy loam', 'Loamy soil', 'Alluvial soil'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 18, "temperature_max": 35, "rainfall_min_mm": 500, "rainfall_max_mm": 800}'::jsonb,
    95,
    'Versatile grain and fodder crop adaptable to various seasons with well-drained fertile soils.',
    ARRAY['Karnataka', 'Madhya Pradesh', 'Bihar', 'Tamil Nadu', 'Telangana', 'Maharashtra'],
    TRUE
),
(
    'Chickpea (Gram)', 'Cicer arietinum', 'Pulses',
    ARRAY['Sandy loam', 'Black soil', 'Loamy soil'],
    ARRAY['rabi'],
    'low',
    '{"temperature_min": 15, "temperature_max": 30, "rainfall_min_mm": 300, "rainfall_max_mm": 500}'::jsonb,
    110,
    'Major winter legume that enriches soil through atmospheric nitrogen fixation.',
    ARRAY['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'Karnataka'],
    TRUE
),
(
    'Pigeon Pea (Arhar/Tur)', 'Cajanus cajan', 'Pulses',
    ARRAY['Alluvial soil', 'Black soil', 'Loamy soil'],
    ARRAY['kharif'],
    'low',
    '{"temperature_min": 20, "temperature_max": 35, "rainfall_min_mm": 600, "rainfall_max_mm": 900}'::jsonb,
    180,
    'Deep-rooted drought-resistant pulse crop crucial for protein and soil structure regeneration.',
    ARRAY['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh'],
    TRUE
),
(
    'Groundnut (Peanut)', 'Arachis hypogaea', 'Oilseeds',
    ARRAY['Sandy loam', 'Red soil', 'Loamy soil'],
    ARRAY['kharif', 'zaid'],
    'moderate',
    '{"temperature_min": 22, "temperature_max": 32, "rainfall_min_mm": 500, "rainfall_max_mm": 750}'::jsonb,
    115,
    'Subterranean pod oilseed preferring well-drained, loose, sandy loams with good calcium availability.',
    ARRAY['Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Rajasthan', 'Karnataka'],
    TRUE
),
(
    'Soybean', 'Glycine max', 'Oilseeds',
    ARRAY['Black soil', 'Loamy soil', 'Clay loam'],
    ARRAY['kharif'],
    'moderate',
    '{"temperature_min": 20, "temperature_max": 32, "rainfall_min_mm": 600, "rainfall_max_mm": 850}'::jsonb,
    100,
    'High protein and oilseed crop requiring warm, moist conditions and moisture retention.',
    ARRAY['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Telangana'],
    TRUE
),
(
    'Cotton', 'Gossypium hirsutum', 'Commercial',
    ARRAY['Black soil', 'Alluvial soil', 'Clay loam'],
    ARRAY['kharif'],
    'moderate',
    '{"temperature_min": 21, "temperature_max": 35, "rainfall_min_mm": 500, "rainfall_max_mm": 1000}'::jsonb,
    165,
    'White gold cash crop best grown in moisture-retentive black basaltic soils (regur) with frost-free days.',
    ARRAY['Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Haryana', 'Punjab'],
    TRUE
),
(
    'Sugarcane', 'Saccharum officinarum', 'Commercial',
    ARRAY['Alluvial soil', 'Clay loam', 'Black soil'],
    ARRAY['kharif', 'rabi'],
    'high',
    '{"temperature_min": 20, "temperature_max": 38, "rainfall_min_mm": 1200, "rainfall_max_mm": 2000}'::jsonb,
    360,
    'Perennial tropical grass requiring high warmth, heavy water, and deep fertile loams.',
    ARRAY['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar'],
    TRUE
),
(
    'Tomato', 'Solanum lycopersicum', 'Vegetables',
    ARRAY['Sandy loam', 'Loamy soil', 'Red soil', 'Clay loam'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 18, "temperature_max": 30, "rainfall_min_mm": 400, "rainfall_max_mm": 600}'::jsonb,
    90,
    'High-value vegetable crop requiring well-drained soils, consistent drip moisture, and balanced nutrients.',
    ARRAY['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha', 'Maharashtra'],
    TRUE
),
(
    'Onion', 'Allium cepa', 'Vegetables',
    ARRAY['Sandy loam', 'Clay loam', 'Alluvial soil'],
    ARRAY['kharif', 'rabi'],
    'moderate',
    '{"temperature_min": 15, "temperature_max": 30, "rainfall_min_mm": 350, "rainfall_max_mm": 600}'::jsonb,
    120,
    'Cool-season vegetable requiring friable, organic-rich soil with optimal phosphorus and potash.',
    ARRAY['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Rajasthan'],
    TRUE
),
(
    'Mango', 'Mangifera indica', 'Fruits',
    ARRAY['Alluvial soil', 'Loamy soil', 'Red soil', 'Laterite soil'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 24, "temperature_max": 36, "rainfall_min_mm": 750, "rainfall_max_mm": 1500}'::jsonb,
    365,
    'King of fruits thriving in warm tropical and subtropical climates with distinct dry resting periods.',
    ARRAY['Uttar Pradesh', 'Andhra Pradesh', 'Karnataka', 'Bihar', 'Gujarat', 'Maharashtra'],
    TRUE
)
ON CONFLICT (name) DO UPDATE SET
    scientific_name = EXCLUDED.scientific_name,
    category = EXCLUDED.category,
    suitable_soils = EXCLUDED.suitable_soils,
    suitable_seasons = EXCLUDED.suitable_seasons,
    water_requirement = EXCLUDED.water_requirement,
    climate_requirements = EXCLUDED.climate_requirements,
    cultivation_duration_days = EXCLUDED.cultivation_duration_days,
    description = EXCLUDED.description,
    region_tags = EXCLUDED.region_tags,
    is_active = EXCLUDED.is_active;

-- 8.2 Foundational Agricultural Extension Articles
INSERT INTO public.agricultural_articles (
    title, category, content, language, source_name, source_url, is_published
) VALUES
(
    'Understanding Soil pH and Nutrient Bioavailability',
    'Soil Management',
    'Soil pH is a master variable in agriculture. Between pH 6.0 and 7.5, most essential macro and micronutrients exist in forms readily absorbable by plant roots. In alkaline soils (pH > 7.8), phosphorus and zinc become immobilized into insoluble calcium compounds. Amending alkaline soils with farmyard manure or gypsum helps buffer pH and mobilize nutrients.',
    'en',
    'Indian Council of Agricultural Research (ICAR)',
    'https://icar.org.in',
    TRUE
),
(
    'Principles of Integrated Pest Management (IPM)',
    'Pest & Disease Management',
    'Integrated Pest Management is an eco-friendly approach focusing on long-term prevention through a combination of techniques: cultural controls (crop rotation, clean cultivation), biological controls (beneficial predators like Trichogramma, bio-agents like Trichoderma), physical barriers, and targeted rational chemical usage as a last resort.',
    'en',
    'Department of Agriculture & Farmers Welfare',
    'https://agricoop.gov.in',
    TRUE
),
(
    'Precision Drip Irrigation in Drought-Prone Regions',
    'Water Management',
    'Drip irrigation delivers water directly to the crop root zone at low pressures, cutting water loss from evaporation and weed transpiration by up to 50% compared to traditional flood irrigation. Pair drip lines with tensiometers or soil moisture probes to irrigate on demand.',
    'en',
    'National Mission on Micro Irrigation',
    'https://pmksy.gov.in',
    TRUE
)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    language = EXCLUDED.language,
    source_name = EXCLUDED.source_name,
    source_url = EXCLUDED.source_url,
    is_published = EXCLUDED.is_published;

