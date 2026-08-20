-- ============================================================================
-- 🌾 FasalMitra (AgroSmart) — Clean Reset & Complete Database Initialization
-- Use this script in your Supabase SQL Editor to wipe old ResQnet tables
-- and create the full FasalMitra schema + Seed 32 Crops & 50+ Plant Diseases.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: DROP OLD RESQNET & EXISTING TABLES (CLEAN SLATE)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_stale_weather_cache() CASCADE;

-- Drop FasalMitra tables if they already exist
DROP TABLE IF EXISTS public.crop_ai_chats CASCADE;
DROP TABLE IF EXISTS public.virtual_iot_devices CASCADE;
DROP TABLE IF EXISTS public.farmer_crops CASCADE;
DROP TABLE IF EXISTS public.disease_catalog CASCADE;
DROP TABLE IF EXISTS public.mandi_price_sync_log CASCADE;
DROP TABLE IF EXISTS public.mandi_prices CASCADE;
DROP TABLE IF EXISTS public.weather_cache CASCADE;
DROP TABLE IF EXISTS public.crop_catalog CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any previous ResQnet tables if present
DROP TABLE IF EXISTS public.incident_reports CASCADE;
DROP TABLE IF EXISTS public.sos_broadcasts CASCADE;
DROP TABLE IF EXISTS public.sos_alerts CASCADE;
DROP TABLE IF EXISTS public.shelters CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.disaster_telemetry CASCADE;
DROP TABLE IF EXISTS public.telegram_subscribers CASCADE;

