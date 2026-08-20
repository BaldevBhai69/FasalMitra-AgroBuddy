import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { UpdateIoTSensorsSchema, IoTSimulationPresetSchema } from '@/lib/validations/iot.schema';
import { iotService } from '@/lib/services/iot.service';
import { CropCatalog } from '@/types/crop.types';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`iot-get-${ip}`, 60, 60000);
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

    // Verify ownership
    const { data: crop, error: cropErr } = await supabase
      .from('farmer_crops')
      .select('id, crop_catalog:crop_catalog_id(*)')
      .eq('id', cropId)
      .eq('farmer_id', user.id)
      .single();

    if (cropErr || !crop) {
      throw ApiError.notFound('Crop not found or unauthorized');
    }

    const catalog = (crop as any).crop_catalog as CropCatalog;
    const device = await iotService.getOrCreateDevice(cropId);
    const health = iotService.evaluateHealth(device, catalog);

    return NextResponse.json({
      success: true,
      data: {
        device,
        health,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`iot-patch-${ip}`, 60, 60000);
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

    // Verify ownership
    const { data: crop, error: cropErr } = await supabase
      .from('farmer_crops')
      .select('id, crop_catalog:crop_catalog_id(*)')
      .eq('id', cropId)
      .eq('farmer_id', user.id)
      .single();

    if (cropErr || !crop) {
      throw ApiError.notFound('Crop not found or unauthorized');
    }

    const catalog = (crop as any).crop_catalog as CropCatalog;
    const body = await request.json();

    let updatedDevice;

    // Check if applying a simulation preset or manual slider values
    if (body.preset) {
      const { preset } = IoTSimulationPresetSchema.parse(body);
      updatedDevice = await iotService.applyPreset(cropId, preset);
    } else {
      const validated = UpdateIoTSensorsSchema.parse(body);
      updatedDevice = await iotService.updateTelemetry(cropId, validated);
    }

    const health = iotService.evaluateHealth(updatedDevice, catalog);

    return NextResponse.json({
      success: true,
      data: {
        device: updatedDevice,
        health,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
