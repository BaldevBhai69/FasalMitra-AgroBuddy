-- ============================================================================
-- 001_profiles.sql
-- Description: Farmer profiles table and auth user signup trigger
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    -- Area / Locality
    state TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    village_locality TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    -- Soil Baseline (fetched from Kaegro Global Soil API on signup)
    soil_type TEXT,                          -- 'Alluvial', 'Black Cotton', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clayey'
    soil_ph NUMERIC(4,2),                   -- Baseline pH from Kaegro
    soil_organic_carbon_pct NUMERIC(4,2),   -- Organic carbon %
    soil_nitrogen_mg_kg NUMERIC(6,2),       -- Baseline Nitrogen
    soil_sand_pct NUMERIC(5,2),             -- Sand fraction %
    soil_silt_pct NUMERIC(5,2),             -- Silt fraction %
    soil_clay_pct NUMERIC(5,2),             -- Clay fraction %
    soil_cec NUMERIC(6,2),                  -- Cation Exchange Capacity
    soil_data_source TEXT DEFAULT 'kaegro', -- 'kaegro', 'openlandmap', 'manual'
    soil_fetched_at TIMESTAMPTZ,            -- When soil data was last fetched
    -- Preferences
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'mr', 'pa', 'te', 'ta')),
    preferred_ai_engine TEXT DEFAULT 'gemini' CHECK (preferred_ai_engine IN ('gemini', 'ollama')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Secure RLS Policies using (SELECT auth.uid()) for optimal Postgres plan caching
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, state, district, village_locality)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'username', 'farmer_' || LEFT(NEW.id::text, 8)),
        COALESCE(NEW.raw_user_meta_data ->> 'state', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'district', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'village_locality', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PostgREST API Grants (Supabase May 2026+ compatibility)
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;