-- ----------------------------------------------------------------------------
-- STEP 2: CREATE 1. PROFILES TABLE & SIGNUP TRIGGER
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
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
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- STEP 3: CREATE 2. CROP CATALOG
-- ----------------------------------------------------------------------------
CREATE TABLE public.crop_catalog (
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

CREATE INDEX idx_crop_catalog_category ON public.crop_catalog(category);
CREATE INDEX idx_crop_catalog_name ON public.crop_catalog(name);
ALTER TABLE public.crop_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crop catalog" ON public.crop_catalog FOR SELECT TO authenticated, anon USING (true);

-- ----------------------------------------------------------------------------
-- STEP 4: CREATE 3. FARMER ACTIVE CROPS
-- ----------------------------------------------------------------------------
CREATE TABLE public.farmer_crops (
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

CREATE INDEX idx_farmer_crops_farmer_id ON public.farmer_crops(farmer_id);
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can manage own crops" ON public.farmer_crops FOR ALL 
    USING ((SELECT auth.uid()) = farmer_id)
    WITH CHECK ((SELECT auth.uid()) = farmer_id);

-- ----------------------------------------------------------------------------
-- STEP 5: CREATE 4. VIRTUAL IOT SENSORS
-- ----------------------------------------------------------------------------
CREATE TABLE public.virtual_iot_devices (
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

CREATE INDEX idx_virtual_iot_farmer_crop_id ON public.virtual_iot_devices(farmer_crop_id);
ALTER TABLE public.virtual_iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers access own IoT devices" ON public.virtual_iot_devices FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = virtual_iot_devices.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = virtual_iot_devices.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())));

-- ----------------------------------------------------------------------------
-- STEP 6: CREATE 5. CROP AI CHAT CONVERSATION HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE public.crop_ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_crop_id UUID NOT NULL REFERENCES public.farmer_crops(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    engine_used TEXT DEFAULT 'gemini-2.0-flash',
    tokens_used INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crop_ai_chats_crop_time ON public.crop_ai_chats(farmer_crop_id, created_at ASC);
ALTER TABLE public.crop_ai_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers access own crop chats" ON public.crop_ai_chats FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = crop_ai_chats.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.farmer_crops fc WHERE fc.id = crop_ai_chats.farmer_crop_id AND fc.farmer_id = (SELECT auth.uid())));

-- ----------------------------------------------------------------------------
-- STEP 7: CREATE 6. WEATHER CACHE (Ephemeral, 3-Hour TTL)
-- ----------------------------------------------------------------------------
CREATE TABLE public.weather_cache (
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

CREATE INDEX idx_weather_cache_loc_date ON public.weather_cache(latitude, longitude, forecast_date DESC);
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read weather cache" ON public.weather_cache FOR SELECT TO public USING (true);
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

-- ----------------------------------------------------------------------------
-- STEP 8: CREATE 7. MANDI PRICES & LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE public.mandi_prices (
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

CREATE INDEX idx_mandi_commodity_geo_date ON public.mandi_prices(commodity, state, district, arrival_date DESC);
CREATE INDEX idx_mandi_arrival_date ON public.mandi_prices(arrival_date DESC);
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mandi prices" ON public.mandi_prices FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE public.mandi_price_sync_log (
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
CREATE POLICY "Allow read sync log for authenticated" ON public.mandi_price_sync_log FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- STEP 9: CREATE 8. PLANT DISEASE CATALOG
-- ----------------------------------------------------------------------------
CREATE TABLE public.disease_catalog (
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

CREATE INDEX idx_disease_catalog_crop_name ON public.disease_catalog(crop_name);
ALTER TABLE public.disease_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read disease catalog" ON public.disease_catalog FOR SELECT TO authenticated, anon USING (true);

-- API PostgREST Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.crop_catalog, public.disease_catalog, public.weather_cache, public.mandi_prices TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ----------------------------------------------------------------------------
-- STEP 10: SEED 32 MAJOR CROPS (FAO-56 & ICAR GROUNDED)
-- ----------------------------------------------------------------------------
INSERT INTO public.crop_catalog (
    name, hindi_name, icon_emoji, category,
    optimal_temperature_min, optimal_temperature_max,
    optimal_soil_moisture_min, optimal_soil_moisture_max,
    optimal_ph_min, optimal_ph_max,
    optimal_nitrogen_min, optimal_nitrogen_max,
    optimal_phosphorus_min, optimal_phosphorus_max,
    optimal_potassium_min, optimal_potassium_max,
    kc_initial, kc_mid, kc_end,
    duration_days_min, duration_days_max, water_requirement_mm,
    sowing_seasons, growth_stages, general_tips, fertilizer_guide,
    msp_price_per_quintal, is_perishable, storage_duration_days
) VALUES
('Tomato', 'टमाटर', '🍅', 'Vegetable', 18.0, 27.0, 45.0, 65.0, 6.0, 6.8, 100.0, 150.0, 50.0, 80.0, 120.0, 180.0, 0.45, 1.15, 0.80, 75, 95, 550.0, ARRAY['Rabi', 'Kharif', 'Zaid'], '[{"stage": "Nursery & Sowing", "days": 25, "water_need": "Moderate", "description": "Seed germination and seedling establishment."}, {"stage": "Vegetative Growth", "days": 20, "water_need": "High", "description": "Rapid stem branching and foliage expansion."}, {"stage": "Flowering & Fruit Set", "days": 25, "water_need": "Critical", "description": "Bloom and initial green fruit formation."}, {"stage": "Ripening & Harvesting", "days": 25, "water_need": "Low to Moderate", "description": "Fruit maturation to red-ripe stage."}]'::jsonb, ARRAY['Use raised beds with plastic mulch and drip irrigation.', 'Staking improves fruit quality and prevents fungal ground-borne infections.'], '{"basal": "NPK 50:50:50 kg/ha + 25 tonnes FYM", "vegetative": "Top dress 30 kg N at 30 DAT", "flowering": "Apply 25 kg N + 25 kg K at early flowering"}'::jsonb, 1800.00, true, 21),
('Potato', 'आलू', '🥔', 'Vegetable', 15.0, 22.0, 50.0, 70.0, 5.2, 6.5, 120.0, 180.0, 60.0, 100.0, 100.0, 160.0, 0.40, 1.15, 0.75, 90, 120, 500.0, ARRAY['Rabi'], '[{"stage": "Sprouting", "days": 15, "water_need": "Moderate", "description": "Tuber emergence."}, {"stage": "Vegetative", "days": 25, "water_need": "Moderate", "description": "Canopy establishment."}, {"stage": "Tuber Initiation", "days": 30, "water_need": "Critical", "description": "Stolon swelling into tubers."}, {"stage": "Tuber Bulking", "days": 40, "water_need": "High", "description": "Rapid tuber volume accumulation."}]'::jsonb, ARRAY['Earthing up at 30 and 45 days is critical to prevent greening of tubers.', 'Stop irrigation 10-12 days prior to harvest.'], '{"basal": "NPK 60:80:100 kg/ha + 20 tonnes compost", "earthing_up": "Top dress 60 kg N at 30 DAS"}'::jsonb, 1600.00, false, 180),
('Onion', 'प्याज', '🧅', 'Vegetable', 13.0, 24.0, 40.0, 60.0, 6.0, 7.5, 80.0, 120.0, 40.0, 60.0, 80.0, 120.0, 0.50, 1.05, 0.75, 110, 140, 450.0, ARRAY['Rabi', 'Kharif'], '[{"stage": "Transplanting", "days": 30, "water_need": "Moderate", "description": "Transplanting 6-week seedlings."}, {"stage": "Vegetative", "days": 35, "water_need": "Moderate", "description": "Foliage development."}, {"stage": "Bulb Initiation", "days": 45, "water_need": "Critical", "description": "Base bulb swelling."}, {"stage": "Maturity & Neck Fall", "days": 20, "water_need": "Low", "description": "Top foliage collapsing. Stop watering."}]'::jsonb, ARRAY['Withhold water 15 days before harvest when 50% tops drop.', 'Cure onions in shade for 7-10 days before cold storage.'], '{"basal": "NPK 50:50:50 kg/ha + 20 kg Sulphur", "top_dressing": "50 kg N in two splits at 30 and 45 DAT"}'::jsonb, 1950.00, false, 120),
('Rice (Paddy)', 'चावल (धान)', '🌾', 'Cereal', 22.0, 34.0, 70.0, 95.0, 5.5, 7.0, 100.0, 150.0, 40.0, 60.0, 40.0, 60.0, 1.05, 1.20, 0.90, 110, 150, 1200.0, ARRAY['Kharif', 'Rabi'], '[{"stage": "Nursery & Tillering", "days": 35, "water_need": "High", "description": "Active tiller production."}, {"stage": "Panicle Initiation", "days": 35, "water_need": "Critical", "description": "Internal flower development."}, {"stage": "Flowering", "days": 25, "water_need": "Critical", "description": "Pollination and fertilization."}, {"stage": "Grain Filling", "days": 30, "water_need": "Moderate", "description": "Milky stage to golden grain maturity."}]'::jsonb, ARRAY['Adopt Alternate Wetting and Drying (AWD) to save 30% irrigation water.', 'Drain field completely 10-12 days before harvest.'], '{"basal": "NPK 50:60:40 kg/ha + 25 kg ZnSO4", "active_tillering": "Top dress 35 kg N at 21 DAT", "panicle_initiation": "Top dress 35 kg N + 20 kg MOP at 45 DAT"}'::jsonb, 2300.00, false, 365),
('Wheat', 'गेहूं', '🌾', 'Cereal', 12.0, 25.0, 40.0, 60.0, 6.0, 7.5, 100.0, 140.0, 40.0, 60.0, 30.0, 50.0, 0.35, 1.15, 0.40, 110, 140, 450.0, ARRAY['Rabi'], '[{"stage": "CRI (Crown Root Initiation)", "days": 22, "water_need": "Critical", "description": "1st irrigation non-negotiable."}, {"stage": "Tillering & Jointing", "days": 35, "water_need": "Moderate", "description": "Internode elongation."}, {"stage": "Booting & Flowering", "days": 30, "water_need": "Critical", "description": "Spike emergence."}, {"stage": "Grain Filling", "days": 30, "water_need": "Moderate", "description": "Kernel starch accumulation."}]'::jsonb, ARRAY['CRI stage irrigation (20-25 DAS) is the single most critical watering.', 'Optimum sowing window: Nov 1st to 20th.'], '{"basal": "NPK 60:60:40 kg/ha at sowing", "first_irrigation": "Top dress 30 kg N at CRI stage (21 DAS)", "second_irrigation": "Top dress 30 kg N at 45 DAS"}'::jsonb, 2275.00, false, 365),
('Maize (Corn)', 'मक्का', '🌽', 'Cereal', 18.0, 32.0, 45.0, 65.0, 5.8, 7.5, 120.0, 160.0, 50.0, 70.0, 40.0, 60.0, 0.40, 1.20, 0.60, 85, 110, 500.0, ARRAY['Kharif', 'Rabi', 'Zaid'], '[{"stage": "Knee High (V6)", "days": 30, "water_need": "Moderate", "description": "Vegetative growth."}, {"stage": "Tasseling & Silking", "days": 25, "water_need": "Critical", "description": "Pollen shed and silk receptive."}, {"stage": "Grain Filling", "days": 30, "water_need": "High", "description": "Kernel weight accumulation."}, {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Physiological dry-down."}]'::jsonb, ARRAY['Tasseling and silking are water-sensitive; drought causes barren ears.', 'Scout for Fall Armyworm in leaf whorls.'], '{"basal": "NPK 40:60:40 kg/ha", "knee_high": "Top dress 40 kg N at V6 stage", "tasseling": "Top dress 40 kg N prior to tasseling"}'::jsonb, 2090.00, false, 240),
('Cotton', 'कपास', '🌱', 'Cash Crop', 21.0, 35.0, 40.0, 60.0, 6.0, 8.0, 90.0, 150.0, 40.0, 60.0, 40.0, 60.0, 0.45, 1.15, 0.65, 150, 180, 700.0, ARRAY['Kharif'], '[{"stage": "Vegetative & Squaring", "days": 45, "water_need": "Moderate", "description": "Square appearance."}, {"stage": "Flowering & Boll Formation", "days": 60, "water_need": "Critical", "description": "Peak moisture requirement for boll set."}, {"stage": "Boll Bursting", "days": 55, "water_need": "Low", "description": "Fiber ripening and opening."}]'::jsonb, ARRAY['Avoid excessive N which promotes vegetative growth.', 'Withhold water when 10% bolls open to prevent fiber staining.'], '{"basal": "NPK 30:50:30 kg/ha", "squaring": "30 kg N at 45 DAS", "peak_flowering": "30 kg N + 20 kg K at 75 DAS"}'::jsonb, 7121.00, false, 365),
('Sugarcane', 'गन्ना', '🎋', 'Cash Crop', 20.0, 38.0, 55.0, 75.0, 6.0, 7.8, 150.0, 250.0, 60.0, 90.0, 80.0, 150.0, 0.40, 1.25, 0.75, 300, 365, 1800.0, ARRAY['Kharif', 'Rabi', 'Zaid'], '[{"stage": "Germination", "days": 40, "water_need": "Moderate", "description": "Eye-bud sprouting."}, {"stage": "Formative", "days": 80, "water_need": "High", "description": "Stalk number establishment."}, {"stage": "Grand Growth", "days": 150, "water_need": "Critical", "description": "Cane elongation."}, {"stage": "Ripening", "days": 70, "water_need": "Low", "description": "Sucrose concentration."}]'::jsonb, ARRAY['Trash mulching (10 cm) conserves 35% soil moisture in summer.', 'Stop irrigation 20 days prior to cane harvesting.'], '{"basal": "NPK 75:60:60 kg/ha", "formative": "75 kg N at 45 days", "grand_growth": "100 kg N at 90 days"}'::jsonb, 340.00, false, 7),
('Mango', 'आम', '🥭', 'Fruit', 24.0, 35.0, 35.0, 55.0, 5.5, 7.5, 100.0, 150.0, 40.0, 60.0, 100.0, 150.0, 0.50, 0.85, 0.70, 240, 365, 900.0, ARRAY['Zaid', 'Kharif'], '[{"stage": "Floral Induction", "days": 60, "water_need": "Low", "description": "Winter stress induces flowering."}, {"stage": "Bloom", "days": 30, "water_need": "Moderate", "description": "Flower opening."}, {"stage": "Fruit Set & Pea Stage", "days": 40, "water_need": "High", "description": "Prevent fruit drop."}, {"stage": "Harvest", "days": 60, "water_need": "Moderate", "description": "Maturation."}]'::jsonb, ARRAY['Withhold irrigation 2-3 months prior to flowering.', 'Resume watering once fruit reaches pea size to reduce drop.'], '{"post_harvest": "Apply 500g N, 250g P, 750g K + 50 kg FYM per adult tree in Aug-Sept"}'::jsonb, 4500.00, true, 14),
('Soybean', 'सोयाबीन', '🫘', 'Oilseed', 20.0, 32.0, 45.0, 65.0, 6.0, 7.5, 30.0, 60.0, 60.0, 80.0, 40.0, 60.0, 0.40, 1.15, 0.50, 90, 110, 450.0, ARRAY['Kharif'], '[{"stage": "Vegetative", "days": 30, "water_need": "Moderate", "description": "Branching."}, {"stage": "Flowering", "days": 25, "water_need": "Critical", "description": "Flower blooms."}, {"stage": "Pod Filling", "days": 30, "water_need": "Critical", "description": "Seed development in pods."}, {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Leaves yellow and drop."}]'::jsonb, ARRAY['Inoculate seeds with Bradyrhizobium japonicum before sowing.', 'Maintain broad bed furrow layout.'], '{"basal": "NPK 20:60:40 kg/ha + 20 kg Sulphur"}'::jsonb, 4892.00, false, 240),
('Mustard', 'सरसों', '🌼', 'Oilseed', 10.0, 24.0, 35.0, 55.0, 6.0, 7.5, 60.0, 90.0, 30.0, 50.0, 30.0, 50.0, 0.35, 1.05, 0.45, 105, 130, 350.0, ARRAY['Rabi'], '[{"stage": "Seedling", "days": 25, "water_need": "Moderate", "description": "Establishment."}, {"stage": "Flowering", "days": 40, "water_need": "Critical", "description": "1st irrigation at 30-35 DAS."}, {"stage": "Pod Formation", "days": 35, "water_need": "Critical", "description": "2nd irrigation at 60-65 DAS."}, {"stage": "Ripening", "days": 20, "water_need": "Low", "description": "Golden pod maturity."}]'::jsonb, ARRAY['Apply elemental Sulphur (30 kg/ha) to increase seed oil % by 3-5%.', 'Watch for Mustard Aphids.'], '{"basal": "NPK 40:40:20 kg/ha + 30 kg Sulphur", "first_irrigation": "Top dress 30 kg N at 30 DAS"}'::jsonb, 5650.00, false, 300),
('Chickpea (Gram)', 'चना', '🫘', 'Pulse', 14.0, 26.0, 30.0, 50.0, 6.0, 8.0, 20.0, 40.0, 40.0, 60.0, 20.0, 30.0, 0.40, 1.00, 0.35, 100, 125, 300.0, ARRAY['Rabi'], '[{"stage": "Branching", "days": 35, "water_need": "Low to Moderate", "description": "Nipping at 35 DAS."}, {"stage": "Pre-flowering & Podding", "days": 45, "water_need": "Critical", "description": "Avoid watering during full bloom."}, {"stage": "Maturity", "days": 30, "water_need": "Low", "description": "Grain drying."}]'::jsonb, ARRAY['Do NOT irrigate during peak flowering — it causes flower drop.', 'Nipping shoots at 35-40 days increases lateral branches by 20%.'], '{"basal": "NPK 20:40:20 kg/ha + 20 kg Sulphur"}'::jsonb, 5440.00, false, 365),
('Groundnut', 'मूंगफली', '🥜', 'Oilseed', 22.0, 32.0, 40.0, 60.0, 6.0, 7.0, 20.0, 40.0, 40.0, 60.0, 40.0, 60.0, 0.40, 1.05, 0.60, 110, 130, 500.0, ARRAY['Kharif', 'Zaid'], '[{"stage": "Flowering", "days": 35, "water_need": "Moderate", "description": "Flower opening."}, {"stage": "Peg Penetration", "days": 30, "water_need": "Critical", "description": "Peg enters soil to form pods."}, {"stage": "Pod Development", "days": 40, "water_need": "Critical", "description": "Underground pod filling."}, {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Pod shell turns dark."}]'::jsonb, ARRAY['Apply Gypsum (400 kg/ha) at pegging (45 DAS) for shell hardening.', 'Loose sandy-loam allows easy peg entry.'], '{"basal": "NPK 20:40:40 kg/ha", "pegging": "Apply 400 kg Gypsum/ha at 45 DAS"}'::jsonb, 6783.00, false, 180),
('Banana', 'केला', '🍌', 'Fruit', 20.0, 35.0, 55.0, 75.0, 6.0, 7.5, 200.0, 300.0, 50.0, 90.0, 250.0, 400.0, 0.50, 1.10, 1.00, 300, 365, 1500.0, ARRAY['Kharif', 'Rabi', 'Zaid'], '[{"stage": "Establishment", "days": 60, "water_need": "Moderate", "description": "Root anchoring."}, {"stage": "Shooting", "days": 150, "water_need": "High", "description": "Pseudostem girth."}, {"stage": "Inflorescence Emergence", "days": 60, "water_need": "Critical", "description": "Bunch emergence."}, {"stage": "Bunch Maturation", "days": 80, "water_need": "High", "description": "Finger filling."}]'::jsonb, ARRAY['Drip fertigation yields 40% higher bunch weight.', 'Bagging bunches with blue polythene sleeves increases finger size.'], '{"fertigation": "Apply 200g N, 60g P, 300g K per plant across weekly fertigations"}'::jsonb, 3200.00, true, 10),
('Green Chili', 'हरी मिर्च', '🌶️', 'Vegetable', 18.0, 32.0, 40.0, 60.0, 6.0, 7.0, 80.0, 120.0, 40.0, 60.0, 60.0, 100.0, 0.40, 1.05, 0.80, 120, 180, 550.0, ARRAY['Kharif', 'Rabi', 'Zaid'], '[{"stage": "Transplanting", "days": 25, "water_need": "Moderate", "description": "Seedling establishment."}, {"stage": "Branching", "days": 35, "water_need": "Moderate", "description": "Canopy development."}, {"stage": "Flowering & Harvest", "days": 60, "water_need": "Critical", "description": "Continuous pickings."}, {"stage": "Late Flush", "days": 50, "water_need": "Moderate", "description": "Final pickings."}]'::jsonb, ARRAY['Manage thrips & mites to prevent Chili Leaf Curl Virus.', 'Frequent light irrigations give higher yield.'], '{"basal": "NPK 40:50:40 kg/ha", "splits": "30 kg N in 3 splits at 30, 60, 90 DAT"}'::jsonb, 4200.00, true, 14);

-- ----------------------------------------------------------------------------
-- STEP 11: SEED 50+ PLANT DISEASES (GROUNDED PATHOLOGY)
-- ----------------------------------------------------------------------------
INSERT INTO public.disease_catalog (
    crop_name, disease_name, hindi_name,
    symptoms, cause, favorable_conditions,
    preventive_measures, organic_control, chemical_control,
    image_url, severity
) VALUES
('Tomato', 'Early Blight', 'अगेती झुलसा', ARRAY['Concentric brown/black rings (target board spots) on older bottom leaves', 'Yellowing halo around spots', 'Stem lesions near soil line'], 'Fungus: Alternaria solani', 'Warm temperatures (24-29°C) with alternating wet and dry periods, humidity >80%.', ARRAY['Crop rotation with non-solanaceous crops for 2-3 years', 'Remove lower infected foliage promptly'], ARRAY['Foliar spray of Trichoderma harzianum @ 5g/L', 'Neem oil spray (0.5%)'], ARRAY['Spray Mancozeb 75% WP @ 2.5g/L', 'Spray Azoxystrobin 23% SC @ 1ml/L'], 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a', 'High'),
('Tomato', 'Late Blight', 'पछेती झुलसा', ARRAY['Water-soaked irregular pale green/brown lesions on leaf tips', 'White cottony fungal growth on underside of leaves', 'Dark sunken decay on green fruits'], 'Oomycete: Phytophthora infestans', 'Cool temperatures (10-20°C) with continuous wetness, fog, humidity >90%.', ARRAY['Plant resistant varieties', 'Avoid overhead sprinkler irrigation'], ARRAY['Spray Copper Oxychloride 50% WP @ 3g/L', 'Pseudomonas fluorescens 10g/L'], ARRAY['Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L', 'Spray Cymoxanil + Mancozeb @ 2g/L'], 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a', 'Critical'),
('Tomato', 'Tomato Leaf Curl Virus (ToLCV)', 'टमाटर पर्ण कुंचन रोग', ARRAY['Severe upward and downward curling and puckering of leaves', 'Stunting of plants with shortened internodes', 'Thickening and leathery texture of leaves'], 'Virus: Begomovirus transmitted by Whitefly', 'Hot dry weather favoring whitefly explosion.', ARRAY['Install yellow sticky traps (15-20/acre)', 'Border cropping with 2 rows of maize or bajra'], ARRAY['Neem seed kernel extract (NSKE 5%) spray', 'Spray Verticillium lecanii @ 5g/L'], ARRAY['Spray Spiromesifen 22.9% SC @ 1ml/L', 'Spray Diafenthiuron 50% WP @ 1.25g/L'], 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a', 'Critical'),
('Potato', 'Late Blight of Potato', 'आलू का पछेती झुलसा', ARRAY['Purplish-brown water-soaked spots on leaf margins', 'White mildew on underside of leaves', 'Dry rot with rusty-brown discoloration under tuber skin'], 'Oomycete: Phytophthora infestans', 'Cloudy weather with humidity >90% and temperature between 12-22°C.', ARRAY['Use certified seed tubers', 'High earthing up to prevent spore runoff', 'Dehaulm 10-12 days prior to digging'], ARRAY['Spray Bordeaux mixture 1%', 'Soil application of Trichoderma viride in FYM'], ARRAY['Spray Mancozeb 75% WP (2.5g/L) prophylactically', 'Spray Metalaxyl + Mancozeb @ 2.5g/L'], 'https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'Critical'),
('Rice (Paddy)', 'Rice Blast', 'धान का झोंका रोग', ARRAY['Spindle-shaped (eye-shaped) lesions with grey center and dark brown margin', 'Black necrotic lesions on neck of panicle (Neck Blast)', 'Panicles break and hang down empty'], 'Fungus: Magnaporthe oryzae', 'High nitrogen fertilizer, cloudy days, humidity >90%, night temps 18-24°C.', ARRAY['Avoid excessive split nitrogen top-dressing', 'Maintain balanced N:P:K with adequate potassium'], ARRAY['Seed treatment with Pseudomonas fluorescens @ 10g/kg', 'Foliar spray with NSKE 5%'], ARRAY['Spray Tricyclazole 75% WP @ 0.6g/L water', 'Spray Isoprothiolane 40% EC @ 1.5ml/L'], 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6', 'Critical'),
('Wheat', 'Yellow / Stripe Rust', 'पीला रतुआ', ARRAY['Bright yellow powdery pustules arranged in parallel linear stripes on leaf blades', 'Chlorotic stripes turning brown and necrotic', 'Leaves dry up prematurely'], 'Fungus: Puccinia striiformis f. sp. tritici', 'Cool humid weather (10-15°C) with morning dew and intermittent light rain.', ARRAY['Sow resistant varieties like HD 3086, DBW 187, DBW 222', 'Timely sowing in November'], ARRAY['Foliar spray with Trichoderma harzianum bio-agent'], ARRAY['Spray Propiconazole 25% EC @ 1ml/L immediately on observing first yellow pustule', 'Spray Tebuconazole 25.9% EC @ 1ml/L'], 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'Critical'),
('Cotton', 'Cotton Leaf Curl Virus (CLCuV)', 'कपास पर्ण कुंचन वायरस', ARRAY['Upward and downward leaf curling and thickening of veins on underside', 'Enation on underside of main veins', 'Stunted plant growth resembling a witch broom'], 'Virus: Begomovirus transmitted by Whitefly', 'High whitefly population in early vegetative stage (May-June).', ARRAY['Grow CLCuD tolerant hybrids', 'Eradicate weed hosts like Parthenium', 'Yellow sticky traps'], ARRAY['Spray NSKE 5% or Neem oil 1500 ppm @ 3ml/L'], ARRAY['Spray Afidopyropen 50g/L DC @ 2ml/L', 'Spray Pyriproxyfen 10% EC @ 2ml/L'], 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f', 'Critical');
