import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { WeatherQuerySchema } from '@/lib/validations/weather.schema';
import { weatherService } from '@/lib/services/weather.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`weather-get-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { searchParams } = new URL(request.url);
    const query = WeatherQuerySchema.parse({
      latitude: searchParams.get('latitude') || searchParams.get('lat'),
      longitude: searchParams.get('longitude') || searchParams.get('lon'),
      forceFresh: searchParams.get('fresh') || false,
    });

    const forecast = await weatherService.getForecast(
      query.latitude,
      query.longitude,
      query.forceFresh
    );

    return NextResponse.json({
      success: true,
      data: forecast,
      meta: {
        timestamp: new Date().toISOString(),
        attribution: 'Weather data by Open-Meteo.com (CC-BY 4.0)',
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
