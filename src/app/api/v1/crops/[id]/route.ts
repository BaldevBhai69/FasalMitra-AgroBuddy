import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { UpdateFarmerCropSchema } from '@/lib/validations/crop.schema';
import { iotService } from '@/lib/services/iot.service';
import { FarmerCropDetail } from '@/types/crop.types';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crop-detail-${ip}`, 60, 60000);
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

    const { data: cropData, error } = await supabase
      .from('farmer_crops')
      .select('*, crop_catalog:crop_catalog_id(*)')
      .eq('id', id)
      .eq('farmer_id', user.id)
      .single();

    if (error || !cropData) {
      throw ApiError.notFound('Farmer crop not found or access denied');
    }

    const crop = cropData as any;
    const iotDevice = await iotService.getOrCreateDevice(crop.id);
    const healthStatus = iotService.evaluateHealth(iotDevice, crop.crop_catalog);

    const today = new Date();
    const sowing = new Date(crop.sowing_date);
    const daysSinceSown = Math.max(0, Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)));
    const maxDays = crop.crop_catalog?.duration_days_max || 90;
    const stageProgressPct = Math.min(100, Math.round((daysSinceSown / maxDays) * 100));
    const estimatedDaysLeft = Math.max(0, maxDays - daysSinceSown);

    const responseData: FarmerCropDetail & { health_status: typeof healthStatus } = {
      id: crop.id,
      farmer_id: crop.farmer_id,
      crop_catalog_id: crop.crop_catalog_id,
      custom_crop_name: crop.custom_crop_name,
      land_size_acres: Number(crop.land_size_acres),
      sowing_date: crop.sowing_date,
      expected_harvest_date: crop.expected_harvest_date,
      irrigation_source: crop.irrigation_source,
      current_status: crop.current_status,
      notes: crop.notes,
      created_at: crop.created_at,
      updated_at: crop.updated_at,
      crop_catalog: crop.crop_catalog,
      iot_device: iotDevice,
      days_since_sowing: daysSinceSown,
      stage_progress_pct: stageProgressPct,
      estimated_days_left: estimatedDaysLeft,
      health_status: healthStatus,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crop-update-${ip}`, 30, 60000);
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

    const body = await request.json();
    const validated = UpdateFarmerCropSchema.parse(body);

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.customCropName !== undefined) updatePayload.custom_crop_name = validated.customCropName;
    if (validated.landSizeAcres !== undefined) updatePayload.land_size_acres = validated.landSizeAcres;
    if (validated.sowingDate !== undefined) updatePayload.sowing_date = validated.sowingDate;
    if (validated.expectedHarvestDate !== undefined) updatePayload.expected_harvest_date = validated.expectedHarvestDate;
    if (validated.irrigationSource !== undefined) updatePayload.irrigation_source = validated.irrigationSource;
    if (validated.currentStatus !== undefined) updatePayload.current_status = validated.currentStatus;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;

    const { data: updated, error } = await (supabase.from('farmer_crops') as any)
      .update(updatePayload)
      .eq('id', id)
      .eq('farmer_id', user.id)
      .select('*, crop_catalog:crop_catalog_id(*)')
      .single();

    if (error || !updated) {
      throw ApiError.badRequest(`Failed to update crop: ${error?.message}`);
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crop-delete-${ip}`, 20, 60000);
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

    const { error } = await supabase
      .from('farmer_crops')
      .delete()
      .eq('id', id)
      .eq('farmer_id', user.id);

    if (error) {
      throw ApiError.internal(`Failed to delete crop: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Crop and linked virtual telemetry deleted successfully' },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
