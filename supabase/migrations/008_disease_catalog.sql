-- ============================================================================
-- 008_disease_catalog.sql
-- Description: Plant disease agronomic catalog with symptoms, causes, controls
-- ============================================================================

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

-- Index on crop_name for fast per-crop disease lookups
CREATE INDEX IF NOT EXISTS idx_disease_catalog_crop_name ON public.disease_catalog(crop_name);

-- Enable RLS
ALTER TABLE public.disease_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read disease catalog" ON public.disease_catalog;
CREATE POLICY "Public read disease catalog" 
    ON public.disease_catalog FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- PostgREST API Grants
GRANT SELECT ON TABLE public.disease_catalog TO authenticated, anon;
GRANT ALL ON TABLE public.disease_catalog TO service_role;
