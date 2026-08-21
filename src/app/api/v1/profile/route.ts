import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { UpdateProfileSchema } from '@/lib/validations/profile.schema';
import { soilService } from '@/lib/services/soil.service';
import { resolveIndianCoordinates } from '@/lib/utils/geocoding';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`profile-get-${ip}`, 60, 60000);
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      throw ApiError.notFound('Farmer profile not found');
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`profile-patch-${ip}`, 30, 60000);
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
    const validated = UpdateProfileSchema.parse(body);

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.fullName !== undefined) updatePayload.full_name = validated.fullName;
    if (validated.phoneNumber !== undefined) updatePayload.phone_number = validated.phoneNumber;
    if (validated.state !== undefined) updatePayload.state = validated.state;
    if (validated.district !== undefined) updatePayload.district = validated.district;
    if (validated.villageLocality !== undefined) updatePayload.village_locality = validated.villageLocality;
    if (validated.latitude !== undefined) updatePayload.latitude = validated.latitude;
    if (validated.longitude !== undefined) updatePayload.longitude = validated.longitude;
    if (validated.preferredLanguage !== undefined) updatePayload.preferred_language = validated.preferredLanguage;
    if (validated.preferredAiEngine !== undefined) updatePayload.preferred_ai_engine = validated.preferredAiEngine;

    // If location changed and soil baseline is not manually overridden, auto-fetch live soil baseline
    if (
      (validated.latitude !== undefined || validated.longitude !== undefined || validated.state !== undefined || validated.district !== undefined) &&
      !validated.soilType
    ) {
      const coords = resolveIndianCoordinates(
        validated.state,
        validated.district,
        validated.villageLocality,
        validated.latitude,
        validated.longitude
      );
      updatePayload.latitude = coords.lat;
      updatePayload.longitude = coords.lon;

      const soil = await soilService.fetchSoilBaseline(coords.lat, coords.lon, validated.state, validated.district, validated.villageLocality);
      updatePayload.soil_type = soil.soilType;
      updatePayload.soil_ph = soil.soilPh;
      updatePayload.soil_organic_carbon_pct = soil.soilOrganicCarbonPct;
      updatePayload.soil_nitrogen_mg_kg = soil.soilNitrogenMgKg;
      updatePayload.soil_phosphorus_mg_kg = soil.soilPhosphorusMgKg;
      updatePayload.soil_potassium_mg_kg = soil.soilPotassiumMgKg;
      updatePayload.soil_magnesium_mg_kg = soil.soilMagnesiumMgKg;
      updatePayload.soil_calcium_mg_kg = soil.soilCalciumMgKg;
      updatePayload.soil_sulfur_mg_kg = soil.soilSulfurMgKg;
      updatePayload.soil_ec_ds_m = soil.soilEcDsM;
      updatePayload.soil_sand_pct = soil.soilSandPct;
      updatePayload.soil_silt_pct = soil.soilSiltPct;
      updatePayload.soil_clay_pct = soil.soilClayPct;
      updatePayload.soil_cec = soil.soilCec;
      updatePayload.soil_data_source = soil.dataSource;
      updatePayload.soil_fetched_at = new Date().toISOString();
    } else {
      if (validated.soilType !== undefined) updatePayload.soil_type = validated.soilType;
      if (validated.soilPh !== undefined) updatePayload.soil_ph = validated.soilPh;
      if (validated.soilOrganicCarbonPct !== undefined) updatePayload.soil_organic_carbon_pct = validated.soilOrganicCarbonPct;
      if (validated.soilNitrogenMgKg !== undefined) updatePayload.soil_nitrogen_mg_kg = validated.soilNitrogenMgKg;
      if (validated.soilPhosphorusMgKg !== undefined) updatePayload.soil_phosphorus_mg_kg = validated.soilPhosphorusMgKg;
      if (validated.soilPotassiumMgKg !== undefined) updatePayload.soil_potassium_mg_kg = validated.soilPotassiumMgKg;
      if (validated.soilMagnesiumMgKg !== undefined) updatePayload.soil_magnesium_mg_kg = validated.soilMagnesiumMgKg;
      if (validated.soilCalciumMgKg !== undefined) updatePayload.soil_calcium_mg_kg = validated.soilCalciumMgKg;
      if (validated.soilSulfurMgKg !== undefined) updatePayload.soil_sulfur_mg_kg = validated.soilSulfurMgKg;
      if (validated.soilEcDsM !== undefined) updatePayload.soil_ec_ds_m = validated.soilEcDsM;
      if (validated.soilSandPct !== undefined) updatePayload.soil_sand_pct = validated.soilSandPct;
      if (validated.soilSiltPct !== undefined) updatePayload.soil_silt_pct = validated.soilSiltPct;
      if (validated.soilClayPct !== undefined) updatePayload.soil_clay_pct = validated.soilClayPct;
      if (validated.soilCec !== undefined) updatePayload.soil_cec = validated.soilCec;
    }

    const { data: updated, error } = await (supabase.from('profiles') as any)
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error || !updated) {
      throw ApiError.badRequest(`Failed to update profile: ${error?.message}`);
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimiter.checkLimit(`profile-post-${ip}`, 30, 60000);
    if (!allowed) {
      throw ApiError.rateLimit();
    }

    const body = await request.json();
    const action = body.action || 'sync';
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    if (!email) {
      throw ApiError.badRequest('Email is required');
    }

    let adminClient: any = null;
    try {
      adminClient = createAdminSupabaseClient();
    } catch {
      // Admin client not configured
    }

    // =========================================================================
    // 1. ACTION: LOGIN (Fetch existing profile without overwriting)
    // =========================================================================
    if (action === 'login') {
      if (adminClient) {
        // Query profiles table first
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile) {
          return NextResponse.json({
            success: true,
            data: existingProfile,
            persistedInBackend: true,
          });
        }

        // Check in auth.users
        const { data: userList } = await adminClient.auth.admin.listUsers();
        const existingUser = userList?.users?.find(
          (u: any) => u.email?.toLowerCase() === email
        );

        if (existingUser) {
          const meta = existingUser.user_metadata || {};
          const fallbackProfile = {
            id: existingUser.id,
            email: existingUser.email,
            username: meta.username || `farmer_${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}`,
            full_name: meta.full_name || 'Farmer',
            phone_number: null,
            state: meta.state || 'Rajasthan',
            district: meta.district || 'Jaipur',
            village_locality: meta.village_locality || 'THAR',
            soil_type: 'Alluvial Soil',
            preferred_language: 'en',
            preferred_ai_engine: 'ollama',
            created_at: existingUser.created_at,
            updated_at: new Date().toISOString(),
          };

          await adminClient.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });

          return NextResponse.json({
            success: true,
            data: fallbackProfile,
            persistedInBackend: true,
          });
        }
      }

      // If user not in backend at all during login
      return NextResponse.json({
        success: true,
        data: {
          id: `local-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          state: 'Rajasthan',
          district: 'Jaipur',
          village_locality: 'THAR',
          total_land_acres: 4.0,
          soil_type: 'Alluvial Soil',
          preferred_language: 'en',
          preferred_ai_engine: 'ollama',
        },
        persistedInBackend: false,
      });
    }

    // =========================================================================
    // 2. ACTION: REGISTER (Create new farmer user & profile with strict password & conflict check)
    // =========================================================================
    const {
      fullName,
      phone,
      phoneNumber,
      state = 'Assam',
      district = 'Guwahati',
      village,
      villageLocality,
      totalLandAcres,
      soilType,
      latitude,
      longitude,
      preferredLanguage = 'en',
      preferredAiEngine = 'ollama',
    } = body;

    const actualPhone = phone || phoneNumber || null;
    const actualVillage = village || villageLocality || '';

    // 1. Geocode coordinates for the location
    const resolvedCoords = resolveIndianCoordinates(
      state,
      district,
      actualVillage,
      latitude,
      longitude
    );

    // 2. Instantly fetch authentic live soil baseline for this location
    const soil = await soilService.fetchSoilBaseline(
      resolvedCoords.lat,
      resolvedCoords.lon,
      state,
      district,
      actualVillage
    );

    let userId: string | null = null;

    if (adminClient) {
      try {
        // Find existing user in auth.users
        const { data: userList } = await adminClient.auth.admin.listUsers();
        const existingUser = userList?.users?.find(
          (u: any) => u.email?.toLowerCase() === email
        );

        if (action === 'register') {
          if (existingUser) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  message: 'An account with this email address already exists. Please sign in instead.',
                  code: 'USER_ALREADY_EXISTS',
                },
              },
              { status: 409 }
            );
          }

          if (!password || password.length < 6) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  message: 'Password is required and must be at least 6 characters long.',
                  code: 'INVALID_PASSWORD',
                },
              },
              { status: 400 }
            );
          }

          const username = `farmer_${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now().toString().slice(-4)}`;
          const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName || 'Farmer',
              username,
              state: state || 'Assam',
              district: district || 'Guwahati',
              village_locality: actualVillage,
              latitude: resolvedCoords.lat,
              longitude: resolvedCoords.lon,
            },
          });

          if (createError || !newUser?.user) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  message: createError?.message || 'Failed to create user in authentication server.',
                  code: 'AUTH_CREATE_FAILED',
                },
              },
              { status: 400 }
            );
          }

          userId = newUser.user.id;
        } else {
          // action === 'sync' or profile update
          if (existingUser) {
            userId = existingUser.id;
          }
        }

        if (userId) {
          const username = `farmer_${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}`;
          const upsertData: Record<string, any> = {
            id: userId,
            email,
            username,
            full_name: fullName || 'Farmer',
            phone_number: actualPhone,
            state,
            district,
            village_locality: actualVillage,
            latitude: resolvedCoords.lat,
            longitude: resolvedCoords.lon,
            total_land_acres: totalLandAcres ? parseFloat(totalLandAcres) : 4.0,
            soil_type: soilType || soil.soilType,
            soil_ph: soil.soilPh,
            soil_organic_carbon_pct: soil.soilOrganicCarbonPct,
            soil_nitrogen_mg_kg: soil.soilNitrogenMgKg,
            soil_phosphorus_mg_kg: soil.soilPhosphorusMgKg,
            soil_potassium_mg_kg: soil.soilPotassiumMgKg,
            soil_magnesium_mg_kg: soil.soilMagnesiumMgKg,
            soil_calcium_mg_kg: soil.soilCalciumMgKg,
            soil_sulfur_mg_kg: soil.soilSulfurMgKg,
            soil_ec_ds_m: soil.soilEcDsM,
            soil_sand_pct: soil.soilSandPct,
            soil_silt_pct: soil.soilSiltPct,
            soil_clay_pct: soil.soilClayPct,
            soil_cec: soil.soilCec,
            soil_data_source: soil.dataSource,
            soil_fetched_at: new Date().toISOString(),
            preferred_language: preferredLanguage,
            preferred_ai_engine: preferredAiEngine,
            updated_at: new Date().toISOString(),
          };

          const { data: upserted, error: upsertErr } = await adminClient
            .from('profiles')
            .upsert(upsertData, { onConflict: 'id' })
            .select()
            .single();

          if (!upsertErr && upserted) {
            return NextResponse.json({
              success: true,
              data: upserted,
              persistedInBackend: true,
            });
          }
        }
      } catch (dbErr) {
        console.warn('Supabase profile persistence notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userId || `local-${Date.now()}`,
        email,
        full_name: fullName || 'Farmer',
        phone_number: actualPhone,
        state,
        district,
        village_locality: actualVillage,
        latitude: resolvedCoords.lat,
        longitude: resolvedCoords.lon,
        total_land_acres: totalLandAcres ? parseFloat(totalLandAcres) : 4.0,
        soil_type: soilType || soil.soilType,
        soil_ph: soil.soilPh,
        soil_organic_carbon_pct: soil.soilOrganicCarbonPct,
        soil_nitrogen_mg_kg: soil.soilNitrogenMgKg,
        soil_phosphorus_mg_kg: soil.soilPhosphorusMgKg,
        soil_potassium_mg_kg: soil.soilPotassiumMgKg,
        soil_magnesium_mg_kg: soil.soilMagnesiumMgKg,
        soil_calcium_mg_kg: soil.soilCalciumMgKg,
        soil_sulfur_mg_kg: soil.soilSulfurMgKg,
        soil_ec_ds_m: soil.soilEcDsM,
        soil_sand_pct: soil.soilSandPct,
        soil_silt_pct: soil.soilSiltPct,
        soil_clay_pct: soil.soilClayPct,
        soil_cec: soil.soilCec,
        soil_data_source: soil.dataSource,
        preferred_language: preferredLanguage,
        preferred_ai_engine: preferredAiEngine,
      },
      persistedInBackend: Boolean(userId),
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

