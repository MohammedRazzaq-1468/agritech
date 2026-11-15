-- ==============================================================================
-- AgriSmart AI - Production PostgreSQL Database Migration
-- Version: 20261106000000_create_agrismart_schema.sql
-- ==============================================================================

-- 1. Enable Cryptographic & UUID Extensions
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

-- 2.2 Crop Knowledge Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
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

-- 2.3 Crop Recommendations Table
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

-- 2.4 Disease Analyses Table
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

-- 2.5 Soil Advisories Table
CREATE TABLE IF NOT EXISTS public.soil_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT,
    soil_type TEXT,
    soil_test_data JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Irrigation Advisories Table
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

-- 2.7 Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Agriculture Consultation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Saved Advisories Table
CREATE TABLE IF NOT EXISTS public.saved_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    advisory_type TEXT NOT NULL,
    advisory_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, advisory_type, advisory_id)
);

-- 2.10 Agricultural Articles Table
CREATE TABLE IF NOT EXISTS public.agricultural_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
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

-- 2.11 Advisory Feedback Table
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
-- 3. INDEXES FOR PERFORMANCE
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
-- 4. REUSABLE UPDATED_AT TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_articles_updated_at
    BEFORE UPDATE ON public.agricultural_articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
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
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
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

-- 6.1 Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile non-role fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6.2 Crops Knowledge Policies
CREATE POLICY "Anyone authenticated can view active crops"
    ON public.crops FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage crops"
    ON public.crops FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- 6.3 Crop Recommendations Policies
CREATE POLICY "Farmers can read own recommendations"
    ON public.crop_recommendations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own recommendations"
    ON public.crop_recommendations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own recommendations"
    ON public.crop_recommendations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.4 Disease Analyses Policies
CREATE POLICY "Farmers can read own disease analyses"
    ON public.disease_analyses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own disease analyses"
    ON public.disease_analyses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own disease analyses"
    ON public.disease_analyses FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.5 Soil Advisories Policies
CREATE POLICY "Farmers can read own soil advisories"
    ON public.soil_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own soil advisories"
    ON public.soil_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own soil advisories"
    ON public.soil_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.6 Irrigation Advisories Policies
CREATE POLICY "Farmers can read own irrigation advisories"
    ON public.irrigation_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own irrigation advisories"
    ON public.irrigation_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own irrigation advisories"
    ON public.irrigation_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.7 Chat Sessions Policies
CREATE POLICY "Farmers can read own chat sessions"
    ON public.chat_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own chat sessions"
    ON public.chat_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update own chat sessions"
    ON public.chat_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own chat sessions"
    ON public.chat_sessions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.8 Chat Messages Policies
CREATE POLICY "Farmers can read own chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own chat messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6.9 Saved Advisories Policies
CREATE POLICY "Farmers can read own saved advisories"
    ON public.saved_advisories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create own saved advisories"
    ON public.saved_advisories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete own saved advisories"
    ON public.saved_advisories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.10 Agricultural Articles Policies
CREATE POLICY "Anyone authenticated can read published articles"
    ON public.agricultural_articles FOR SELECT
    TO authenticated
    USING (is_published = TRUE);

CREATE POLICY "Admins can manage articles"
    ON public.agricultural_articles FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- 6.11 Advisory Feedback Policies
CREATE POLICY "Farmers can read own feedback"
    ON public.advisory_feedback FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create feedback"
    ON public.advisory_feedback FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
    ON public.advisory_feedback FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

