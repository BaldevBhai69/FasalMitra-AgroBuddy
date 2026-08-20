'use client';

import React, { useState, useMemo } from 'react';
import { FarmerCropDetail, CropCatalog } from '@/types/crop.types';
import { MASTER_CROP_CATALOG, CROP_CATEGORIES } from '@/lib/data/crop-catalog';

export const CROP_PRESETS: Partial<CropCatalog>[] = MASTER_CROP_CATALOG;

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCrop: (newCrop: FarmerCropDetail) => void;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({ isOpen, onClose, onAddCrop }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState('cat-tomato');
  const [customName, setCustomName] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState('2.5');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [irrigationSource, setIrrigationSource] = useState('Drip');
  const [notes, setNotes] = useState('');

  // Filter crops by Category and Search Query
  const filteredCrops = useMemo(() => {
    return MASTER_CROP_CATALOG.filter((crop) => {
      const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        crop.name.toLowerCase().includes(query) ||
        crop.hindi_name.toLowerCase().includes(query) ||
        crop.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const currentPreset = MASTER_CROP_CATALOG.find((p) => p.id === selectedPresetId) || MASTER_CROP_CATALOG[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sowing = new Date(sowingDate);
    const today = new Date();
    const daysSinceSowing = Math.max(0, Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)));
    const durationMax = currentPreset.duration_days_max || 90;
    const progressPct = Math.min(100, Math.round((daysSinceSowing / durationMax) * 100));

    let status: 'Planning' | 'Sown' | 'Vegetative' | 'Flowering' | 'Harvesting' | 'Harvested' = 'Vegetative';
    if (progressPct < 20) status = 'Sown';
    else if (progressPct < 50) status = 'Vegetative';
    else if (progressPct < 80) status = 'Flowering';
    else status = 'Harvesting';

    const newCrop: FarmerCropDetail = {
      id: `crop-${Date.now()}`,
      farmer_id: 'demo-farmer',
      crop_catalog_id: currentPreset.id || 'cat-tomato',
      custom_crop_name: customName.trim() || `${currentPreset.name} (${currentPreset.hindi_name}) Field`,
      land_size_acres: parseFloat(landSizeAcres) || 2.5,
      sowing_date: sowingDate,
      expected_harvest_date: new Date(sowing.getTime() + durationMax * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      irrigation_source: (irrigationSource as any) || 'Drip',
      current_status: status,
      notes: notes.trim() || 'Planted with optimal baseline telemetry',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      days_since_sowing: daysSinceSowing,
      stage_progress_pct: progressPct,
      estimated_days_left: Math.max(0, durationMax - daysSinceSowing),
      crop_catalog: currentPreset as CropCatalog,
      iot_device: {
        id: `iot-${Date.now()}`,
        farmer_crop_id: `crop-${Date.now()}`,
        device_name: `Soil Probe (${currentPreset.name})`,
        is_simulation_mode: false,
        soil_moisture_pct: currentPreset.optimal_soil_moisture_min ? currentPreset.optimal_soil_moisture_min + 5 : 48,
        nitrogen_mg_kg: currentPreset.optimal_nitrogen_min ? currentPreset.optimal_nitrogen_min + 10 : 125,
        phosphorus_mg_kg: currentPreset.optimal_phosphorus_min || 42,
        potassium_mg_kg: currentPreset.optimal_potassium_min || 140,
        soil_ph: currentPreset.optimal_ph_min ? (currentPreset.optimal_ph_min + currentPreset.optimal_ph_max!) / 2 : 6.5,
        soil_temperature_c: 25.5,
        organic_carbon_pct: 0.75,
        electrical_conductivity_ds_m: 1.1,
        last_sync_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    };

    onAddCrop(newCrop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] shadow-xl text-[#2D2A26] max-h-[92vh] flex flex-col space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD0] shrink-0">
          <div>
            <span className="text-[10px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
              32 Crops
            </span>
            <h2 className="text-xl font-semibold text-[#2D2A26]">
              Create Crop Field
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A7E6B] hover:text-[#BC4F4F] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* 1. Category Filter Tabs & Search Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-[#8A7E6B]">Select Crop *</label>
              <span className="text-[10px] text-[#8A7E6B]">{filteredCrops.length} available</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops (e.g. Wheat, Onion, Banana)..."
                className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-[#8A7E6B] hover:text-[#BC4F4F] transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {CROP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#FEBA17] text-[#14160C] font-semibold'
                      : 'bg-[#F9F3E6] text-[#8A7E6B] hover:text-[#2D2A26] border border-[#E8DFD0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Crop Selector Grid (emojis preserved per user rule) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0]">
              {filteredCrops.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setSelectedPresetId(crop.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                    selectedPresetId === crop.id
                      ? 'bg-[#FEBA17]/20 border-[#FEBA17] text-[#2D2A26]'
                      : 'bg-white border-[#E8DFD0] hover:border-[#FEBA17]/40 text-[#8A7E6B]'
                  }`}
                >
                  <span className="text-2xl shrink-0">{crop.icon_emoji}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#2D2A26] truncate block">
                      {crop.name}
                    </span>
                    <span className="text-[10px] text-[#8A7E6B] truncate block">
                      {crop.hindi_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Custom Variety & Acreage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#8A7E6B]">Field Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`e.g. ${currentPreset.name} (Plot A)`}
                className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#8A7E6B]">Area (Acres) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] transition"
              />
            </div>
          </div>

          {/* 3. Sowing Date & Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#8A7E6B]">Sowing Date *</label>
              <input
                type="date"
                required
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#8A7E6B]">Irrigation</label>
              <select
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
                className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] transition"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Canal">Canal Water</option>
                <option value="Tube Well">Tube Well / Borewell</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          {/* 4. Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#8A7E6B]">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Basal DAP applied, seeds treated"
              className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
            />
          </div>

          {/* Selected Crop Summary */}
          <div className="p-3.5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#8A7E6B] block text-[10px] uppercase tracking-wide">Duration</span>
              <span className="font-semibold text-[#A67500]">{currentPreset.duration_days_min}–{currentPreset.duration_days_max} Days</span>
            </div>
            <div>
              <span className="text-[#8A7E6B] block text-[10px] uppercase tracking-wide">Moisture</span>
              <span className="font-semibold text-[#2D2A26]">{currentPreset.optimal_soil_moisture_min}%–{currentPreset.optimal_soil_moisture_max}%</span>
            </div>
            <div>
              <span className="text-[#8A7E6B] block text-[10px] uppercase tracking-wide">MSP</span>
              <span className="font-semibold text-[#4A8C5C]">{currentPreset.msp_price_per_quintal}/q</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#F9F3E6] hover:bg-[#FEF2A0]/40 text-[#8A7E6B] hover:text-[#2D2A26] text-xs font-medium border border-[#E8DFD0] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FEBA17] hover:bg-[#E5A60F] text-[#14160C] font-bold text-xs transition-all shadow-xs"
            >
              Create Crop Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
