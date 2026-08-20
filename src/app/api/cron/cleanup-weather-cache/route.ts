import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { verifyCronAuthorization } from '@/lib/utils/security';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthorized = verifyCronAuthorization(request);
    if (!isAuthorized) {
      throw ApiError.unauthorized('Invalid or missing CRON_SECRET authorization header');
    }

    const supabase = createAdminSupabaseClient();
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('weather_cache')
      .delete()
      .lt('fetched_at', cutoffDate);

    if (error) {
      throw ApiError.internal(`Failed to clean up stale weather cache: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Stale weather cache entries older than 24 hours purged successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        job: 'weather_cache_cleanup',
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// Support GET for Vercel cron invocation
export async function GET(request: Request) {
  return POST(request);
}
