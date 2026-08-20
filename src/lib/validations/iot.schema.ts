import { z } from 'zod';

export const UpdateIoTSensorsSchema = z.object({
  soilMoisturePct: z.number().min(0).max(100, 'Soil moisture must be between 0% and 100%').optional(),
  nitrogenMgKg: z.number().min(0, 'Nitrogen value cannot be negative').max(1000).optional(),
  phosphorusMgKg: z.number().min(0, 'Phosphorus value cannot be negative').max(1000).optional(),
  potassiumMgKg: z.number().min(0, 'Potassium value cannot be negative').max(1000).optional(),
  soilPh: z.number().min(0).max(14, 'Soil pH must be between 0.0 and 14.0').optional(),
  soilTemperatureC: z.number().min(-10).max(60).optional(),
  organicCarbonPct: z.number().min(0).max(100).optional(),
  electricalConductivityDsM: z.number().min(0).max(50).optional(),
  isSimulationMode: z.boolean().optional(),
});

export const IoTSimulationPresetSchema = z.object({
  preset: z.enum([
    'DROUGHT',
    'MONSOON',
    'NUTRIENT_DEPLETION',
    'OPTIMAL',
    'SALINITY_SPIKE',
    'ACIDIC_SHOCK',
  ]),
});

export type UpdateIoTSensorsInput = z.infer<typeof UpdateIoTSensorsSchema>;
export type IoTSimulationPresetInput = z.infer<typeof IoTSimulationPresetSchema>;
