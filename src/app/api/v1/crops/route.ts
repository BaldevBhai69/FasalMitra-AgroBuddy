import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { CreateFarmerCropSchema } from '@/lib/validations/crop.schema';
import { iotService } from '@/lib/services/iot.service';
import { FarmerCropDetail } from '@/types/crop.types';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crops-list-${ip}`, 60, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    const { data: crops, error } = await supabase
      .from('farmer_crops')
      .select('*, crop_catalog:crop_catalog_id(*), virtual_iot_devices(*)')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw ApiError.internal(`Failed to fetch farmer crops: ${error.message}`);
    }

    const today = new Date();
    const enrichedCrops: FarmerCropDetail[] = ((crops || []) as any[]).map((row: any) => {
      const sowing = new Date(row.sowing_date);
      const daysSinceSown = Math.max(0, Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)));
      const maxDays = row.crop_catalog?.duration_days_max || 90;
      const stageProgressPct = Math.min(100, Math.round((daysSinceSown / maxDays) * 100));
      const estimatedDaysLeft = Math.max(0, maxDays - daysSinceSown);

      const iotDevice = Array.isArray(row.virtual_iot_devices)
        ? row.virtual_iot_devices[0]
        : row.virtual_iot_devices;

      return {
        id: row.id,
        farmer_id: row.farmer_id,
        crop_catalog_id: row.crop_catalog_id,
        custom_crop_name: row.custom_crop_name,
        land_size_acres: Number(row.land_size_acres),
        sowing_date: row.sowing_date,
        expected_harvest_date: row.expected_harvest_date,
        irrigation_source: row.irrigation_source,
        current_status: row.current_status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        crop_catalog: row.crop_catalog,
        iot_device: iotDevice || null,
        days_since_sowing: daysSinceSown,
        stage_progress_pct: stageProgressPct,
        estimated_days_left: estimatedDaysLeft,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedCrops,
      meta: {
        timestamp: new Date().toISOString(),
        count: enrichedCrops.length,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`crops-create-${ip}`, 20, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    const body = await request.json();
    const validated = CreateFarmerCropSchema.parse(body);

    // Verify crop catalog exists
    const { data: catalogItem, error: catalogErr } = await supabase
      .from('crop_catalog')
      .select('id, duration_days_max')
      .eq('id', validated.cropCatalogId)
      .single();

    if (catalogErr || !catalogItem) {
      throw ApiError.badRequest('Selected crop does not exist in master catalog');
    }

    // Auto-calculate expected harvest date if omitted
    let expectedHarvest = validated.expectedHarvestDate;
    if (!expectedHarvest) {
      const sowing = new Date(validated.sowingDate);
      sowing.setDate(sowing.getDate() + ((catalogItem as any).duration_days_max || 90));
      expectedHarvest = sowing.toISOString().split('T')[0];
    }

    const { data: createdCrop, error: insertErr } = await (supabase.from('farmer_crops') as any)
      .insert({
        farmer_id: user.id,
        crop_catalog_id: validated.cropCatalogId,
        custom_crop_name: validated.customCropName,
        land_size_acres: validated.landSizeAcres,
        sowing_date: validated.sowingDate,
        expected_harvest_date: expectedHarvest,
        irrigation_source: validated.irrigationSource,
        current_status: validated.currentStatus,
        notes: validated.notes,
      })
      .select('*, crop_catalog:crop_catalog_id(*)')
      .single();

    if (insertErr || !createdCrop) {
      throw ApiError.badRequest(`Failed to create crop: ${insertErr?.message}`);
    }

    // Automatically initialize linked Virtual IoT device
    const iotDevice = await iotService.getOrCreateDevice(createdCrop.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...createdCrop,
          iot_device: iotDevice,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
