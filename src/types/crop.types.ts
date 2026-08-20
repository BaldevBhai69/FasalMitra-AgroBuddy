import { Database } from './database.types';

export type CropCatalog = Database['public']['Tables']['crop_catalog']['Row'];
export type FarmerCrop = Database['public']['Tables']['farmer_crops']['Row'];
export type VirtualIoTDevice = Database['public']['Tables']['virtual_iot_devices']['Row'];
export type DiseaseCatalog = Database['public']['Tables']['disease_catalog']['Row'];

export interface GrowthStageItem {
  stage: string;
  days: number;
  water_need: 'Low' | 'Moderate' | 'High' | 'Critical';
  description: string;
}

export interface FertilizerGuide {
  basal?: string;
  vegetative?: string;
  active_tillering?: string;
  flowering?: string;
  grand_growth?: string;
  pod_filling?: string;
  tuber_initiation?: string;
  micronutrients?: string;
  [key: string]: string | undefined;
}

export interface FarmerCropDetail extends FarmerCrop {
  crop_catalog: CropCatalog;
  iot_device?: VirtualIoTDevice | null;
  days_since_sowing: number;
  stage_progress_pct: number;
  estimated_days_left: number;
}
