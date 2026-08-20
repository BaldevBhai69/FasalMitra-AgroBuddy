-- ============================================================================
-- 006_weather_cache.sql
-- Description: Ephemeral 16-Day Weather & Soil moisture forecast cache (3-Hour TTL)
-- ============================================================================

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

-- Index for speedy geospatial lookup of recent forecasts
CREATE INDEX IF NOT EXISTS idx_weather_cache_loc_date 
    ON public.weather_cache(latitude, longitude, forecast_date DESC);

CREATE INDEX IF NOT EXISTS idx_weather_cache_fetched_at 
    ON public.weather_cache(fetched_at);

-- Enable RLS
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Public read access to cached weather forecast
DROP POLICY IF EXISTS "Public read weather cache" ON public.weather_cache;
CREATE POLICY "Public read weather cache" 
    ON public.weather_cache FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- Allow authenticated users / service role to upsert weather cache
DROP POLICY IF EXISTS "Allow authenticated insert weather cache" ON public.weather_cache;
CREATE POLICY "Allow authenticated insert weather cache" 
    ON public.weather_cache FOR ALL 
    TO authenticated, service_role 
    USING (true) 
    WITH CHECK (true);

-- Auto-cleanup function: Deletes weather cache records older than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_stale_weather_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.weather_cache 
    WHERE fetched_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PostgREST API Grants
GRANT SELECT, INSERT, UPDATE ON TABLE public.weather_cache TO authenticated, anon;
GRANT ALL ON TABLE public.weather_cache TO service_role;
