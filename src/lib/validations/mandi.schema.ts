import { z } from 'zod';

export const MandiQuerySchema = z.object({
  commodity: z.string().min(1).max(100).trim(),
  state: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  days: z.coerce.number().min(7).max(180).default(30),
});

export type MandiQueryInput = z.infer<typeof MandiQuerySchema>;
