import { z } from 'zod';

export const SendChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(3000, 'Message cannot exceed 3000 characters').trim(),
  engine: z.enum(['gemini', 'ollama']).optional(),
  modelName: z.string().optional(),
  language: z.enum(['en', 'hi', 'mr', 'pa', 'te', 'ta', 'auto']).optional(),
  cropContext: z
    .object({
      name: z.string(),
      hindiName: z.string().optional(),
      customCropName: z.string().optional(),
      growthStage: z.string().optional(),
      landSizeAcres: z.number().optional(),
      sowingDate: z.string().optional(),
      daysSinceSowing: z.number().optional(),
      irrigationSource: z.string().optional(),
      optimalSoilMoistureMin: z.number().optional(),
      optimalSoilMoistureMax: z.number().optional(),
      optimalNitrogenMin: z.number().optional(),
      optimalNitrogenMax: z.number().optional(),
      optimalPhosphorusMin: z.number().optional(),
      optimalPhosphorusMax: z.number().optional(),
      optimalPotassiumMin: z.number().optional(),
      optimalPotassiumMax: z.number().optional(),
      optimalPhMin: z.number().optional(),
      optimalPhMax: z.number().optional(),
      durationDaysMax: z.number().optional(),
      mspPricePerQuintal: z.number().optional(),
      fertilizerGuide: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  farmerProfile: z
    .object({
      village: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      soilType: z.string().optional(),
      soilPh: z.number().optional(),
      preferredLanguage: z.string().optional(),
    })
    .optional(),
  weatherContext: z
    .object({
      tempC: z.number().optional(),
      humidityPct: z.number().optional(),
      rainTodayMm: z.number().optional(),
      rainProbNext48hPct: z.number().optional(),
      rainExpectedNext48hMm: z.number().optional(),
    })
    .optional(),
  iotOverride: z
    .object({
      soil_moisture_pct: z.number().optional(),
      nitrogen_mg_kg: z.number().optional(),
      phosphorus_mg_kg: z.number().optional(),
      potassium_mg_kg: z.number().optional(),
      soil_ph: z.number().optional(),
      soil_temperature_c: z.number().optional(),
    })
    .optional(),
});

export const DiseaseDiagnoseSchema = z.object({
  imageBase64: z.string().min(20, 'Image data is required').max(10 * 1024 * 1024, 'Image exceeds maximum size (10MB)'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  cropName: z.string().max(100).optional(),
  symptomsDescription: z.string().max(1000).optional(),
  language: z.enum(['en', 'hi', 'mr', 'pa', 'te', 'ta']).default('en'),
});

export type SendChatMessageInput = z.infer<typeof SendChatMessageSchema>;
export type DiseaseDiagnoseInput = z.infer<typeof DiseaseDiagnoseSchema>;
