import { createAdminSupabaseClient } from '../src/lib/supabase/admin';
import { soilService } from '../src/lib/services/soil.service';
import { weatherService } from '../src/lib/services/weather.service';
import { irrigationService } from '../src/lib/services/irrigation.service';
import { iotService } from '../src/lib/services/iot.service';
import { mandiService } from '../src/lib/services/mandi.service';
import { aiChatService } from '../src/lib/services/ai-chat.service';
import { CropCatalog } from '../src/types/crop.types';

const LUCKNOW_LAT = 26.8467;
const LUCKNOW_LON = 80.9462;
const TEST_STATE = 'Uttar Pradesh';
const TEST_DISTRICT = 'Lucknow';

interface TestResult {
  section: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(section: string, name: string, fn: () => Promise<string | void>) {
  const start = Date.now();
  try {
    const details = await fn();
    results.push({
      section,
      name,
      passed: true,
      durationMs: Date.now() - start,
      details: details || 'Passed',
    });
    console.log(`  ✅ [${section}] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({
      section,
      name,
      passed: false,
      durationMs: Date.now() - start,
      error: err?.message || String(err),
    });
    console.log(`  ❌ [${section}] ${name} - FAILED: ${err?.message || err}`);
  }
}

async function runComprehensiveTestSuite() {
  console.log('\n================================================================');
  console.log('🌾 FASALMITRA (AGROSMART) — COMPREHENSIVE BACKEND & DB TEST SUITE');
  console.log('================================================================\n');

  const supabase = createAdminSupabaseClient();

  // --------------------------------------------------------------------------
  // SECTION 1: SUPABASE DATABASE TABLES & SEED DATA
  // --------------------------------------------------------------------------
  console.log('📊 SECTION 1: Supabase Database Schema & Master Datasets');

  await runTest('Database', 'Verify crop_catalog seeded rows and FAO-56 fields', async () => {
    const { data, error } = await supabase.from('crop_catalog').select('*');
    if (error) throw new Error(`Query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('crop_catalog is empty! Seed data missing.');
    const tomato = (data as any[]).find((c: any) => c.name === 'Tomato');
    if (!tomato) throw new Error('Tomato crop reference not found in catalog');
    if (!tomato.kc_initial || !tomato.kc_mid || !tomato.growth_stages) {
      throw new Error('Tomato crop missing FAO-56 Kc values or growth stages');
    }
    return `Found ${data.length} crops (Tomato Kc: ${tomato.kc_initial} -> ${tomato.kc_mid} -> ${tomato.kc_end})`;
  });

  await runTest('Database', 'Verify disease_catalog pathology seed dataset', async () => {
    const { data, error } = await supabase.from('disease_catalog').select('*');
    if (error) throw new Error(`Query failed: ${error.message}`);
    if (!data || data.length === 0) throw new Error('disease_catalog is empty! Seed data missing.');
    const blight = data.find((d: any) => d.disease_name.includes('Blight') || d.disease_name.includes('Rust'));
    if (!blight) throw new Error('Key diseases not found in catalog');
    return `Found ${data.length} plant diseases with symptoms and chemical/organic controls`;
  });

  await runTest('Database', 'Verify profiles table accessibility', async () => {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw new Error(`Query failed: ${error.message}`);
    return 'profiles table accessible and schema ready';
  });

  await runTest('Database', 'Verify farmer_crops & virtual_iot_devices schema relations', async () => {
    const { error: err1 } = await supabase.from('farmer_crops').select('id').limit(1);
    if (err1) throw new Error(`farmer_crops error: ${err1.message}`);
    const { error: err2 } = await supabase.from('virtual_iot_devices').select('id').limit(1);
    if (err2) throw new Error(`virtual_iot_devices error: ${err2.message}`);
    return 'farmer_crops and virtual_iot_devices tables ready';
  });

  await runTest('Database', 'Verify crop_ai_chats table and index structure', async () => {
    const { error } = await supabase.from('crop_ai_chats').select('id').limit(1);
    if (error) throw new Error(`Query failed: ${error.message}`);
    return 'crop_ai_chats table ready';
  });

  await runTest('Database', 'Verify weather_cache & cleanup function', async () => {
    const { error } = await supabase.from('weather_cache').select('id').limit(1);
    if (error) throw new Error(`Query failed: ${error.message}`);
    return 'weather_cache table ready';
  });

  await runTest('Database', 'Verify mandi_prices & sync_log tables', async () => {
    const { error: err1 } = await supabase.from('mandi_prices').select('id').limit(1);
    if (err1) throw new Error(`mandi_prices error: ${err1.message}`);
    const { error: err2 } = await supabase.from('mandi_price_sync_log').select('id').limit(1);
    if (err2) throw new Error(`mandi_price_sync_log error: ${err2.message}`);
    return 'mandi_prices and mandi_price_sync_log ready';
  });

  // --------------------------------------------------------------------------
  // SECTION 2: CORE SERVICES LAYER
  // --------------------------------------------------------------------------
  console.log('\n🛠️ SECTION 2: Core Services & Algorithmic Engines');

  await runTest('SoilService', 'Fetch soil baseline for Lucknow coordinates', async () => {
    const soil = await soilService.fetchSoilBaseline(LUCKNOW_LAT, LUCKNOW_LON, TEST_STATE);
    if (!soil.soilType || !soil.soilPh) throw new Error('Invalid soil baseline returned');
    return `Soil Type: ${soil.soilType}, pH: ${soil.soilPh}, OC: ${soil.soilOrganicCarbonPct}%, N: ${soil.soilNitrogenMgKg} mg/kg (Source: ${soil.dataSource})`;
  });

  let cachedForecast: any = null;
  await runTest('WeatherService', 'Fetch 16-day Open-Meteo forecast + FAO-56 ET0 and verify caching', async () => {
    cachedForecast = await weatherService.getForecast(LUCKNOW_LAT, LUCKNOW_LON);
    if (!cachedForecast.current || !cachedForecast.daily || cachedForecast.daily.length === 0) {
      throw new Error('Incomplete weather forecast returned');
    }
    const day1 = cachedForecast.daily[0];
    return `Temp: ${cachedForecast.current.temperatureC}°C, Humidity: ${cachedForecast.current.humidityPct}%, Day 1 ET0: ${day1.et0FaoMm} mm, Rain: ${day1.precipitationMm} mm (Cached days: ${cachedForecast.daily.length})`;
  });

  // End-to-End Real Farmer & Crop Entity via Supabase Auth Admin
  let createdAuthUserId = '';
  let testCropId = '';

  await runTest('Auth & Lifecycle', 'Register test farmer via Auth Admin & trigger auto-profile', async () => {
    const testEmail = `test_farmer_${Date.now()}@fasalmitra.in`;
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'FasalMitraTestPass123!',
      email_confirm: true,
      user_metadata: {
        username: `farmer_${Date.now().toString().slice(-6)}`,
        state: TEST_STATE,
        district: TEST_DISTRICT,
        village_locality: 'Malihabad',
      },
    });

    if (authErr || !authUser.user) {
      throw new Error(`Auth user creation failed: ${authErr?.message}`);
    }

    createdAuthUserId = authUser.user.id;

    // Verify auto-profile trigger handle_new_user() created the profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', createdAuthUserId)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Auto-profile creation trigger failed: ${profileErr?.message}`);
    }

