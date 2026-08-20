-- ============================================================================
-- FasalMitra / AgroSmart — Full Database Schema & Seed Data (All-In-One Script)
-- Compatible with Supabase PostgreSQL 15/16 + Supavisor Port 6543
-- ============================================================================

-- 1. PROFILES TABLE & SIGNUP TRIGGER
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    state TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    village_locality TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    soil_type TEXT,
    soil_ph NUMERIC(4,2),
    soil_organic_carbon_pct NUMERIC(4,2),
    soil_nitrogen_mg_kg NUMERIC(6,2),
    soil_sand_pct NUMERIC(5,2),
    soil_silt_pct NUMERIC(5,2),
    soil_clay_pct NUMERIC(5,2),
    soil_cec NUMERIC(6,2),
    soil_data_source TEXT DEFAULT 'kaegro',
    soil_fetched_at TIMESTAMPTZ,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'mr', 'pa', 'te', 'ta')),
    preferred_ai_engine TEXT DEFAULT 'gemini' CHECK (preferred_ai_engine IN ('gemini', 'ollama')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Revoke public execution of trigger function
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CROP CATALOG
CREATE TABLE IF NOT EXISTS public.crop_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    hindi_name TEXT,
    icon_emoji TEXT DEFAULT '🌾',
    category TEXT CHECK (category IN ('Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Cash Crop', 'Oilseed', 'Spices', 'Plantation')),
    optimal_temperature_min NUMERIC(5,2),
    optimal_temperature_max NUMERIC(5,2),
    optimal_soil_moisture_min NUMERIC(5,2),
    optimal_soil_moisture_max NUMERIC(5,2),
    optimal_ph_min NUMERIC(4,2),
    optimal_ph_max NUMERIC(4,2),
    optimal_nitrogen_min NUMERIC(6,2),
    optimal_nitrogen_max NUMERIC(6,2),
    optimal_phosphorus_min NUMERIC(6,2),
    optimal_phosphorus_max NUMERIC(6,2),
    optimal_potassium_min NUMERIC(6,2),
    optimal_potassium_max NUMERIC(6,2),
    kc_initial NUMERIC(4,2) NOT NULL DEFAULT 0.40,
    kc_mid NUMERIC(4,2) NOT NULL DEFAULT 1.15,
    kc_end NUMERIC(4,2) NOT NULL DEFAULT 0.70,
    duration_days_min INT NOT NULL,
    duration_days_max INT NOT NULL,
    water_requirement_mm NUMERIC(7,2),
    sowing_seasons TEXT[],
    growth_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    fertilizer_guide JSONB NOT NULL DEFAULT '{}'::jsonb,
    msp_price_per_quintal NUMERIC(10,2),
    is_perishable BOOLEAN DEFAULT false,
    storage_duration_days INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crop_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read crop catalog" ON public.crop_catalog;
CREATE POLICY "Public read crop catalog" ON public.crop_catalog FOR SELECT TO authenticated, anon USING (true);

-- 3. FARMER ACTIVE CROPS
CREATE TABLE IF NOT EXISTS public.farmer_crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_catalog_id UUID NOT NULL REFERENCES public.crop_catalog(id) ON DELETE RESTRICT,
    custom_crop_name TEXT,
    land_size_acres NUMERIC(6,2) NOT NULL CHECK (land_size_acres > 0),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    irrigation_source TEXT CHECK (irrigation_source IN ('Borewell', 'Canal', 'Drip', 'Rainfed', 'Sprinkler', 'Tube Well', 'River/Pond')),
    current_status TEXT DEFAULT 'Sown' CHECK (current_status IN ('Planning', 'Sown', 'Vegetative', 'Flowering', 'Harvesting', 'Harvested')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_crops_farmer_id ON public.farmer_crops(farmer_id);
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Farmers can manage own crops" ON public.farmer_crops;
CREATE POLICY "Farmers can manage own crops" ON public.farmer_crops FOR ALL 
    USING ((SELECT auth.uid()) = farmer_id)
    WITH CHECK ((SELECT auth.uid()) = farmer_id);

-- 4. VIRTUAL IOT SENSORS
CREATE TABLE IF NOT EXISTS public.virtual_iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_crop_id UUID NOT NULL UNIQUE REFERENCES public.farmer_crops(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL DEFAULT 'Virtual Soil Probe v1',
    is_simulation_mode BOOLEAN DEFAULT false,
    soil_moisture_pct NUMERIC(5,2) NOT NULL DEFAULT 45.0 CHECK (soil_moisture_pct >= 0 AND soil_moisture_pct <= 100),
    nitrogen_mg_kg NUMERIC(6,2) NOT NULL DEFAULT 120.0 CHECK (nitrogen_mg_kg >= 0),
    phosphorus_mg_kg NUMERIC(6,2) NOT NULL DEFAULT 40.0 CHECK (phosphorus_mg_kg >= 0),
    potassium_mg_kg NUMERIC(6,2) NOT NULL DEFAULT 150.0 CHECK (potassium_mg_kg >= 0),
    soil_ph NUMERIC(4,2) NOT NULL DEFAULT 6.8 CHECK (soil_ph >= 0 AND soil_ph <= 14),
    soil_temperature_c NUMERIC(5,2) NOT NULL DEFAULT 24.5,
    organic_carbon_pct NUMERIC(4,2) DEFAULT 0.75 CHECK (organic_carbon_pct >= 0),
    electrical_conductivity_ds_m NUMERIC(5,2) DEFAULT 1.2 CHECK (electrical_conductivity_ds_m >= 0),
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_virtual_iot_farmer_crop_id ON public.virtual_iot_devices(farmer_crop_id);
ALTER TABLE public.virtual_iot_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Farmers access own IoT devices" ON public.virtual_iot_devices;
CREATE POLICY "Farmers access own IoT devices" ON public.virtual_iot_devices FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = virtual_iot_devices.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = virtual_iot_devices.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())));

