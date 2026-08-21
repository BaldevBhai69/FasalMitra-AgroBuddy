'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sprout, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { AddCropModal } from '@/components/dashboard/add-crop-modal';
import { ProfileSummaryCard } from '@/components/dashboard/profile-summary-card';
import { CropCard, AddCropCard } from '@/components/dashboard/crop-card';
import { MASTER_CROP_CATALOG, CROP_PRESETS } from '@/lib/data/crop-catalog';
import { FarmerCropDetail } from '@/types/crop.types';

export default function DashboardPage() {
  const { isAuthenticated, profile, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [crops, setCrops] = useState<FarmerCropDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);

  // Check auth and load saved crops scoped to the active user profile from Supabase
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!profile) {
      setCrops([]);
      return;
    }

    const isDemo = (
      profile.email?.toLowerCase().includes('ramesh') ||
      profile.id === 'demo-farmer-id'
    );

    if (isDemo) {
      const userKey = `fasalmitra_crops_${profile.email || profile.id}`;
      const savedUserCrops = localStorage.getItem(userKey);

      if (savedUserCrops) {
        try {
          setCrops(JSON.parse(savedUserCrops));
        } catch {
          setCrops([]);
        }
      } else {
        // Pre-populate Ramesh Kumar Patel (Malihabad, Lucknow) with 36-day-old Tomato Crop
        const sowingDate36DaysAgo = new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const harvestDate = new Date(Date.now() + 54 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const tomatoPreset = MASTER_CROP_CATALOG.find((c) => c.id === 'cat-tomato') || MASTER_CROP_CATALOG[0];

        const demoTomatoCrop: FarmerCropDetail = {
          id: 'demo-tomato-malihabad',
          farmer_id: 'demo-farmer-id',
          crop_catalog_id: 'cat-tomato',
          custom_crop_name: 'Hybrid Cherry Tomato (Plot A)',
          land_size_acres: 2.5,
          sowing_date: sowingDate36DaysAgo,
          expected_harvest_date: harvestDate,
          irrigation_source: 'Drip',
          current_status: 'Vegetative',
          notes: 'Planted with Drip fertigation and Malihabad Alluvial baseline.',
          created_at: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          days_since_sowing: 36,
          stage_progress_pct: 40,
          estimated_days_left: 54,
          crop_catalog: tomatoPreset as any,
          iot_device: {
            id: 'iot-malihabad-tomato',
            farmer_crop_id: 'demo-tomato-malihabad',
            device_name: 'Malihabad Soil Probe #1',
            is_simulation_mode: false,
            soil_moisture_pct: 48,
            nitrogen_mg_kg: 125,
            phosphorus_mg_kg: 42,
            potassium_mg_kg: 155,
            soil_ph: 6.5,
            soil_temperature_c: 26.5,
            organic_carbon_pct: 0.65,
            electrical_conductivity_ds_m: 1.1,
            last_sync_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        };

        setCrops([demoTomatoCrop]);
        localStorage.setItem(userKey, JSON.stringify([demoTomatoCrop]));
      }
      setLoading(false);
    } else {
      // Real authenticated farmer: fetch live from Supabase API
      fetch('/api/v1/crops')
        .then((r) => r.json())
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setCrops(res.data);
            const userKey = `fasalmitra_crops_${profile.email || profile.id}`;
            localStorage.setItem(userKey, JSON.stringify(res.data));
          } else {
            const userKey = `fasalmitra_crops_${profile.email || profile.id}`;
            const saved = localStorage.getItem(userKey);
            if (saved) {
              try { setCrops(JSON.parse(saved)); } catch { setCrops([]); }
            } else {
              setCrops([]);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to load crops from Supabase server:', err);
          const userKey = `fasalmitra_crops_${profile.email || profile.id}`;
          const saved = localStorage.getItem(userKey);
          if (saved) {
            try { setCrops(JSON.parse(saved)); } catch { setCrops([]); }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated, profile]);

  const handleAddCrop = async (newCrop: FarmerCropDetail) => {
    const isDemo = (
      profile?.email?.toLowerCase().includes('ramesh') ||
      profile?.id === 'demo-farmer-id'
    );

    if (isDemo) {
      const updated = [...crops, newCrop];
      setCrops(updated);
      const userKey = `fasalmitra_crops_${profile?.email || profile?.id}`;
      localStorage.setItem(userKey, JSON.stringify(updated));
      return;
    }

    try {
      // Persist to Supabase backend API
      const res = await fetch('/api/v1/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropCatalogId: newCrop.crop_catalog_id,
          customCropName: newCrop.custom_crop_name,
          landSizeAcres: newCrop.land_size_acres,
          sowingDate: newCrop.sowing_date,
          expectedHarvestDate: newCrop.expected_harvest_date,
          irrigationSource: newCrop.irrigation_source,
          notes: newCrop.notes,
        }),
      });

      const json = await res.json();
      if (json?.data) {
        const persistedCrop = json.data;
        const updated = [...crops, persistedCrop];
        setCrops(updated);
        const userKey = `fasalmitra_crops_${profile?.email || profile?.id}`;
        localStorage.setItem(userKey, JSON.stringify(updated));
      } else {
        const updated = [...crops, newCrop];
        setCrops(updated);
      }
    } catch (err) {
      console.warn('Failed to persist crop to Supabase:', err);
      const updated = [...crops, newCrop];
      setCrops(updated);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    const isDemo = (
      profile?.email?.toLowerCase().includes('ramesh') ||
      profile?.id === 'demo-farmer-id'
    );

    if (!isDemo && !cropId.startsWith('demo-')) {
      try {
        await fetch(`/api/v1/crops/${cropId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete crop from Supabase:', err);
      }
    }

    const updated = crops.filter((c) => c.id !== cropId);
    setCrops(updated);
    if (profile) {
      const userKey = `fasalmitra_crops_${profile.email || profile.id}`;
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
    setCropToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#2D2A26] p-4 sm:p-8 lg:p-12 font-sans selection:bg-[#FEF2A0] selection:text-[#2D2A26]">
      {/* Auth Modal Popup */}
      <AuthModal isOpen={showAuthModal && !isAuthenticated} onClose={() => setShowAuthModal(false)} />

      {/* Add Crop Modal Popup */}
      <AddCropModal
        isOpen={showAddCropModal}
        onClose={() => setShowAddCropModal(false)}
        onAddCrop={handleAddCrop}
      />

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ==================================================================
            1. TOP PROFILE & FARM INFORMATION BAR
            ================================================================== */}
        <ProfileSummaryCard
          user={profile}
          activeCropsCount={crops.length}
          onLogout={logout}
          homeHref="/"
        />

        {/* ==================================================================
            2. CROP FOLDERS SECTION
            ================================================================== */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-[#E8DFD0]">
            <span className="text-[10px] tracking-[0.15em] text-[#8A7E6B] uppercase font-bold block">
              Portfolio
            </span>
            <h2 className="text-2xl font-semibold text-[#2D2A26]">
              Active Crop Fields
            </h2>
          </div>

          {/* Empty State */}
          {crops.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-[#E8DFD0] text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FEBA17]/20 flex items-center justify-center mx-auto text-[#A67500]">
                <Sprout size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[#2D2A26]">No Crop Fields Yet</h3>
                <p className="text-xs text-[#8A7E6B] max-w-xs mx-auto">
                  Add a crop to get started with soil monitoring and agronomic intelligence.
                </p>
              </div>
              <button
                onClick={() => setShowAddCropModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEBA17] hover:bg-[#E5A60F] text-[#14160C] font-bold text-xs shadow-xs transition"
              >
                <Plus size={16} />
                <span>Add Your First Crop</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {crops.map((crop) => (
                <CropCard
                  key={crop.id}
                  crop={crop}
                  onDelete={(id) => setCropToDelete(id)}
                />
              ))}

              {/* Add Crop Card */}
              <AddCropCard onClick={() => setShowAddCropModal(true)} />
            </div>
          )}
        </section>

        {/* Delete Confirmation Modal */}
        {cropToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-[#E8DFD0] text-[#2D2A26] space-y-4 shadow-lg">
              <h3 className="text-lg font-semibold">Delete Crop Field?</h3>
              <p className="text-sm text-[#8A7E6B] leading-relaxed">
                This will remove all associated sensor data and chat history for this field.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCropToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-[#F9F3E6] text-[#8A7E6B] hover:text-[#2D2A26] text-xs font-semibold border border-[#E8DFD0] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCrop(cropToDelete)}
                  className="px-4 py-2 rounded-xl bg-[#BC4F4F] hover:bg-[#A94343] text-white text-xs font-bold transition"
                >
                  Delete Field
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
