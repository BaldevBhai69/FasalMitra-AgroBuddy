import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  fullName: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  state: z.string().min(2).max(100).optional(),
  district: z.string().min(2).max(100).optional(),
  villageLocality: z.string().min(2).max(150).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  soilType: z.string().max(50).optional().nullable(),
  soilPh: z.number().min(0).max(14).optional().nullable(),
  soilOrganicCarbonPct: z.number().min(0).max(100).optional().nullable(),
  soilNitrogenMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilPhosphorusMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilPotassiumMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilMagnesiumMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilCalciumMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilSulfurMgKg: z.number().min(0).max(10000).optional().nullable(),
  soilEcDsM: z.number().min(0).max(100).optional().nullable(),
  soilSandPct: z.number().min(0).max(100).optional().nullable(),
  soilSiltPct: z.number().min(0).max(100).optional().nullable(),
  soilClayPct: z.number().min(0).max(100).optional().nullable(),
  soilCec: z.number().min(0).max(500).optional().nullable(),
  preferredLanguage: z.enum(['en', 'hi', 'mr', 'pa', 'te', 'ta']).optional(),
  preferredAiEngine: z.enum(['gemini', 'ollama']).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
