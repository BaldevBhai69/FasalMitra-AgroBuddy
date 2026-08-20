'use client';

import React from 'react';

export interface AddCropCardProps {
  onClick: () => void;
  className?: string;
}

export function AddCropCard({ onClick, className = '' }: AddCropCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-500 transition hover:border-[#FEBA17] hover:bg-[#FEBA17]/10 hover:text-[#A67500] cursor-pointer group ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 group-hover:bg-[#FEBA17]/20 group-hover:text-[#A67500] text-lg font-medium shadow-xs transition">
        +
      </div>
      <span className="text-sm font-medium">Add Crop Field</span>
    </button>
  );
}

export default AddCropCard;
