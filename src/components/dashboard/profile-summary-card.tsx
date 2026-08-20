'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  LogOut,
  MapPin,
  Ruler,
  Droplet,
  CloudSun,
  Sprout,
  LucideIcon,
} from 'lucide-react';
import { FarmerProfile } from '@/lib/auth-context';

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatTile({ icon: Icon, label, value, highlight = false }: StatTileProps) {
  return (
    <div className="p-3.5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] flex flex-col justify-between transition hover:border-[#FEBA17]/50">
      <div className="flex items-center gap-1.5 text-[10px] text-[#8A7E6B] font-semibold uppercase tracking-wider">
        <Icon size={13} className="text-[#FEBA17] shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 font-semibold truncate ${
          highlight ? 'text-sm font-bold text-[#A67500]' : 'text-xs text-[#2D2A26]'
        }`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export interface ProfileSummaryUser {
  name?: string;
  fullName?: string;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  totalLand?: string | number;
  totalLandAcres?: number;
  primarySoil?: string;
  soilType?: string;
  activeCrops?: string | number;
  activeCropsCount?: number;
  climate?: string;
}

export interface ProfileSummaryCardProps {
  user?: ProfileSummaryUser | FarmerProfile | null;
  activeCropsCount?: number;
  onLogout?: () => void;
  homeHref?: string;
}

export function ProfileSummaryCard({
  user,
  activeCropsCount,
  onLogout,
  homeHref = '/',
}: ProfileSummaryCardProps) {
  // Safely cast user for optional property checks
  const u = (user || {}) as ProfileSummaryUser & Partial<FarmerProfile>;

  const displayName =
    u.fullName ||
    u.name ||
    'Faraz Athar';

  const displayLocation =
    u.location ||
    [u.village, u.district, u.state].filter(Boolean).join(', ') ||
    'Malihabad, Lucknow, Uttar Pradesh';

  const displayLand =
    u.totalLand !== undefined
      ? `${u.totalLand}`
      : u.totalLandAcres !== undefined
      ? `${u.totalLandAcres} Acres`
      : '5 Acres';

  const displaySoil =
    u.primarySoil ||
    u.soilType?.split('(')[0]?.trim() ||
    'Deltaic Alluvium';

  const computedActiveCrops =
    activeCropsCount !== undefined
      ? `${activeCropsCount} ${activeCropsCount === 1 ? 'Field' : 'Fields'}`
      : u.activeCrops !== undefined
      ? `${u.activeCrops}`
      : u.activeCropsCount !== undefined
      ? `${u.activeCropsCount} Fields`
      : '1 Field';

  const displayClimate = u.climate || '28°C · Clear';

  return (
    <header className="rounded-2xl bg-white p-6 sm:p-7 shadow-sm border border-[#E8DFD0] space-y-5">
      {/* Top row: User info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEBA17]/20 text-[#A67500] shadow-xs">
            <span className="text-xl leading-none select-none">🏠</span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#2D2A26] tracking-tight">
              {displayName}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-[#8A7E6B] mt-0.5">
              <MapPin size={13} className="text-[#FEBA17] shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 text-xs text-[#8A7E6B] self-end sm:self-auto">
          <Link
            href={homeHref}
            className="rounded-lg p-2 bg-[#F9F3E6] hover:bg-[#FEBA17]/20 text-[#8A7E6B] hover:text-[#2D2A26] border border-[#E8DFD0] hover:border-[#FEBA17]/40 transition shadow-xs flex items-center justify-center"
            title="Return to Landing Page"
            aria-label="Return to Landing Page"
          >
            <Home size={16} />
          </Link>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#BC4F4F]/10 text-[#8A7E6B] hover:text-[#BC4F4F] font-medium transition"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
        <StatTile icon={Ruler} label="Total Land" value={displayLand} highlight />
        <StatTile icon={Droplet} label="Primary Soil" value={displaySoil} />
        <StatTile icon={Sprout} label="Active Crops" value={computedActiveCrops} />
        <StatTile icon={CloudSun} label="Climate" value={displayClimate} />
      </div>
    </header>
  );
}

export default ProfileSummaryCard;
