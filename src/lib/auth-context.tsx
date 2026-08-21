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
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<FarmerProfile>) => Promise<void>;
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

export function mapProfileRowToFarmer(row: any): FarmerProfile {
  return {
    id: row.id || `farmer-${Date.now()}`,
    email: row.email || '',
    fullName: row.full_name || row.fullName || 'Farmer',
    phone: row.phone_number || row.phone || '',
    state: row.state || 'Assam',
    district: row.district || 'Guwahati',
    village: row.village_locality || row.village || 'Gram Panchayat',
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : undefined,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : undefined,
    totalLandAcres: row.total_land_acres !== null && row.total_land_acres !== undefined ? Number(row.total_land_acres) : 4.0,
    soilType: row.soil_type || row.soilType || 'Alluvial Soil',
    soilPh: row.soil_ph !== null && row.soil_ph !== undefined ? Number(row.soil_ph) : undefined,
    soilOrganicCarbonPct: row.soil_organic_carbon_pct !== null && row.soil_organic_carbon_pct !== undefined ? Number(row.soil_organic_carbon_pct) : undefined,
    soilNitrogenMgKg: row.soil_nitrogen_mg_kg !== null && row.soil_nitrogen_mg_kg !== undefined ? Number(row.soil_nitrogen_mg_kg) : undefined,
    soilPhosphorusMgKg: row.soil_phosphorus_mg_kg !== null && row.soil_phosphorus_mg_kg !== undefined ? Number(row.soil_phosphorus_mg_kg) : undefined,
    soilPotassiumMgKg: row.soil_potassium_mg_kg !== null && row.soil_potassium_mg_kg !== undefined ? Number(row.soil_potassium_mg_kg) : undefined,
    soilMagnesiumMgKg: row.soil_magnesium_mg_kg !== null && row.soil_magnesium_mg_kg !== undefined ? Number(row.soil_magnesium_mg_kg) : undefined,
    soilCalciumMgKg: row.soil_calcium_mg_kg !== null && row.soil_calcium_mg_kg !== undefined ? Number(row.soil_calcium_mg_kg) : undefined,
    soilSulfurMgKg: row.soil_sulfur_mg_kg !== null && row.soil_sulfur_mg_kg !== undefined ? Number(row.soil_sulfur_mg_kg) : undefined,
    soilEcDsM: row.soil_ec_ds_m !== null && row.soil_ec_ds_m !== undefined ? Number(row.soil_ec_ds_m) : undefined,
    preferredLanguage: row.preferred_language || row.preferredLanguage || 'en',
    preferredAiEngine: (row.preferred_ai_engine || row.preferredAiEngine || 'ollama') as 'gemini' | 'ollama',
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    async function restoreSession() {
      try {
        // 1. Check for active Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileRow) {
            const mapped = mapProfileRowToFarmer(profileRow);
            setProfile(mapped);
            localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(mapped));
            setLoading(false);
            return;
          }
        }

        // 2. Check for local demo profile session
        const saved = localStorage.getItem('fasalmitra_farmer_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (
              parsed.email?.toLowerCase().includes('ramesh') ||
              parsed.id === 'demo-farmer-id'
            ) {
              setProfile(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // invalid JSON
          }
        }

        // If no active session, clear profile
        setProfile(null);
        localStorage.removeItem('fasalmitra_farmer_profile');
      } catch (err) {
        console.warn('Session restoration notice:', err);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();

    // 3. Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        localStorage.removeItem('fasalmitra_farmer_profile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const isDemo = cleanEmail.includes('ramesh') || cleanEmail.includes('demo');

      if (isDemo) {
        // Quick Demo Profile: 100% browser-saved
        const demoProfile = { ...DEFAULT_DEMO_PROFILE };
        setProfile(demoProfile);
        localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(demoProfile));
        return;
      }

      if (!password || password.trim() === '') {
        throw new Error('Please enter your password to sign in.');
      }

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        if (authError?.message?.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. If you do not have an account yet, please click "New Farmer" to register.');
        }
        if (authError?.message?.includes('Email not confirmed')) {
          throw new Error('Your email address is pending confirmation. Please check your email inbox.');
        }
        throw new Error(authError?.message || 'Login failed. Please verify your email and password.');
      }

      // 2. Fetch authenticated profile from Supabase profiles table
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      let activeProfile: FarmerProfile;
      if (profileRow) {
        activeProfile = mapProfileRowToFarmer(profileRow);
      } else {
        // Profile record fallback from backend API
        const res = await fetch('/api/v1/profile');
        const json = await res.json();
        if (json?.data) {
          activeProfile = mapProfileRowToFarmer(json.data);
        } else {
          throw new Error('Farmer profile could not be retrieved from the server.');
        }
      }

      setProfile(activeProfile);
      localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(activeProfile));
    } finally {
      setLoading(false);
    }
  };

  const register = async (profileData: Omit<FarmerProfile, 'id'>, password?: string) => {
    setLoading(true);
    try {
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const cleanEmail = profileData.email.trim().toLowerCase();

      // 1. Call registration API to create Supabase auth user + profile in DB with geocoded ICAR soil data
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          ...profileData,
          email: cleanEmail,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.error?.message || json.message || 'Registration failed.';
        throw new Error(msg);
      }

      // 2. Automatically sign in with credentials to establish authenticated Supabase cookie session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        console.warn('Auto sign-in warning:', authError.message);
      }

      const activeProfile: FarmerProfile = mapProfileRowToFarmer(json.data);
      setProfile(activeProfile);
      localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(activeProfile));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setProfile(null);
    localStorage.removeItem('fasalmitra_farmer_profile');
  };

  const updateProfile = async (updates: Partial<FarmerProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('fasalmitra_farmer_profile', JSON.stringify(updated));

    // Asynchronously sync update to Supabase via PATCH /api/v1/profile
    try {
      await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: updates.fullName,
          phoneNumber: updates.phone,
          state: updates.state,
          district: updates.district,
          villageLocality: updates.village,
          latitude: updates.latitude,
          longitude: updates.longitude,
          soilType: updates.soilType,
          soilPh: updates.soilPh,
          soilOrganicCarbonPct: updates.soilOrganicCarbonPct,
          soilNitrogenMgKg: updates.soilNitrogenMgKg,
          soilPhosphorusMgKg: updates.soilPhosphorusMgKg,
          soilPotassiumMgKg: updates.soilPotassiumMgKg,
          soilMagnesiumMgKg: updates.soilMagnesiumMgKg,
          soilCalciumMgKg: updates.soilCalciumMgKg,
          soilSulfurMgKg: updates.soilSulfurMgKg,
          soilEcDsM: updates.soilEcDsM,
          preferredLanguage: updates.preferredLanguage,
          preferredAiEngine: updates.preferredAiEngine,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync profile update to backend', err);
    }
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
