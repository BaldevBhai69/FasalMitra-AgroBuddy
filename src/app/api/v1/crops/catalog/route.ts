import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { CropCatalogQuerySchema } from '@/lib/validations/crop.schema';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`catalog-get-${ip}`, 100, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { searchParams } = new URL(request.url);
    const query = CropCatalogQuerySchema.parse({
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      season: searchParams.get('season') || undefined,
      limit: searchParams.get('limit') || 50,
      offset: searchParams.get('offset') || 0,
    });

    const supabase = createAdminSupabaseClient();
    let dbQuery = supabase
      .from('crop_catalog')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }
    if (query.search) {
      dbQuery = dbQuery.or(`name.ilike.%${query.search}%,hindi_name.ilike.%${query.search}%`);
    }
    if (query.season) {
      dbQuery = dbQuery.contains('sowing_seasons', [query.season]);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      throw ApiError.internal(`Failed to fetch crop catalog: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        count: count || 0,
        limit: query.limit,
        offset: query.offset,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
