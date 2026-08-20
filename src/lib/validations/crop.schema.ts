import { z } from 'zod';

export const CreateFarmerCropSchema = z.object({
  cropCatalogId: z.string().uuid('Invalid Crop Catalog ID format'),
  customCropName: z.string().max(100).optional().nullable(),
  landSizeAcres: z.number().positive('Land size must be greater than 0 acres').max(100000, 'Land size is unreasonably large'),
  sowingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sowing date must be in YYYY-MM-DD format'),
  expectedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected harvest date must be in YYYY-MM-DD format').optional().nullable(),
  irrigationSource: z.enum(['Borewell', 'Canal', 'Drip', 'Rainfed', 'Sprinkler', 'Tube Well', 'River/Pond']).optional().nullable(),
  currentStatus: z.enum(['Planning', 'Sown', 'Vegetative', 'Flowering', 'Harvesting', 'Harvested']).default('Sown'),
  notes: z.string().max(1000).optional().nullable(),
});

export const UpdateFarmerCropSchema = z.object({
  customCropName: z.string().max(100).optional().nullable(),
  landSizeAcres: z.number().positive().max(100000).optional(),
  sowingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expectedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  irrigationSource: z.enum(['Borewell', 'Canal', 'Drip', 'Rainfed', 'Sprinkler', 'Tube Well', 'River/Pond']).optional().nullable(),
  currentStatus: z.enum(['Planning', 'Sown', 'Vegetative', 'Flowering', 'Harvesting', 'Harvested']).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const CropCatalogQuerySchema = z.object({
  category: z.enum(['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Cash Crop', 'Oilseed', 'Spices', 'Plantation']).optional(),
  search: z.string().max(100).optional(),
  season: z.enum(['Kharif', 'Rabi', 'Zaid']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateFarmerCropInput = z.infer<typeof CreateFarmerCropSchema>;
export type UpdateFarmerCropInput = z.infer<typeof UpdateFarmerCropSchema>;
export type CropCatalogQueryInput = z.infer<typeof CropCatalogQuerySchema>;
