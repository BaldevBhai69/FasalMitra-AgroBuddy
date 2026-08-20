import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { CropCatalog, VirtualIoTDevice } from '@/types/crop.types';
import { IoTAgronomicStatus, IoTSimulationPreset, IoTTelemetryPayload } from '@/types/iot.types';
import { ApiError } from '@/lib/utils/api-error';

export const SIMULATION_PRESETS: Record<IoTSimulationPreset, Record<string, unknown>> = {
  DROUGHT: {
    soil_moisture_pct: 16.0,
    nitrogen_mg_kg: 95.0,
    phosphorus_mg_kg: 35.0,
    potassium_mg_kg: 130.0,
    soil_ph: 7.4,
    soil_temperature_c: 32.0,
    is_simulation_mode: true,
  },
  MONSOON: {
    soil_moisture_pct: 85.0,
    nitrogen_mg_kg: 80.0,
    phosphorus_mg_kg: 30.0,
    potassium_mg_kg: 110.0,
    soil_ph: 6.5,
    soil_temperature_c: 21.0,
    is_simulation_mode: true,
  },
  NUTRIENT_DEPLETION: {
    soil_moisture_pct: 48.0,
    nitrogen_mg_kg: 28.0,
    phosphorus_mg_kg: 12.0,
    potassium_mg_kg: 35.0,
    soil_ph: 6.8,
    soil_temperature_c: 24.5,
    is_simulation_mode: true,
  },
  OPTIMAL: {
    soil_moisture_pct: 55.0,
    nitrogen_mg_kg: 140.0,
    phosphorus_mg_kg: 60.0,
    potassium_mg_kg: 160.0,
    soil_ph: 6.6,
    soil_temperature_c: 24.0,
    is_simulation_mode: false,
  },
  SALINITY_SPIKE: {
    soil_moisture_pct: 35.0,
    nitrogen_mg_kg: 180.0,
    phosphorus_mg_kg: 70.0,
    potassium_mg_kg: 220.0,
    soil_ph: 8.4,
    electrical_conductivity_ds_m: 4.8,
    is_simulation_mode: true,
  },
  ACIDIC_SHOCK: {
    soil_moisture_pct: 50.0,
    nitrogen_mg_kg: 110.0,
    phosphorus_mg_kg: 20.0,
    potassium_mg_kg: 100.0,
    soil_ph: 4.8,
    soil_temperature_c: 23.0,
    is_simulation_mode: true,
  },
};

