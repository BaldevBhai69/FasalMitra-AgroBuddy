-- ============================================================================
-- 004_virtual_iot.sql
-- Description: Virtual IoT Digital Twin telemetry (Current session state per crop)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.virtual_iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_crop_id UUID NOT NULL UNIQUE REFERENCES public.farmer_crops(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL DEFAULT 'Virtual Soil Probe v1',
    is_simulation_mode BOOLEAN DEFAULT false,
    -- Current Readings (Real-time telemetry updated via interactive sliders or live sync)
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

-- Index on farmer_crop_id
CREATE INDEX IF NOT EXISTS idx_virtual_iot_farmer_crop_id ON public.virtual_iot_devices(farmer_crop_id);

-- Enable RLS
ALTER TABLE public.virtual_iot_devices ENABLE ROW LEVEL SECURITY;

-- Strict Isolation: Farmers can only access IoT devices linked to their crops
DROP POLICY IF EXISTS "Farmers access own IoT devices" ON public.virtual_iot_devices;
CREATE POLICY "Farmers access own IoT devices" 
    ON public.virtual_iot_devices FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.farmer_crops fc 
        WHERE fc.id = virtual_iot_devices.farmer_crop_id 
          AND fc.farmer_id = (SELECT auth.uid())
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.farmer_crops fc 
        WHERE fc.id = virtual_iot_devices.farmer_crop_id 
          AND fc.farmer_id = (SELECT auth.uid())
    ));

-- PostgREST API Grants
GRANT ALL ON TABLE public.virtual_iot_devices TO authenticated;
GRANT ALL ON TABLE public.virtual_iot_devices TO service_role;
