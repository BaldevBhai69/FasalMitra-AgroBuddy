import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
    .trim(),
  fullName: z.string().max(100).optional(),
  state: z.string().min(2, 'State is required').max(100).trim(),
  district: z.string().min(2, 'District is required').max(100).trim(),
  villageLocality: z.string().min(2, 'Village/Locality is required').max(150).trim(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  preferredLanguage: z.enum(['en', 'hi', 'mr', 'pa', 'te', 'ta']).default('en'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