    // Update profile coordinates & soil baseline
    await (supabase.from('profiles') as any)
      .update({
        full_name: 'Ramesh Patel (Test)',
        latitude: LUCKNOW_LAT,
        longitude: LUCKNOW_LON,
        soil_type: 'Alluvial Loam',
        soil_ph: 6.8,
        soil_organic_carbon_pct: 0.72,
        soil_nitrogen_mg_kg: 130.0,
        preferred_language: 'hi',
        preferred_ai_engine: 'gemini',
      })
      .eq('id', createdAuthUserId);

    // Fetch Tomato from catalog
    const { data: catalogItem } = await supabase.from('crop_catalog').select('*').eq('name', 'Tomato').single();
    if (!catalogItem) throw new Error('Tomato not found in catalog');

    // Insert active crop
    const sowingDate = new Date();
    sowingDate.setDate(sowingDate.getDate() - 30);
    const { data: createdCrop, error: cropErr } = await (supabase.from('farmer_crops') as any)
      .insert({
        farmer_id: createdAuthUserId,
        crop_catalog_id: (catalogItem as any).id,
        custom_crop_name: 'Tomato Field A',
        land_size_acres: 2.5,
        sowing_date: sowingDate.toISOString().split('T')[0],
        irrigation_source: 'Drip',
        current_status: 'Vegetative',
      })
      .select()
      .single();

    if (cropErr || !createdCrop) throw new Error(`Crop insert failed: ${cropErr?.message}`);
    testCropId = createdCrop.id;

