-- ============================================================================
-- 002_crop_catalog.sql
-- Description: Agronomic Master Crop Catalog reference data
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crop_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    hindi_name TEXT,
    icon_emoji TEXT DEFAULT '🌾',
    category TEXT CHECK (category IN ('Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Cash Crop', 'Oilseed', 'Spices', 'Plantation')),
    -- Optimal Growing Conditions
    optimal_temperature_min NUMERIC(5,2),
    optimal_temperature_max NUMERIC(5,2),
    optimal_soil_moisture_min NUMERIC(5,2),  -- in %
    optimal_soil_moisture_max NUMERIC(5,2),
    optimal_ph_min NUMERIC(4,2),
    optimal_ph_max NUMERIC(4,2),
    optimal_nitrogen_min NUMERIC(6,2),       -- mg/kg
    optimal_nitrogen_max NUMERIC(6,2),
    optimal_phosphorus_min NUMERIC(6,2),
    optimal_phosphorus_max NUMERIC(6,2),
    optimal_potassium_min NUMERIC(6,2),
    optimal_potassium_max NUMERIC(6,2),
    -- FAO Crop Coefficients (for Penman-Monteith ET calculation)
    kc_initial NUMERIC(4,2) NOT NULL DEFAULT 0.40,
    kc_mid NUMERIC(4,2) NOT NULL DEFAULT 1.15,
    kc_end NUMERIC(4,2) NOT NULL DEFAULT 0.70,
    -- Growing Info
    duration_days_min INT NOT NULL,
    duration_days_max INT NOT NULL,
    water_requirement_mm NUMERIC(7,2),
    sowing_seasons TEXT[],                   -- {'Kharif', 'Rabi', 'Zaid'}
    growth_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    fertilizer_guide JSONB NOT NULL DEFAULT '{}'::jsonb,
    msp_price_per_quintal NUMERIC(10,2),     -- Official Annual Govt of India Minimum Support Price
    -- Sell/Hold Decision Matrix Fields
    is_perishable BOOLEAN DEFAULT false,
    storage_duration_days INT DEFAULT 30,    -- Max cold storage shelf life in days
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_crop_catalog_category ON public.crop_catalog(category);
CREATE INDEX IF NOT EXISTS idx_crop_catalog_name ON public.crop_catalog(name);

-- Enable RLS
ALTER TABLE public.crop_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated & anonymous users
DROP POLICY IF EXISTS "Public read crop catalog" ON public.crop_catalog;
CREATE POLICY "Public read crop catalog" 
    ON public.crop_catalog FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- PostgREST API Grants
GRANT SELECT ON TABLE public.crop_catalog TO authenticated, anon;
GRANT ALL ON TABLE public.crop_catalog TO service_role;
