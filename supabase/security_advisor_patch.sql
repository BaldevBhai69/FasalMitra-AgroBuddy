-- ============================================================================
-- 🛡️ FasalMitra — Supabase Security Advisor Hardening Patch
-- Run this in Supabase SQL Editor to resolve all 8 Security Advisor warnings.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDEN handle_new_user() (Set immutable search_path & revoke public execute)
-- ----------------------------------------------------------------------------
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

-- Prevent direct RPC invocation from client (only internal auth trigger & service_role)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- ----------------------------------------------------------------------------
-- 2. HARDEN cleanup_stale_weather_cache() (Set immutable search_path & restrict)
-- ----------------------------------------------------------------------------
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
-- 3. HARDEN weather_cache RLS POLICIES (Strict principle of least privilege)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated insert weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Public read weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Service role manage weather cache" ON public.weather_cache;

-- Public (anon & authenticated) can SELECT from weather cache
CREATE POLICY "Public read weather cache" ON public.weather_cache
    FOR SELECT TO public USING (true);

-- Only backend service_role / cron jobs can write to weather cache
CREATE POLICY "Service role manage weather cache" ON public.weather_cache
    FOR ALL TO service_role USING (true) WITH CHECK (true);