-- 5. CROP AI CHAT CONVERSATION HISTORY
CREATE TABLE IF NOT EXISTS public.crop_ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_crop_id UUID NOT NULL REFERENCES public.farmer_crops(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    engine_used TEXT DEFAULT 'gemini-2.0-flash',
    tokens_used INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_ai_chats_crop_time ON public.crop_ai_chats(farmer_crop_id, created_at ASC);
ALTER TABLE public.crop_ai_chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Farmers access own crop chats" ON public.crop_ai_chats;
CREATE POLICY "Farmers access own crop chats" ON public.crop_ai_chats FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = crop_ai_chats.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = crop_ai_chats.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())));

-- 6. WEATHER CACHE (Ephemeral, 3-Hour TTL)
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    forecast_date DATE NOT NULL,
    temperature_max_c NUMERIC(5,2),
    temperature_min_c NUMERIC(5,2),
    precipitation_mm NUMERIC(6,2),
    precipitation_probability_pct NUMERIC(5,2),
    humidity_mean_pct NUMERIC(5,2),
    wind_speed_max_kmh NUMERIC(5,2),
    et0_fao_mm NUMERIC(6,2),
    weather_code INT,
    soil_moisture_0_7cm NUMERIC(5,4),
    soil_moisture_7_28cm NUMERIC(5,4),
    soil_temperature_0_7cm NUMERIC(5,2),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_weather_cache_coords_date UNIQUE(latitude, longitude, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_loc_date ON public.weather_cache(latitude, longitude, forecast_date DESC);
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read weather cache" ON public.weather_cache;
CREATE POLICY "Public read weather cache" ON public.weather_cache FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Service role manage weather cache" ON public.weather_cache;
CREATE POLICY "Service role manage weather cache" ON public.weather_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.cleanup_stale_weather_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.weather_cache WHERE fetched_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Restrict maintenance function to internal cron/service_role only
REVOKE ALL ON FUNCTION public.cleanup_stale_weather_cache() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_stale_weather_cache() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_stale_weather_cache() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_weather_cache() TO postgres, service_role;

-- 7. MANDI PRICES & LOGS
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    market_name TEXT NOT NULL,
    commodity TEXT NOT NULL,
    variety TEXT DEFAULT 'Other',
    arrival_date DATE NOT NULL,
    min_price_per_quintal NUMERIC(10,2) NOT NULL,
    max_price_per_quintal NUMERIC(10,2) NOT NULL,
    modal_price_per_quintal NUMERIC(10,2) NOT NULL,
    source TEXT DEFAULT 'data.gov.in',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_mandi_commodity_market_date UNIQUE(commodity, market_name, arrival_date, variety)
);

CREATE INDEX IF NOT EXISTS idx_mandi_commodity_geo_date ON public.mandi_prices(commodity, state, district, arrival_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_arrival_date ON public.mandi_prices(arrival_date DESC);
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read mandi prices" ON public.mandi_prices;
CREATE POLICY "Public read mandi prices" ON public.mandi_prices FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE IF NOT EXISTS public.mandi_price_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_date DATE NOT NULL,
    records_fetched INT DEFAULT 0,
    records_inserted INT DEFAULT 0,
    records_skipped_duplicate INT DEFAULT 0,
    error_message TEXT,
    duration_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mandi_price_sync_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read sync log for authenticated" ON public.mandi_price_sync_log;
CREATE POLICY "Allow read sync log for authenticated" ON public.mandi_price_sync_log FOR SELECT TO authenticated USING (true);

-- 8. PLANT DISEASE CATALOG
CREATE TABLE IF NOT EXISTS public.disease_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    hindi_name TEXT,
    symptoms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    cause TEXT,
    favorable_conditions TEXT,
    preventive_measures TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    organic_control TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    chemical_control TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    severity TEXT DEFAULT 'Moderate' CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_disease_crop_name UNIQUE(crop_name, disease_name)
);

CREATE INDEX IF NOT EXISTS idx_disease_catalog_crop_name ON public.disease_catalog(crop_name);
ALTER TABLE public.disease_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read disease catalog" ON public.disease_catalog;
CREATE POLICY "Public read disease catalog" ON public.disease_catalog FOR SELECT TO authenticated, anon USING (true);

-- PostgREST Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.crop_catalog, public.disease_catalog, public.weather_cache, public.mandi_prices TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
