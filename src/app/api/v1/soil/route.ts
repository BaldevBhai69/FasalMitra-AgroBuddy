import { NextResponse } from 'next/server';
import { soilService } from '@/lib/services/soil.service';
import { handleApiError } from '@/lib/utils/error-handler';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { ApiError } from '@/lib/utils/api-error';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`soil-query-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const village = searchParams.get('village') || undefined;
    const latStr = searchParams.get('latitude') || searchParams.get('lat');
    const lonStr = searchParams.get('longitude') || searchParams.get('lon');

    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lonStr ? parseFloat(lonStr) : null;

    const soilData = await soilService.fetchSoilBaseline(
      latitude,
      longitude,
      state,
      district,
      village
    );

    return NextResponse.json({
      success: true,
      data: soilData,
      meta: {
        query: { state, district, village, latitude, longitude },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
