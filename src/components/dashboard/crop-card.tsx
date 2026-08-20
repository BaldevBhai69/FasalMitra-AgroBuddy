'use client';

import React from 'react';
import Link from 'next/link';
import { FarmerCropDetail } from '@/types/crop.types';

export interface CropData {
  id?: string;
  name?: string;
  custom_crop_name?: string;
  variety?: string;
  area?: number | string;
  land_size_acres?: number | string;
  sownDate?: string;
  sowing_date?: string;
  dayCount?: number;
  days_since_sowing?: number;
  totalDays?: number;
  status?: string;
  current_status?: string;
  crop_catalog?: {
    name?: string;
    hindi_name?: string;
    duration_days_max?: number;
  };
}

export interface CropCardProps {
  crop: CropData | FarmerCropDetail;
  onDelete?: (cropId: string) => void;
  openHref?: string;
}

export function CropCard({ crop, onDelete, openHref }: CropCardProps) {
  const c = crop as any;

  // Resolve Crop Name & Variety
  const cropName =
    c.custom_crop_name ||
    c.name ||
    c.crop_catalog?.name ||
    'Crop Field';

  const cropVariety =
    c.variety ||
    (c.crop_catalog?.name
      ? `${c.crop_catalog.name}${c.crop_catalog.hindi_name ? ` (${c.crop_catalog.hindi_name})` : ''}`
      : 'Field Crop');

  // Resolve Area & Sowing Date
  const cropArea = c.area ?? c.land_size_acres ?? 2.5;
  const cropSownDate = c.sownDate || c.sowing_date || '2026-08-20';

  // Calculate Sowing Days & Duration
  const dayCount =
    c.dayCount !== undefined
      ? c.dayCount
      : c.sowing_date
      ? Math.max(
          0,
          Math.floor(
            (new Date().getTime() - new Date(c.sowing_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : c.days_since_sowing ?? 0;

  const totalDays =
    c.totalDays ||
    c.crop_catalog?.duration_days_max ||
    90;

  const progressPct = Math.min((dayCount / totalDays) * 100, 100);
  const cropStatus = c.status || c.current_status || 'Sown';

  const targetHref = openHref || (c.id ? `/dashboard/crops/${c.id}` : '#');

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md border border-neutral-100 flex flex-col justify-between group">
      <div>
        {/* Top Header: Icon, Name, Variety, Delete Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEBA17]/20 text-[#A67500] shadow-xs">
              <span className="text-base select-none">🌱</span>
            </div>
            <div>
              <p className="font-medium text-neutral-900 tracking-tight">{cropName}</p>
              <p className="text-sm text-neutral-400">{cropVariety}</p>
            </div>
          </div>

          {/* Delete button (shows clearly and on hover) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (c.id) onDelete(c.id);
              }}
              className="text-neutral-300 hover:text-red-500 p-1 transition rounded-md hover:bg-red-50"
              title="Delete Crop Field"
              aria-label="Delete Crop Field"
            >
              ✕
            </button>
          )}
        </div>

        {/* Info Grid: Area & Sown Date */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-neutral-50 px-3 py-2 border border-neutral-100/80">
            <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">AREA</p>
            <p className="font-medium text-neutral-800 text-sm mt-0.5">{cropArea} Acres</p>
          </div>
          <div className="rounded-lg bg-neutral-50 px-3 py-2 border border-neutral-100/80">
            <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">SOWN</p>
            <p className="font-medium text-[#A67500] text-sm mt-0.5">{cropSownDate}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{cropStatus}</span>
            <span>
              Day {dayCount} of {totalDays}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-[#FEBA17] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={targetHref}
        className="mt-4 w-full rounded-lg bg-[#FEBA17] hover:bg-[#E5A60F] py-2.5 font-semibold text-[#14160C] transition text-center block text-sm shadow-xs"
      >
        Open Crop File
      </Link>
    </div>
  );
}

export { AddCropCard } from './add-crop-card';
export default CropCard;

