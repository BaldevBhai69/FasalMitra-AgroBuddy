import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { SendChatMessageSchema } from '@/lib/validations/ai-chat.schema';
import { aiChatService } from '@/lib/services/ai-chat.service';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`ai-history-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { cropId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    // Verify farmer crop ownership
    const { data: crop, error: cropErr } = await supabase
      .from('farmer_crops')
      .select('id')
      .eq('id', cropId)
      .eq('farmer_id', user.id)
      .single();

    if (cropErr || !crop) {
      throw ApiError.notFound('Crop not found or unauthorized');
    }

    const { data: messages, error } = await supabase
      .from('crop_ai_chats')
      .select('*')
      .eq('farmer_crop_id', cropId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      throw ApiError.internal(`Failed to fetch chat history: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        timestamp: new Date().toISOString(),
        count: messages?.length || 0,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const ip = getClientIp(request);
    // Rate limit: 20 AI advisory messages per minute
    const { allowed } = rateLimiter.checkLimit(`ai-chat-${ip}`, 20, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { cropId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const user = authUser || { id: 'demo-farmer' };

    // Fetch user preferences for default AI engine and language
    const { data: profileData } = await supabase
      .from('profiles')
      .select('preferred_ai_engine, preferred_language')
      .eq('id', user.id)
      .single();

    const profile = profileData as any;
    const body = await request.json();
    const validated = SendChatMessageSchema.parse(body);

    const engine = validated.engine || profile?.preferred_ai_engine || 'gemini';
    const language = validated.language || profile?.preferred_language || 'en';

    const advisoryResponse = await aiChatService.sendMessage(
      cropId,
      validated.message,
      engine,
      language,
      validated.iotOverride,
      validated.modelName,
      validated.cropContext,
      validated.farmerProfile,
      validated.weatherContext
    );

    return NextResponse.json({
      success: true,
      data: advisoryResponse,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