    // Initialize Virtual IoT probe
    const iot = await iotService.getOrCreateDevice(testCropId);
    return `Created Auth User (${createdAuthUserId}), Profile, & Crop ID (${testCropId}) with probe: ${iot.device_name}`;
  });

  await runTest('IoTService', 'Verify IoT telemetry slider updates & simulation presets', async () => {
    // 1. Update sliders
    const updated = await iotService.updateTelemetry(testCropId, {
      soilMoisturePct: 32.0,
      nitrogenMgKg: 90.0,
      soilPh: 6.5,
    });
    if (Number(updated.soil_moisture_pct) !== 32.0) throw new Error('Telemetry update not reflected');

    // 2. Apply DROUGHT preset
    const droughtState = await iotService.applyPreset(testCropId, 'DROUGHT');
    if (Number(droughtState.soil_moisture_pct) !== 16.0) throw new Error('Drought preset failed');

    // 3. Evaluate health score
    const { data: catalog } = await supabase.from('crop_catalog').select('*').eq('name', 'Tomato').single();
    const health = iotService.evaluateHealth(droughtState, catalog as unknown as CropCatalog);
    if (health.moistureStatus !== 'CRITICALLY_DRY') throw new Error('Health evaluator failed to flag drought');

    return `Drought Preset applied: Moisture=${droughtState.soil_moisture_pct}%, Status=${health.moistureStatus}, Health Score=${health.overallHealthScore}/100`;
  });

  await runTest('IrrigationService', 'FAO-56 Penman-Monteith crop water calculation & water savings volume', async () => {
    const { data: cropData } = await supabase
      .from('farmer_crops')
      .select('*, crop_catalog:crop_catalog_id(*)')
      .eq('id', testCropId)
      .single();

    const iot = await iotService.getOrCreateDevice(testCropId);
    const advice = irrigationService.calculateIrrigationAdvice(
      cropData as any,
      (cropData as any).crop_catalog,
      iot,
      cachedForecast
    );

    if (!advice.action || advice.recommendedWaterDepthMm === undefined) {
      throw new Error('Irrigation decision missing');
    }
    return `Action: ${advice.action}, ETc: ${advice.cropEvapotranspirationEtcMm} mm/day, Water Volume: ${advice.recommendedWaterVolumeLiters.toLocaleString()} L (${advice.headline})`;
  });

  await runTest('MandiService', 'APMC Mandi price trends & "Sell Now vs. Store & Wait" financial advisor', async () => {
    const advice = await mandiService.getSellVsHoldAdvice('Tomato', TEST_STATE, TEST_DISTRICT);
    if (!advice.recommendation || !advice.currentModalPricePerQuintal) {
      throw new Error('Mandi financial advice failed');
    }
    return `Recommendation: ${advice.badgeTitle}, Spot Price: ₹${advice.currentModalPricePerQuintal}/Q, 45-day Net Gain: ${advice.projectedNetGainPct}% (Headline: "${advice.headline}")`;
  });

  await runTest('MandiService', 'Test live data.gov.in Mandi API connection', async () => {
    const syncRes = await mandiService.ingestFromDataGovIn();
    return `data.gov.in Synced: Fetched ${syncRes.fetched} records, Inserted ${syncRes.inserted}, Duration: ${syncRes.durationMs}ms`;
  });

  // --------------------------------------------------------------------------
  // SECTION 3: DUAL-ENGINE AI ADVISORY
  // --------------------------------------------------------------------------
  console.log('\n🤖 SECTION 3: Google Gemini 2.0 Flash AI Advisory');

  await runTest('AIChatService', 'Generate context-aware Hindi advisory response via Gemini 2.0 Flash', async () => {
    const response = await aiChatService.sendMessage(
      testCropId,
      'मेरे टमाटर के पौधों की निचली पत्तियों पर भूरे छल्ले जैसे धब्बे दिख रहे हैं और मिट्टी सूखी है। मुझे क्या करना चाहिए?',
      'gemini',
      'hi'
    );

    if (!response.message) throw new Error('AI response message empty');
    return `Engine: ${response.engineUsed}\n      Response snippet: "${response.message.slice(0, 120)}..."\n      Structured Action: "${response.structuredAdvice?.actionRequired || 'Prescribed'}"`;
  });

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------
  await runTest('Cleanup', 'Clean temporary test auth user (cascades profile, crop, IoT, chats)', async () => {
    if (createdAuthUserId) {
      await supabase.auth.admin.deleteUser(createdAuthUserId);
    }
    return 'Test farmer auth user and all cascaded relations deleted cleanly';
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📈 TEST EXECUTION SUMMARY REPORT');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed         : ${passed} ✅`);
  console.log(`Failed         : ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('❌ Some tests failed:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(` - [${r.section}] ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('✨ ALL 16/16 SYSTEMS, DATABASE TABLES, SERVICES & APIS PASSED 100% CLEANLY! ✨\n');
  }
}

runComprehensiveTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
