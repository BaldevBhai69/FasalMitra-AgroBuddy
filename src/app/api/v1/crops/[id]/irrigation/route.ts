import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { weatherService } from '@/lib/services/weather.service';
import { iotService } from '@/lib/services/iot.service';
import { irrigationService } from '@/lib/services/irrigation.service';
import { CropCatalog, FarmerCrop } from '@/types/crop.types';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crop-irrigation-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    // Fetch crop, catalog, profile
    const { data: cropData, error: cropErr } = await supabase
      .from('farmer_crops')
      .select('*, crop_catalog:crop_catalog_id(*), profile:farmer_id(*)')
      .eq('id', id)
      .eq('farmer_id', user.id)
      .single();

    if (cropErr || !cropData) {
      throw ApiError.notFound('Crop not found or access denied');
    }

    const crop = cropData as unknown as FarmerCrop;
    const catalog = (cropData as Record<string, unknown>).crop_catalog as CropCatalog;
    const profile = (cropData as Record<string, unknown>).profile as Record<string, unknown>;

    // Fetch virtual IoT probe state
    const iotDevice = await iotService.getOrCreateDevice(crop.id);

    // Fetch live/cached Open-Meteo weather
    const lat = Number(profile.latitude || 28.6139);
    const lon = Number(profile.longitude || 77.2090);
    const weather = await weatherService.getForecast(lat, lon);

    // Compute algorithmic irrigation recommendation
    const recommendation = irrigationService.calculateIrrigationAdvice(crop, catalog, iotDevice, weather);

    return NextResponse.json({
      success: true,
      data: recommendation,
      meta: {
        timestamp: new Date().toISOString(),
        cropId: crop.id,
        cropName: catalog.name,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
