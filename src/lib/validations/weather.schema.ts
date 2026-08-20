import { z } from 'zod';

export const WeatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  forceFresh: z.coerce.boolean().optional().default(false),
});

export const MandiQuerySchema = z.object({
  commodity: z.string().min(1).max(100).trim(),
  state: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  days: z.coerce.number().min(7).max(180).default(30),
});

export type WeatherQueryInput = z.infer<typeof WeatherQuerySchema>;
export type MandiQueryInput = z.infer<typeof MandiQuerySchema>;
