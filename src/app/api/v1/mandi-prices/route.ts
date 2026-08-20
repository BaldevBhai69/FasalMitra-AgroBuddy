import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { MandiQuerySchema } from '@/lib/validations/mandi.schema';
import { mandiService } from '@/lib/services/mandi.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`mandi-query-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { searchParams } = new URL(request.url);
    const query = MandiQuerySchema.parse({
      commodity: searchParams.get('commodity') || 'Wheat',
      state: searchParams.get('state') || undefined,
      district: searchParams.get('district') || undefined,
      days: searchParams.get('days') || 30,
    });

    const [{ trends, records }, advice] = await Promise.all([
      mandiService.getPriceTrend(query.commodity, query.state, query.district, query.days),
      mandiService.getSellVsHoldAdvice(query.commodity, query.state, query.district),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        commodity: query.commodity,
        state: query.state || 'All States',
        district: query.district || 'All Districts',
        trends,
        records: records.slice(0, 50),
        advice,
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Open Government Data Platform India (data.gov.in)',
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