export class IoTService {
  /**
   * Retrieves current virtual IoT device readings for a crop.
   * Auto-creates a default device if not already initialized.
   */
  async getOrCreateDevice(farmerCropId: string): Promise<VirtualIoTDevice> {
    const defaultDevice: VirtualIoTDevice = {
      id: `iot-${farmerCropId}`,
      farmer_crop_id: farmerCropId,
      device_name: 'Virtual LoRaWAN Soil Probe v1',
      soil_moisture_pct: 48.0,
      nitrogen_mg_kg: 120.0,
      phosphorus_mg_kg: 45.0,
      potassium_mg_kg: 150.0,
      soil_ph: 6.8,
      soil_temperature_c: 24.5,
      organic_carbon_pct: 0.72,
      electrical_conductivity_ds_m: 1.1,
      is_simulation_mode: false,
      last_sync_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Check for valid UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(farmerCropId);
    if (!isUuid) {
      return defaultDevice;
    }

    const supabase = createAdminSupabaseClient();

    try {
      const { data: existing, error } = await supabase
        .from('virtual_iot_devices')
        .select('*')
        .eq('farmer_crop_id', farmerCropId)
        .maybeSingle();

      if (error) {
        return defaultDevice;
      }

      if (existing) {
        return existing as unknown as VirtualIoTDevice;
      }
    } catch {
      return defaultDevice;
    }

    // Initialize new device with default agronomic baseline
    const { data: created, error: insertErr } = await (supabase.from('virtual_iot_devices') as any)
      .insert({
        farmer_crop_id: farmerCropId,
        device_name: 'Virtual LoRaWAN Soil Probe v1',
        soil_moisture_pct: 48.0,
        nitrogen_mg_kg: 120.0,
        phosphorus_mg_kg: 45.0,
        potassium_mg_kg: 150.0,
        soil_ph: 6.8,
        soil_temperature_c: 24.5,
        organic_carbon_pct: 0.72,
        electrical_conductivity_ds_m: 1.1,
        is_simulation_mode: false,
      })
      .select()
      .single();

    if (insertErr || !created) {
      throw ApiError.internal(`Failed to initialize virtual IoT probe: ${insertErr?.message}`);
    }

    return created as unknown as VirtualIoTDevice;
  }

  /**
   * Updates virtual sensor readings from interactive UI sliders
   */
  async updateTelemetry(
    farmerCropId: string,
    payload: Partial<IoTTelemetryPayload> & { isSimulationMode?: boolean }
  ): Promise<VirtualIoTDevice> {
    const supabase = createAdminSupabaseClient();

    const updatePayload: Record<string, unknown> = {
      last_sync_at: new Date().toISOString(),
    };

    if (payload.soilMoisturePct !== undefined) updatePayload.soil_moisture_pct = payload.soilMoisturePct;
    if (payload.nitrogenMgKg !== undefined) updatePayload.nitrogen_mg_kg = payload.nitrogenMgKg;
    if (payload.phosphorusMgKg !== undefined) updatePayload.phosphorus_mg_kg = payload.phosphorusMgKg;
    if (payload.potassiumMgKg !== undefined) updatePayload.potassium_mg_kg = payload.potassiumMgKg;
    if (payload.soilPh !== undefined) updatePayload.soil_ph = payload.soilPh;
    if (payload.soilTemperatureC !== undefined) updatePayload.soil_temperature_c = payload.soilTemperatureC;
    if (payload.organicCarbonPct !== undefined) updatePayload.organic_carbon_pct = payload.organicCarbonPct;
    if (payload.electricalConductivityDsM !== undefined) updatePayload.electrical_conductivity_ds_m = payload.electricalConductivityDsM;
    if (payload.isSimulationMode !== undefined) updatePayload.is_simulation_mode = payload.isSimulationMode;

    const { data, error } = await (supabase.from('virtual_iot_devices') as any)
      .update(updatePayload)
      .eq('farmer_crop_id', farmerCropId)
      .select()
      .single();

    if (error || !data) {
      throw ApiError.badRequest(`Failed to update IoT telemetry: ${error?.message}`);
    }

    return data as unknown as VirtualIoTDevice;
  }

  /**
   * Applies a one-click simulation preset (Drought, Monsoon, Depletion, etc.)
   */
  async applyPreset(farmerCropId: string, preset: IoTSimulationPreset): Promise<VirtualIoTDevice> {
    const presetValues = SIMULATION_PRESETS[preset];
    if (!presetValues) {
      throw ApiError.badRequest(`Unknown simulation preset: ${preset}`);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await (supabase.from('virtual_iot_devices') as any)
      .update({
        ...presetValues,
        last_sync_at: new Date().toISOString(),
      })
      .eq('farmer_crop_id', farmerCropId)
      .select()
      .single();

    if (error || !data) {
      throw ApiError.badRequest(`Failed to apply simulation preset: ${error?.message}`);
    }

    return data as unknown as VirtualIoTDevice;
  }

  /**
   * Computes holistic agronomic health score and alert messages
   */
  evaluateHealth(iot: VirtualIoTDevice, catalog: CropCatalog): IoTAgronomicStatus {
    const moisture = Number(iot.soil_moisture_pct);
    const n = Number(iot.nitrogen_mg_kg);
    const p = Number(iot.phosphorus_mg_kg);
    const k = Number(iot.potassium_mg_kg);
    const ph = Number(iot.soil_ph);

    const optMMin = Number(catalog?.optimal_soil_moisture_min || 40.0);
    const optMMax = Number(catalog?.optimal_soil_moisture_max || 65.0);
    const optNMin = Number(catalog?.optimal_nitrogen_min || 100.0);
    const optPMin = Number(catalog?.optimal_phosphorus_min || 40.0);
    const optKMin = Number(catalog?.optimal_potassium_min || 100.0);
    const optPhMin = Number(catalog?.optimal_ph_min || 6.0);
    const optPhMax = Number(catalog?.optimal_ph_max || 7.5);

    const alerts: string[] = [];
    let score = 100;

    // Moisture status
    let moistureStatus: IoTAgronomicStatus['moistureStatus'] = 'OPTIMAL';
    if (moisture < optMMin * 0.6) {
      moistureStatus = 'CRITICALLY_DRY';
      alerts.push(`Critical drought: Soil moisture (${moisture}%) is severely below required ${optMMin}%.`);
      score -= 30;
    } else if (moisture < optMMin) {
      moistureStatus = 'LOW';
      alerts.push(`Low moisture: Soil is running dry (${moisture}%).`);
      score -= 15;
    } else if (moisture > optMMax + 10) {
      moistureStatus = 'WATERLOGGED';
      alerts.push(`Waterlogging danger: Soil saturation at ${moisture}% risks root hypoxia.`);
      score -= 25;
    }

    // Nitrogen status
    let nitrogenStatus: IoTAgronomicStatus['nitrogenStatus'] = 'OPTIMAL';
    if (n < optNMin * 0.6) {
      nitrogenStatus = 'DEFICIENT';
      alerts.push(`Severe Nitrogen deficiency (${n} mg/kg). Top-dress with Urea or organic vermicompost.`);
      score -= 20;
    } else if (n > optNMin * 2.2) {
      nitrogenStatus = 'EXCESS';
      alerts.push(`Nitrogen toxicity (${n} mg/kg) may cause vegetative lankiness and delayed flowering.`);
      score -= 10;
    }

    // Phosphorus status
    let phosphorusStatus: IoTAgronomicStatus['phosphorusStatus'] = 'OPTIMAL';
    if (p < optPMin * 0.6) {
      phosphorusStatus = 'DEFICIENT';
      alerts.push(`Phosphorus deficiency (${p} mg/kg). Apply DAP/SSP for root and bloom vigor.`);
      score -= 15;
    }

    // Potassium status
    let potassiumStatus: IoTAgronomicStatus['potassiumStatus'] = 'OPTIMAL';
    if (k < optKMin * 0.6) {
      potassiumStatus = 'DEFICIENT';
      alerts.push(`Potassium deficiency (${k} mg/kg) reduces pest resistance and fruit density.`);
      score -= 15;
    }

    // pH status
    let phStatus: IoTAgronomicStatus['phStatus'] = 'OPTIMAL';
    if (ph < optPhMin) {
      phStatus = 'ACIDIC';
      alerts.push(`Acidic soil (pH ${ph}). Consider applying agricultural lime (calcium carbonate).`);
      score -= 15;
    } else if (ph > optPhMax) {
      phStatus = 'ALKALINE';
      alerts.push(`Alkaline soil (pH ${ph}). Consider applying Gypsum or organic sulfur.`);
      score -= 15;
    }

    return {
      moistureStatus,
      nitrogenStatus,
      phosphorusStatus,
      potassiumStatus,
      phStatus,
      overallHealthScore: Math.max(10, Math.min(100, score)),
      alerts,
    };
  }
}

export const iotService = new IoTService();
