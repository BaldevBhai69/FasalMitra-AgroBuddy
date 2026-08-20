'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface FarmerProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  state: string;
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  totalLandAcres: number;
  soilType: string;
  soilPh?: number;
  soilOrganicCarbonPct?: number;
  soilNitrogenMgKg?: number;
  soilPhosphorusMgKg?: number;
  soilPotassiumMgKg?: number;
  soilMagnesiumMgKg?: number;
  soilCalciumMgKg?: number;
  soilSulfurMgKg?: number;
  soilEcDsM?: number;
  preferredLanguage: string;
  preferredAiEngine: 'gemini' | 'ollama';
}

interface AuthContextType {
  isAuthenticated: boolean;
  profile: FarmerProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (profileData: Omit<FarmerProfile, 'id'>, password?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
}

export const DEFAULT_DEMO_PROFILE: FarmerProfile = {
  id: 'demo-farmer-id',
  email: 'ramesh.kumar@fasalmitra.in',
  fullName: 'Ramesh Kumar Patel',
  phone: '+91 98765 43210',
  state: 'Uttar Pradesh',
  district: 'Lucknow',
  village: 'Malihabad',
  latitude: 26.9200,
  longitude: 80.7100,
  totalLandAcres: 6.5,
  soilType: 'Alluvial Soil (गंगा-जलोढ़)',
  soilPh: 7.4,
  soilOrganicCarbonPct: 0.62,
  soilNitrogenMgKg: 140,
  soilPhosphorusMgKg: 45,
  soilPotassiumMgKg: 165,
  soilMagnesiumMgKg: 48,
  soilCalciumMgKg: 380,
  soilSulfurMgKg: 24,
  soilEcDsM: 0.44,
  preferredLanguage: 'hi',
  preferredAiEngine: 'ollama',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check local storage for persistent profile
    try {
      const saved = localStorage.getItem('fasalmitra_farmer_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const isDemo = !email || email.toLowerCase().includes('ramesh') || email.toLowerCase().includes('demo');

      if (isDemo) {
        // Quick Demo Profile: 100% browser-saved, not backend
        const demoProfile = { ...DEFAULT_DEMO_PROFILE };
        setProfile(demoProfile);
        localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(demoProfile));
        return;
      }

      // 1. Attempt to login/fetch real profile from backend
      let backendProfile: FarmerProfile | null = null;
      try {
        const res = await fetch('/api/v1/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: email,
            password,
          }),
        });
        const json = await res.json();
        if (json?.data) {
          const d = json.data;
          backendProfile = {
            id: d.id || `farmer-${Date.now()}`,
            email: d.email || email,
            fullName: d.full_name || d.fullName || 'Farmer',
            phone: d.phone_number || d.phone || '',
            state: d.state || 'Assam',
            district: d.district || 'Guwahati',
            village: d.village_locality || d.village || 'Gram',
            latitude: d.latitude ? Number(d.latitude) : undefined,
            longitude: d.longitude ? Number(d.longitude) : undefined,
            totalLandAcres: d.total_land_acres || d.totalLandAcres || 5.0,
            soilType: d.soil_type || d.soilType || 'Alluvial Soil',
            soilPh: d.soil_ph ? Number(d.soil_ph) : undefined,
            soilOrganicCarbonPct: d.soil_organic_carbon_pct ? Number(d.soil_organic_carbon_pct) : undefined,
            soilNitrogenMgKg: d.soil_nitrogen_mg_kg ? Number(d.soil_nitrogen_mg_kg) : undefined,
            soilPhosphorusMgKg: d.soil_phosphorus_mg_kg ? Number(d.soil_phosphorus_mg_kg) : undefined,
            soilPotassiumMgKg: d.soil_potassium_mg_kg ? Number(d.soil_potassium_mg_kg) : undefined,
            soilMagnesiumMgKg: d.soil_magnesium_mg_kg ? Number(d.soil_magnesium_mg_kg) : undefined,
            soilCalciumMgKg: d.soil_calcium_mg_kg ? Number(d.soil_calcium_mg_kg) : undefined,
            soilSulfurMgKg: d.soil_sulfur_mg_kg ? Number(d.soil_sulfur_mg_kg) : undefined,
            soilEcDsM: d.soil_ec_ds_m ? Number(d.soil_ec_ds_m) : undefined,
            preferredLanguage: d.preferred_language || d.preferredLanguage || 'en',
            preferredAiEngine: d.preferred_ai_engine || d.preferredAiEngine || 'ollama',
          };
        }
      } catch (err) {
        console.warn('Backend sync failed, falling back to local session', err);
      }

      const activeProfile: FarmerProfile = backendProfile || {
        id: `farmer-${Date.now()}`,
        email: email,
        fullName: email.split('@')[0],
        state: 'Assam',
        district: 'Guwahati',
        village: 'Gram',
        totalLandAcres: 4.0,
        soilType: 'Brahmaputra Alluvial Silt Loam',
        preferredLanguage: 'en',
        preferredAiEngine: 'ollama',
      };

      setProfile(activeProfile);
      localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(activeProfile));
    } finally {
      setLoading(false);
    }
  };

  const register = async (profileData: Omit<FarmerProfile, 'id'>, password?: string) => {
    setLoading(true);
    try {
      let registeredData: any = null;
      try {
        const res = await fetch('/api/v1/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            ...profileData,
            password,
          }),
        });
        const json = await res.json();
        if (json?.data) {
          registeredData = json.data;
        }
      } catch (err) {
        console.warn('Backend registration sync failed, falling back to local session', err);
      }

      const newProfile: FarmerProfile = {
        ...profileData,
        id: registeredData?.id || `farmer-${Date.now()}`,
        latitude: registeredData?.latitude !== undefined ? Number(registeredData.latitude) : profileData.latitude,
        longitude: registeredData?.longitude !== undefined ? Number(registeredData.longitude) : profileData.longitude,
        soilType: registeredData?.soil_type || profileData.soilType,
        soilPh: registeredData?.soil_ph !== undefined ? Number(registeredData.soil_ph) : profileData.soilPh,
        soilOrganicCarbonPct: registeredData?.soil_organic_carbon_pct !== undefined ? Number(registeredData.soil_organic_carbon_pct) : profileData.soilOrganicCarbonPct,
        soilNitrogenMgKg: registeredData?.soil_nitrogen_mg_kg !== undefined ? Number(registeredData.soil_nitrogen_mg_kg) : profileData.soilNitrogenMgKg,
        soilPhosphorusMgKg: registeredData?.soil_phosphorus_mg_kg !== undefined ? Number(registeredData.soil_phosphorus_mg_kg) : profileData.soilPhosphorusMgKg,
        soilPotassiumMgKg: registeredData?.soil_potassium_mg_kg !== undefined ? Number(registeredData.soil_potassium_mg_kg) : profileData.soilPotassiumMgKg,
        soilMagnesiumMgKg: registeredData?.soil_magnesium_mg_kg !== undefined ? Number(registeredData.soil_magnesium_mg_kg) : profileData.soilMagnesiumMgKg,
        soilCalciumMgKg: registeredData?.soil_calcium_mg_kg !== undefined ? Number(registeredData.soil_calcium_mg_kg) : profileData.soilCalciumMgKg,
        soilSulfurMgKg: registeredData?.soil_sulfur_mg_kg !== undefined ? Number(registeredData.soil_sulfur_mg_kg) : profileData.soilSulfurMgKg,
        soilEcDsM: registeredData?.soil_ec_ds_m !== undefined ? Number(registeredData.soil_ec_ds_m) : profileData.soilEcDsM,
      };
      setProfile(newProfile);
      localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(newProfile));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('fasalmitra_farmer_profile');
  };

  const updateProfile = (updates: Partial<FarmerProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(updated));

    // Asynchronously sync to backend
    fetch('/api/v1/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Failed to sync profile update to backend', err));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(profile),
        profile,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
