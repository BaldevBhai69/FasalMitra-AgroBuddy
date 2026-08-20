-- ============================================================================
-- 003_farmer_crops.sql
-- Description: Farmer active crops (displayed as crop cards on dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.farmer_crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_catalog_id UUID NOT NULL REFERENCES public.crop_catalog(id) ON DELETE RESTRICT,
    custom_crop_name TEXT,                   -- Optional override e.g. "North Field Tomatoes"
    land_size_acres NUMERIC(6,2) NOT NULL CHECK (land_size_acres > 0),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    irrigation_source TEXT CHECK (irrigation_source IN ('Borewell', 'Canal', 'Drip', 'Rainfed', 'Sprinkler', 'Tube Well', 'River/Pond')),
    current_status TEXT DEFAULT 'Sown' CHECK (current_status IN ('Planning', 'Sown', 'Vegetative', 'Flowering', 'Harvesting', 'Harvested')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance index for query by farmer
CREATE INDEX IF NOT EXISTS idx_farmer_crops_farmer_id ON public.farmer_crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_catalog_id ON public.farmer_crops(crop_catalog_id);

-- Enable RLS
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;

-- Strict Isolation: Farmers can only see and manage their own crops
DROP POLICY IF EXISTS "Farmers can manage own crops" ON public.farmer_crops;
CREATE POLICY "Farmers can manage own crops" 
    ON public.farmer_crops FOR ALL 
    USING ((SELECT auth.uid()) = farmer_id)
    WITH CHECK ((SELECT auth.uid()) = farmer_id);

-- PostgREST API Grants
GRANT ALL ON TABLE public.farmer_crops TO authenticated;
GRANT ALL ON TABLE public.farmer_crops TO service_role;
