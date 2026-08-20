-- ============================================================================
-- 005_crop_ai_chats.sql
-- Description: Per-Crop AI Chat Conversation History
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crop_ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_crop_id UUID NOT NULL REFERENCES public.farmer_crops(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    -- Context snapshot at the moment message was generated (telemetry + weather + stage)
    context_snapshot JSONB,
    engine_used TEXT DEFAULT 'gemini-2.0-flash',
    tokens_used INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Index for retrieving chronological chat history per crop
CREATE INDEX IF NOT EXISTS idx_crop_ai_chats_crop_time ON public.crop_ai_chats(farmer_crop_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.crop_ai_chats ENABLE ROW LEVEL SECURITY;

-- Strict Isolation: Farmers can only access chat threads for their crops
DROP POLICY IF EXISTS "Farmers access own crop chats" ON public.crop_ai_chats;
CREATE POLICY "Farmers access own crop chats" 
    ON public.crop_ai_chats FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.farmer_crops fc 
        WHERE fc.id = crop_ai_chats.farmer_crop_id 
          AND fc.farmer_id = (SELECT auth.uid())
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.farmer_crops fc 
        WHERE fc.id = crop_ai_chats.farmer_crop_id 
          AND fc.farmer_id = (SELECT auth.uid())
    ));

-- PostgREST API Grants
GRANT ALL ON TABLE public.crop_ai_chats TO authenticated;
GRANT ALL ON TABLE public.crop_ai_chats TO service_role;
