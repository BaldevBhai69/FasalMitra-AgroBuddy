-- ============================================================================
-- 007_mandi_prices.sql
-- Description: APMC Mandi commodity market prices & daily ingestion logs
-- ============================================================================

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

-- Comprehensive Index for filtering 30-90 day price trends by commodity and geography
CREATE INDEX IF NOT EXISTS idx_mandi_commodity_geo_date 
    ON public.mandi_prices(commodity, state, district, arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_mandi_arrival_date 
    ON public.mandi_prices(arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_mandi_commodity 
    ON public.mandi_prices(commodity);

-- Enable RLS
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read mandi prices" ON public.mandi_prices;
CREATE POLICY "Public read mandi prices" 
    ON public.mandi_prices FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- Daily ingestion tracking log
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

-- Enable RLS on sync log
ALTER TABLE public.mandi_price_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read sync log for authenticated" ON public.mandi_price_sync_log;
CREATE POLICY "Allow read sync log for authenticated" 
    ON public.mandi_price_sync_log FOR SELECT 
    TO authenticated 
    USING (true);

-- PostgREST API Grants
GRANT SELECT ON TABLE public.mandi_prices TO authenticated, anon;
GRANT ALL ON TABLE public.mandi_prices TO service_role;
GRANT SELECT ON TABLE public.mandi_price_sync_log TO authenticated;
GRANT ALL ON TABLE public.mandi_price_sync_log TO service_role;
