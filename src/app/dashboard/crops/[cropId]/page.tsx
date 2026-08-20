'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FarmerCropDetail, CropCatalog } from '@/types/crop.types';
import { WeatherForecastResponse } from '@/types/weather.types';
import { useAuth } from '@/lib/auth-context';
import { CropChatSection } from '@/components/dashboard/crop-chat-section';
import { CROP_PRESETS } from '@/lib/data/crop-catalog';
import { resolveIndianCoordinates } from '@/lib/utils/geocoding';
import LineSidebar from '@/components/react-bits/LineSidebar';

const SECTION_IDS = [
  'section-irrigation',
  'section-agronomy',
  'section-telemetry',
  'section-ai',
  'section-mandi',
];

const SIDEBAR_ITEMS = [
  'Irrigation Advisory',
  'Agronomic Standards',
  'Virtual IoT Probe',
  'AI Agronomist',
  'Mandi Intelligence',
];

export default function SingleCropPage() {
  const params = useParams();
  const cropId = params?.cropId as string;
  const { profile } = useAuth();

  const [crop, setCrop] = useState<FarmerCropDetail | null>(null);
  const [weather, setWeather] = useState<WeatherForecastResponse | null>(null);
  const [mandiData, setMandiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Mandi Offered Price Evaluator States
  const [offeredPrice, setOfferedPrice] = useState<number>(2200);
  const [showGrievanceModal, setShowGrievanceModal] = useState<boolean>(false);
  const [grievanceData, setGrievanceData] = useState({
    buyerName: '',
    traderLicense: '',
    mandiYard: '',
    remarks: '',
  });
  const [grievanceTrackingId, setGrievanceTrackingId] = useState<string | null>(null);
  const [submittingGrievance, setSubmittingGrievance] = useState<boolean>(false);

  // Live IoT probe sliders + 1-click simulation
  const [activeScenario, setActiveScenario] = useState<'live' | 'drought' | 'monsoon' | 'nutrient' | 'optimal' | 'custom'>('live');
  const [activeMandiPreset, setActiveMandiPreset] = useState<'low' | 'near' | 'fair' | 'custom'>('custom');
  const [liveIot, setLiveIot] = useState({
    soilMoisture: 45,
    nitrogen: 130,
    phosphorus: 32,
    potassium: 140,
    magnesium: 38,
    calcium: 280,
    sulfur: 22,
    soilPh: 6.5,
    organicCarbon: 0.85,
    electricalConductivity: 0.35,
    temp: 28.0,
  });

  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<string, boolean>>({});
  const toggleDiagnostic = (key: string) => {
    setExpandedDiagnostics((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const expandAllDiagnostics = () => {
    setExpandedDiagnostics({
      moisture: true,
      nitrogen: true,
      phosphorus: true,
      potassium: true,
      magnesium: true,
      calcium: true,
      sulfur: true,
      ph: true,
      organicCarbon: true,
      ec: true,
      temperature: true,
    });
  };
  const collapseAllDiagnostics = () => {
    setExpandedDiagnostics({});
  };

  const applyRealtimeSoilData = async (targetProfile?: any, targetCrop?: any) => {
    setActiveScenario('live');
    const userState = targetProfile?.state || profile?.state || (targetCrop as any)?.state || 'Assam';
    const userDistrict = targetProfile?.district || profile?.district || (targetCrop as any)?.district || 'Guwahati';
    const userVillage = targetProfile?.village || profile?.village || (targetCrop as any)?.village || '';
    const userLat = targetProfile?.latitude || profile?.latitude || (targetCrop as any)?.latitude;
    const userLon = targetProfile?.longitude || profile?.longitude || (targetCrop as any)?.longitude;

    const coords = resolveIndianCoordinates(userState, userDistrict, userVillage, userLat, userLon);

    try {
      const [soilRes, weatherRes] = await Promise.all([
        fetch(`/api/v1/soil?state=${encodeURIComponent(userState)}&district=${encodeURIComponent(userDistrict)}&village=${encodeURIComponent(userVillage)}&latitude=${coords.lat}&longitude=${coords.lon}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/v1/weather?latitude=${coords.lat}&longitude=${coords.lon}`).then((r) => r.json()).catch(() => null),
      ]);

      let newMoisture = 45;
      let newTemp = 28.0;
      if (weatherRes?.data) {
        setWeather(weatherRes.data);
        if (weatherRes.data.current?.soilMoisturePct !== undefined) {
          newMoisture = Math.round(Number(weatherRes.data.current.soilMoisturePct));
        } else if (weatherRes.data.daily?.[0]?.soilMoisture0To7cm !== undefined) {
          newMoisture = Math.round(Number(weatherRes.data.daily[0].soilMoisture0To7cm) * 100);
        }
        if (weatherRes.data.current?.soilTemperatureC !== undefined) {
          newTemp = Number(weatherRes.data.current.soilTemperatureC);
        } else if (weatherRes.data.current?.temperatureC) {
          newTemp = Number(weatherRes.data.current.temperatureC);
        }
      }

      if (soilRes?.data) {
        const d = soilRes.data;
        setLiveIot({
          soilMoisture: newMoisture,
          nitrogen: Number(d.soilNitrogenMgKg) || 130,
          phosphorus: Number(d.soilPhosphorusMgKg) || 30,
          potassium: Number(d.soilPotassiumMgKg) || 135,
          magnesium: Number(d.soilMagnesiumMgKg) || 35,
          calcium: Number(d.soilCalciumMgKg) || 250,
          sulfur: Number(d.soilSulfurMgKg) || 22,
          soilPh: Number(d.soilPh) || 6.5,
          organicCarbon: Number(d.soilOrganicCarbonPct) || 0.85,
          electricalConductivity: Number(d.soilEcDsM) || 0.35,
          temp: newTemp,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch real-time soil/weather data', err);
    }
  };

  useEffect(() => {
    try {
      const userKey = profile ? `fasalmitra_crops_${profile.email || profile.id}` : 'fasalmitra_farmer_crops';
      const savedCrops = localStorage.getItem(userKey) || localStorage.getItem('fasalmitra_farmer_crops');
      let currentCrop: FarmerCropDetail | null = null;

      if (savedCrops) {
        const parsed: FarmerCropDetail[] = JSON.parse(savedCrops);
        currentCrop = parsed.find((c) => c.id === cropId) || null;
      }

      if (!currentCrop) {
        const isDemo = profile?.email?.toLowerCase().includes('ramesh') || profile?.id === 'demo-farmer-id';
        const sowingDate = isDemo
          ? new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        const daysSince = isDemo ? 36 : 0;
        const progress = isDemo ? 40 : 5;
        const preset = CROP_PRESETS[0];

        currentCrop = {
          id: cropId || (isDemo ? 'demo-tomato-malihabad' : `crop-${Date.now()}`),
          farmer_id: profile?.id || 'demo-farmer',
          crop_catalog_id: 'cat-tomato',
          custom_crop_name: 'Hybrid Cherry Tomato (Plot A)',
          land_size_acres: profile?.totalLandAcres ? profile.totalLandAcres / 2 : 2.5,
          sowing_date: sowingDate,
          expected_harvest_date: new Date(Date.now() + 54 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          irrigation_source: 'Drip',
          current_status: isDemo ? 'Vegetative' : 'Sown',
          notes: 'Drip fertigation with baseline NPK',
          created_at: new Date(Date.now() - (isDemo ? 36 : 0) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          days_since_sowing: daysSince,
          stage_progress_pct: progress,
          estimated_days_left: isDemo ? 54 : 90,
          crop_catalog: preset as any,
        };
      }

      setCrop(currentCrop);

      // Fetch real-time soil & weather API data immediately using active user profile location
      applyRealtimeSoilData(profile, currentCrop);

      // Fetch live Mandi price feed
      if (currentCrop) {
        fetch(`/api/v1/mandi-prices?commodity=${encodeURIComponent(currentCrop.crop_catalog.name)}&state=${encodeURIComponent(profile?.state || 'Assam')}`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.data) {
              setMandiData(data.data);
              if (data.data.advice?.currentModalPrice) {
                setOfferedPrice(data.data.advice.currentModalPrice);
              }
            }
          })
          .catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  }, [cropId, profile]);

  // Ensure page starts at the top on mount / refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [cropId]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSectionIndex(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSidebarClick = (index: number) => {
    setActiveSectionIndex(index);
    const targetId = SECTION_IDS[index];
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -30;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGrievance(true);
    setTimeout(() => {
      const tracking = `AGR-IN-${Date.now().toString().slice(-6)}`;
      setGrievanceTrackingId(tracking);
      setSubmittingGrievance(false);
    }, 900);
  };

  if (loading || !crop) {
    return (
      <div className="min-h-screen bg-[#FBF7EE] text-[#2D2A26] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#FEBA17] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8A7E6B] tracking-widest uppercase font-medium">Opening Crop Passport...</p>
        </div>
      </div>
    );
  }

  const catalog = crop.crop_catalog as CropCatalog;
  const rain48h = weather?.daily?.slice(0, 2).reduce((sum: number, d) => sum + (d.precipitationMm || 0), 0) || 0;
  const rainProb = weather?.daily?.[0]?.precipitationProbabilityPct || 15;

  let irrigationAdvice = 'Normal scheduled irrigation recommended today based on optimal vegetative stage moisture threshold.';
  let irrigationTone: 'optimal' | 'warning' | 'alert' = 'optimal';

  if (rain48h >= 10 || rainProb > 65) {
    irrigationAdvice = `Rain expected in next 48 hours (${rain48h.toFixed(1)} mm, ${rainProb}% probability). Postpone irrigation to conserve water and prevent root hypoxia.`;
    irrigationTone = 'warning';
  } else if (liveIot.soilMoisture < (catalog.optimal_soil_moisture_min || 40)) {
    irrigationAdvice = `Soil moisture (${liveIot.soilMoisture}%) is below optimal threshold (${catalog.optimal_soil_moisture_min}%). Apply 25-30 mm irrigation via ${crop.irrigation_source}.`;
    irrigationTone = 'alert';
  } else if (liveIot.soilMoisture > (catalog.optimal_soil_moisture_max || 70)) {
    irrigationAdvice = `Soil moisture (${liveIot.soilMoisture}%) is above optimal range (${catalog.optimal_soil_moisture_max}%). Ensure field drainage is clear.`;
    irrigationTone = 'warning';
  }

  // ==========================================================================
  // MANDI OFFER PRICE VS GOVT MSP & SPOT MODAL ALGORITHMIC EVALUATION
  // ==========================================================================
  const mspPrice = catalog.msp_price_per_quintal || 2400;
  const currentModalPrice = mandiData?.advice?.currentModalPrice || mspPrice;
  const diffMsp = offeredPrice - mspPrice;
  const diffModal = offeredPrice - currentModalPrice;
  const isSubMspExploitative = offeredPrice < mspPrice * 0.85;
  const isBelowModal = offeredPrice < currentModalPrice;

  let evaluationTone: 'critical' | 'hold' | 'sell' = 'sell';
  let evaluationHeadline = 'FAIR / HIGH SPOT PRICE — SELL NOW';
  let evaluationAdvice = `This offer of ₹${offeredPrice}/q meets or exceeds the prevailing APMC modal benchmark (+₹${Math.max(0, diffModal)}/q). Immediate sale is recommended to lock in spot market liquidity.`;

  if (isSubMspExploitative) {
    evaluationTone = 'critical';
    evaluationHeadline = 'ILLEGAL / EXPLOITATIVE LOW BID (BELOW STATUTORY MSP)';
    evaluationAdvice = `This offer is ₹${Math.abs(diffMsp)}/quintal below the Government of India Minimum Support Price (MSP: ₹${mspPrice}/q). Attempting to procure notified agricultural produce at sub-MSP rates violates APMC regulations. Do not accept this offer. You are strongly advised to file a formal grievance with the Mandi Directorate.`;
  } else if (isBelowModal) {
    evaluationTone = 'hold';
    evaluationHeadline = 'HOLD & STORE IN GODOWN / COLD STORAGE';
    evaluationAdvice = `This offer is ₹${Math.abs(diffModal)}/quintal below the current APMC modal price (₹${currentModalPrice}/q). Storing in a certified godown is projected to yield +₹${mandiData?.advice?.projectedNetGainPerQuintal || 260}/q net gain after 45 days.`;
  }

  // Dynamically compute days since sowing from actual sowing date
  const computedDaysSinceSowing = crop.sowing_date
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(crop.sowing_date).getTime()) / (1000 * 60 * 60 * 24)))
    : (crop.days_since_sowing ?? 0);
  const durationMax = catalog.duration_days_max || 90;
  const daysLeftToHarvest = Math.max(0, durationMax - computedDaysSinceSowing);

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#2D2A26] p-4 sm:p-8 lg:p-12 font-sans selection:bg-[#FEBA17]/30 selection:text-[#2D2A26]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ==================================================================
            TOP NAVIGATION & CROP HEADER
            ================================================================== */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8DFD0]">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#E98B50] hover:bg-[#FDFBF7] text-[#2D2A26] shadow-xs hover:shadow-md font-semibold text-xs transition-all duration-200 group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#F9F3E6] group-hover:bg-[#E98B50] group-hover:text-white flex items-center justify-center text-[#2D2A26] transition-colors duration-200">
                <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </div>
              <span className="font-semibold tracking-tight text-[#2D2A26] group-hover:text-[#E98B50] transition-colors">
                Back to Dashboard
              </span>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                {crop.custom_crop_name}
              </h1>
              <p className="text-xs text-[#8A7E6B] mt-0.5">
                {catalog.name} ({catalog.hindi_name}) • {crop.land_size_acres} Acres • {profile?.district || 'Lucknow'}, {profile?.state || 'UP'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD0] shadow-sm text-right">
              <span className="text-[10px] text-[#8A7E6B] uppercase tracking-wider block">Stage</span>
              <span className="text-xs font-semibold text-[#FEBA17]">{crop.current_status}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD0] shadow-sm text-right">
              <span className="text-[10px] text-[#8A7E6B] uppercase tracking-wider block">Timeline</span>
              <span className="text-xs font-semibold text-[#2D2A26]">Day {computedDaysSinceSowing}</span>
            </div>
          </div>
        </header>

        {/* ==================================================================
            MAIN CONTENT AREA WITH STICKY REACT-BITS LINE-SIDEBAR
            ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* STICKY LEFT SIDEBAR WITH LINE-SIDEBAR (VERTICALLY BALANCED ON Y-AXIS) */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-[16vh] space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFD0] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  Index
                </span>
                <h3 className="text-lg font-bold text-[#2D2A26]">
                  Crop Passport
                </h3>
              </div>

              {/* React Bits LineSidebar Component in Matte Colorway */}
              <LineSidebar
                items={SIDEBAR_ITEMS}
                accentColor="#FEBA17"
                textColor="#8A7E6B"
                markerColor="rgba(254, 186, 23, 0.4)"
                showIndex={true}
                showMarker={true}
                scaleTick={true}
                proximityRadius={100}
                maxShift={22}
                fontSize={0.92}
                itemGap={20}
                activeIndex={activeSectionIndex}
                onItemClick={handleSidebarClick}
              />

              <div className="pt-5 border-t border-[#E8DFD0] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#8A7E6B]">
                  <span>VARIETY</span>
                  <span className="text-[#2D2A26] font-semibold">{catalog.name}</span>
                </div>
                <div className="flex justify-between text-[#8A7E6B]">
                  <span>LAND AREA</span>
                  <span className="text-[#2D2A26] font-semibold">{crop.land_size_acres} Acres</span>
                </div>
                <div className="flex justify-between text-[#8A7E6B]">
                  <span>EST. HARVEST</span>
                  <span className="text-[#FEBA17] font-semibold">{crop.estimated_days_left} Days Left</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: EXPANDED SINGLE-VIEWPORT SECTIONS */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* ==============================================================
                01 / IRRIGATION & WEATHER ADVISORY (FULL VIEWPORT SCALE)
                ============================================================== */}
            <section
              id="section-irrigation"
              className="min-h-[85vh] flex flex-col justify-center py-10 border-b border-[#E8DFD0] space-y-5 scroll-mt-6"
            >
              <div className="space-y-1">
                <span className="text-[11px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  01 / Irrigation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                  Weather &amp; Water Need
                </h2>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Real-time daily advisory calculated from live 48-hour precipitation forecasts, soil moisture sensors, and botanical water coefficients.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD0]">
                  <span className="text-xs font-medium text-[#8A7E6B] uppercase tracking-wider">Agronomic Prescription</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    irrigationTone === 'alert'
                      ? 'bg-[#BC4F4F]/10 text-[#BC4F4F] border border-[#BC4F4F]/30'
                      : irrigationTone === 'warning'
                      ? 'bg-[#FEBA17]/15 text-[#A67500] border border-[#FEBA17]/40'
                      : 'bg-[#4A8C5C]/10 text-[#4A8C5C] border border-[#4A8C5C]/30'
                  }`}>
                    {irrigationTone === 'alert' ? 'Water Needed Today' : irrigationTone === 'warning' ? 'Postpone Watering' : 'Optimal Moisture'}
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1.5">
                  <span className="text-[10px] text-[#8A7E6B] uppercase font-medium block">Advisory Summary</span>
                  <p className="text-sm sm:text-base font-medium text-[#2D2A26] leading-relaxed">
                    {irrigationAdvice}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1">
                    <span className="text-[10px] text-[#8A7E6B] block uppercase">Moisture</span>
                    <span className="text-xl font-bold text-[#FEBA17] block">{liveIot.soilMoisture}%</span>
                    <span className="text-[10px] text-[#8A7E6B]">Target: {catalog.optimal_soil_moisture_min}%–{catalog.optimal_soil_moisture_max}%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1">
                    <span className="text-[10px] text-[#8A7E6B] block uppercase">Temp</span>
                    <span className="text-xl font-bold text-[#2D2A26] block">{weather?.current?.temperatureC || 28.5}°C</span>
                    <span className="text-[10px] text-[#8A7E6B]">Humidity: {weather?.current?.humidityPct || 65}%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1">
                    <span className="text-[10px] text-[#8A7E6B] block uppercase">Rain Chance</span>
                    <span className="text-xl font-bold text-[#2D2A26] block">{rainProb}%</span>
                    <span className="text-[10px] text-[#8A7E6B]">Vol: {rain48h.toFixed(1)} mm</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1">
                    <span className="text-[10px] text-[#8A7E6B] block uppercase">Source</span>
                    <span className="text-base font-bold text-[#2D2A26] block mt-1">{crop.irrigation_source}</span>
                    <span className="text-[10px] text-[#8A7E6B]">Micro-tubing</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ==============================================================
                02 / BOTANICAL STANDARDS & CORRECTIVE ACTIONS
                ============================================================== */}
            <section
              id="section-agronomy"
              className="min-h-[85vh] flex flex-col justify-center py-10 border-b border-[#E8DFD0] space-y-5 scroll-mt-6"
            >
              <div className="space-y-1">
                <span className="text-[11px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  02 / Agronomy
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                  Telemetry vs. Standards &amp; Action Plan
                </h2>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Real-time side-by-side comparison against ICAR/FAO-56 botanical thresholds for {catalog.name}. Automated corrective actions adapt whenever readings deviate.
                </p>
              </div>

              {/* Section 02 Diagnostic Matrix */}
              {(() => {
                const diagnosticItems = [
                  {
                    id: 'moisture',
                    name: 'Soil Moisture',
                    value: `${liveIot.soilMoisture}%`,
                    standard: `${catalog.optimal_soil_moisture_min || 45}%–${catalog.optimal_soil_moisture_max || 65}%`,
                    status:
                      liveIot.soilMoisture < (catalog.optimal_soil_moisture_min || 45)
                        ? 'Deficit'
                        : liveIot.soilMoisture > (catalog.optimal_soil_moisture_max || 65)
                        ? 'Waterlogged'
                        : 'Optimal',
                    statusType:
                      liveIot.soilMoisture < (catalog.optimal_soil_moisture_min || 45)
                        ? 'warning'
                        : liveIot.soilMoisture > (catalog.optimal_soil_moisture_max || 65)
                        ? 'danger'
                        : 'success',
                    actionTitle:
                      liveIot.soilMoisture < (catalog.optimal_soil_moisture_min || 45) || liveIot.soilMoisture > (catalog.optimal_soil_moisture_max || 65)
                        ? 'Recommended Action:'
                        : 'Status:',
                    actionText:
                      liveIot.soilMoisture < (catalog.optimal_soil_moisture_min || 45)
                        ? `Apply 25-30 mm irrigation via ${crop.irrigation_source} immediately. Mulch root zones with dry straw to reduce evaporation by 35%.`
                        : liveIot.soilMoisture > (catalog.optimal_soil_moisture_max || 65)
                        ? `Withhold all irrigation immediately. Clear perimeter drainage furrows to aerate root zones and prevent fungal root rot (Phytophthora).`
                        : `Soil moisture is balanced within optimal agronomic thresholds for ${crop.current_status} stage. Maintain standard scheduling.`,
                  },
                  {
                    id: 'nitrogen',
                    name: 'Available Nitrogen (N)',
                    value: `${liveIot.nitrogen} mg/kg`,
                    standard: `${catalog.optimal_nitrogen_min || 100}–${catalog.optimal_nitrogen_max || 150} mg/kg`,
                    status:
                      liveIot.nitrogen < (catalog.optimal_nitrogen_min || 100)
                        ? 'Deficient'
                        : liveIot.nitrogen > (catalog.optimal_nitrogen_max || 150)
                        ? 'Excess'
                        : 'Adequate',
                    statusType:
                      liveIot.nitrogen < (catalog.optimal_nitrogen_min || 100)
                        ? 'warning'
                        : liveIot.nitrogen > (catalog.optimal_nitrogen_max || 150)
                        ? 'danger'
                        : 'success',
                    actionTitle:
                      liveIot.nitrogen < (catalog.optimal_nitrogen_min || 100) || liveIot.nitrogen > (catalog.optimal_nitrogen_max || 150)
                        ? 'Recommended Action:'
                        : 'Status:',
                    actionText:
                      liveIot.nitrogen < (catalog.optimal_nitrogen_min || 100)
                        ? `Side-dress with Neem-coated Urea @ 25 kg/acre or apply 2% foliar spray of water-soluble 19:19:19 NPK in early morning for rapid chlorophyll uptake.`
                        : liveIot.nitrogen > (catalog.optimal_nitrogen_max || 150)
                        ? `Suspend all nitrogenous fertilizers immediately. Flush with light irrigation to leach excess nitrates and incorporate bio-char or compost to bind free nitrogen.`
                        : `Nitrogen concentration is balanced for vegetative leaf canopy synthesis without risk of succulent lodging.`,
                  },
                  {
                    id: 'phosphorus',
                    name: 'Available Phosphorus (P)',
                    value: `${liveIot.phosphorus} mg/kg`,
                    standard: `${catalog.optimal_phosphorus_min || 35}–${catalog.optimal_phosphorus_max || 75} mg/kg`,
                    status:
                      liveIot.phosphorus < (catalog.optimal_phosphorus_min || 35)
                        ? 'Deficient'
                        : liveIot.phosphorus > (catalog.optimal_phosphorus_max || 75)
                        ? 'Excess'
                        : 'Adequate',
                    statusType:
                      liveIot.phosphorus < (catalog.optimal_phosphorus_min || 35)
                        ? 'warning'
                        : liveIot.phosphorus > (catalog.optimal_phosphorus_max || 75)
                        ? 'danger'
                        : 'success',
                    actionTitle:
                      liveIot.phosphorus < (catalog.optimal_phosphorus_min || 35) || liveIot.phosphorus > (catalog.optimal_phosphorus_max || 75)
                        ? 'Recommended Action:'
                        : 'Status:',
                    actionText:
                      liveIot.phosphorus < (catalog.optimal_phosphorus_min || 35)
                        ? `Apply Single Super Phosphate (SSP) @ 50 kg/acre or Di-ammonium Phosphate (DAP) @ 30 kg/acre at root zone. Boosts root establishment, cellular ATP, and floral bud set.`
                        : liveIot.phosphorus > (catalog.optimal_phosphorus_max || 75)
                        ? `Excess phosphorus inhibits zinc and iron uptake. Suspend phosphatic fertilizers and apply Zinc Sulfate @ 5 kg/acre.`
                        : `Phosphorus levels are optimal for root branching, flowering, and energy metabolism.`,
                  },
                  {
                    id: 'potassium',
                    name: 'Available Potassium (K)',
                    value: `${liveIot.potassium} mg/kg`,
                    standard: `${catalog.optimal_potassium_min || 110}–${catalog.optimal_potassium_max || 180} mg/kg`,
                    status:
                      liveIot.potassium < (catalog.optimal_potassium_min || 110)
                        ? 'Deficient'
                        : liveIot.potassium > (catalog.optimal_potassium_max || 180)
                        ? 'Excess'
                        : 'Adequate',
                    statusType:
                      liveIot.potassium < (catalog.optimal_potassium_min || 110)
                        ? 'warning'
                        : liveIot.potassium > (catalog.optimal_potassium_max || 180)
                        ? 'danger'
                        : 'success',
                    actionTitle:
                      liveIot.potassium < (catalog.optimal_potassium_min || 110) || liveIot.potassium > (catalog.optimal_potassium_max || 180)
                        ? 'Recommended Action:'
                        : 'Status:',
                    actionText:
                      liveIot.potassium < (catalog.optimal_potassium_min || 110)
                        ? `Apply Muriate of Potash (MOP / 0:0:60) @ 25 kg/acre or 0:0:50 (SOP) through drip. Potassium governs stomatal regulation, disease immunity, and fruit firmness.`
                        : liveIot.potassium > (catalog.optimal_potassium_max || 180)
                        ? `High potassium can suppress magnesium and calcium uptake. Flush root zone with clean water and balance irrigation.`
                        : `Potassium concentration is in perfect equilibrium for enzyme activation and osmotic regulation.`,
                  },
                  {
                    id: 'magnesium',
                    name: 'Magnesium (Mg)',
                    value: `${liveIot.magnesium} mg/kg`,
                    standard: '30–70 mg/kg',
                    status: liveIot.magnesium < 30 ? 'Deficient' : liveIot.magnesium > 70 ? 'Excess' : 'Adequate',
                    statusType: liveIot.magnesium < 30 ? 'warning' : liveIot.magnesium > 70 ? 'danger' : 'success',
                    actionTitle: liveIot.magnesium < 30 || liveIot.magnesium > 70 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.magnesium < 30
                        ? `Foliar spray Magnesium Sulfate (MgSO4 / Epsom Salt @ 5 g/L) or soil application @ 15 kg/acre. Magnesium is the central molecule of chlorophyll; deficiency causes interveinal chlorosis in older leaves.`
                        : liveIot.magnesium > 70
                        ? `Elevated magnesium may interfere with potassium uptake. Balance fertigation with soluble potassium.`
                        : `Magnesium content is optimal for photosynthesis and enzyme phosphorylation.`,
                  },
                  {
                    id: 'calcium',
                    name: 'Calcium (Ca)',
                    value: `${liveIot.calcium} mg/kg`,
                    standard: '250–600 mg/kg',
                    status: liveIot.calcium < 250 ? 'Deficient' : liveIot.calcium > 600 ? 'Excess' : 'Adequate',
                    statusType: liveIot.calcium < 250 ? 'warning' : liveIot.calcium > 600 ? 'danger' : 'success',
                    actionTitle: liveIot.calcium < 250 || liveIot.calcium > 600 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.calcium < 250
                        ? `Apply Calcium Nitrate @ 10 kg/acre via drip or gypsum @ 100 kg/acre. Calcium fortifies cell walls, root tips, and prevents blossom end rot & fruit cracking.`
                        : liveIot.calcium > 600
                        ? `High calcium can induce alkaline fixation of phosphorus. Maintain organic mulch.`
                        : `Calcium reserves support sturdy plant stems and high post-harvest shelf life.`,
                  },
                  {
                    id: 'sulfur',
                    name: 'Available Sulfur (S)',
                    value: `${liveIot.sulfur} mg/kg`,
                    standard: '15–40 mg/kg',
                    status: liveIot.sulfur < 15 ? 'Deficient' : liveIot.sulfur > 40 ? 'Excess' : 'Adequate',
                    statusType: liveIot.sulfur < 15 ? 'warning' : liveIot.sulfur > 40 ? 'danger' : 'success',
                    actionTitle: liveIot.sulfur < 15 || liveIot.sulfur > 40 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.sulfur < 15
                        ? `Apply Bentonite Sulfur 90% @ 10 kg/acre or Ammonium Sulfate @ 20 kg/acre. Sulfur is vital for oil synthesis, protein formation (cysteine/methionine), and aromatic flavor.`
                        : liveIot.sulfur > 40
                        ? `Adequate to elevated sulfur. Safe range for plant metabolism.`
                        : `Sulfur availability supports robust amino acid synthesis and enzyme development.`,
                  },
                  {
                    id: 'ph',
                    name: 'Soil pH & Reaction',
                    value: `${liveIot.soilPh} pH`,
                    standard: `${catalog.optimal_ph_min || 6.0}–${catalog.optimal_ph_max || 6.8} pH`,
                    status:
                      liveIot.soilPh < (catalog.optimal_ph_min || 6.0)
                        ? 'Acidic'
                        : liveIot.soilPh > (catalog.optimal_ph_max || 6.8)
                        ? 'Alkaline'
                        : 'Neutral / Optimal',
                    statusType:
                      liveIot.soilPh < (catalog.optimal_ph_min || 6.0)
                        ? 'warning'
                        : liveIot.soilPh > (catalog.optimal_ph_max || 6.8)
                        ? 'danger'
                        : 'success',
                    actionTitle:
                      liveIot.soilPh < (catalog.optimal_ph_min || 6.0) || liveIot.soilPh > (catalog.optimal_ph_max || 6.8)
                        ? 'Recommended Action:'
                        : 'Status:',
                    actionText:
                      liveIot.soilPh < (catalog.optimal_ph_min || 6.0)
                        ? `Broadcast Agricultural Lime (CaCO3) or Dolomite @ 150-200 kg/acre to neutralize acidity and unlock blocked phosphorus & calcium.`
                        : liveIot.soilPh > (catalog.optimal_ph_max || 6.8)
                        ? `Apply Agricultural Gypsum (CaSO4) @ 250 kg/acre or incorporate well-decomposed Farmyard Manure (FYM) and elemental sulfur (15 kg/acre) to lower soil alkalinity.`
                        : `Soil pH (${liveIot.soilPh}) is in the optimal range. Macro and micronutrient cation exchange capacity is at maximum efficiency.`,
                  },
                  {
                    id: 'organicCarbon',
                    name: 'Organic Carbon (OC)',
                    value: `${liveIot.organicCarbon}%`,
                    standard: '0.50%–1.20%',
                    status: liveIot.organicCarbon < 0.50 ? 'Low' : liveIot.organicCarbon > 1.20 ? 'Rich' : 'Optimal',
                    statusType: liveIot.organicCarbon < 0.50 ? 'warning' : 'success',
                    actionTitle: liveIot.organicCarbon < 0.50 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.organicCarbon < 0.50
                        ? `Apply 4-5 tonnes/acre of well-rotted Farmyard Manure (FYM) or Vermicompost. In-situ incorporation of Dhaincha/Sunhemp green manure boosts soil carbon.`
                        : `Organic carbon reserves maintain stable crumb structure, nutrient holding capacity, and healthy rhizosphere biology.`,
                  },
                  {
                    id: 'ec',
                    name: 'Salinity (EC)',
                    value: `${liveIot.electricalConductivity} dS/m`,
                    standard: '< 1.00 dS/m',
                    status: liveIot.electricalConductivity > 1.50 ? 'Saline Stress' : liveIot.electricalConductivity > 1.00 ? 'Slight Salinity' : 'Normal',
                    statusType: liveIot.electricalConductivity > 1.50 ? 'danger' : liveIot.electricalConductivity > 1.00 ? 'warning' : 'success',
                    actionTitle: liveIot.electricalConductivity > 1.00 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.electricalConductivity > 1.00
                        ? `High soluble salt concentration creates osmotic drought stress. Provide heavy leaching irrigation with good drainage, avoid chloride-based fertilizers (use SOP instead of MOP).`
                        : `Electrical conductivity is within safe non-saline limits. Root osmotic water uptake is unimpeded.`,
                  },
                  {
                    id: 'temperature',
                    name: 'Soil Temperature',
                    value: `${liveIot.temp.toFixed(1)}°C`,
                    standard: '20°C–32°C',
                    status: liveIot.temp < 20 ? 'Low Temp' : liveIot.temp > 32 ? 'Heat Stress' : 'Optimal',
                    statusType: liveIot.temp < 20 ? 'warning' : liveIot.temp > 32 ? 'danger' : 'success',
                    actionTitle: liveIot.temp < 20 || liveIot.temp > 32 ? 'Recommended Action:' : 'Status:',
                    actionText:
                      liveIot.temp < 20
                        ? `Low soil temperature slows nutrient uptake and microbial mineralization. Reduce irrigation volume and apply black plastic or straw mulch to warm root zone.`
                        : liveIot.temp > 32
                        ? `Elevated soil heat increases root respiration and evaporation. Mulch with crop residues (5-7 cm layer) and irrigate during cooler morning/evening hours.`
                        : `Soil temperature is in ideal biological range for root respiration and nutrient uptake.`,
                  },
                ];

                const attentionCount = diagnosticItems.filter((i) => i.statusType !== 'success').length;

                return (
                  <div className="space-y-4">
                    {/* Header Controls / Filter Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E8DFD0] shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold text-[#2D2A26]">
                          Telemetry Matrix ({diagnosticItems.length} Parameters)
                        </span>
                        {attentionCount > 0 ? (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEBA17]/20 text-[#855B00] border border-[#FEBA17]/40 flex items-center gap-1">
                            <span>⚠️</span> {attentionCount} Need Attention
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#4A8C5C]/15 text-[#4A8C5C] border border-[#4A8C5C]/30 flex items-center gap-1">
                            <span>✓</span> All In Optimal Range
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={expandAllDiagnostics}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#F9F3E6] hover:bg-[#F3CD97]/50 text-[#2D2A26] border border-[#E8DFD0] transition-all cursor-pointer"
                        >
                          Expand All Fixes
                        </button>
                        <button
                          type="button"
                          onClick={collapseAllDiagnostics}
                          className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-[#F9F3E6] hover:bg-[#F3CD97]/50 text-[#8A7E6B] hover:text-[#2D2A26] border border-[#E8DFD0] transition-all cursor-pointer"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {/* Responsive Grid Format (1 col mobile, 2 col tablet, 3 col desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                      {diagnosticItems.map((item) => {
                        const isExpanded = !!expandedDiagnostics[item.id];
                        const isAlert = item.statusType !== 'success';

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                              isAlert
                                ? 'bg-[#FEF9EE] border-[#F3CD97] shadow-xs'
                                : 'bg-white border-[#E8DFD0] hover:border-[#D4C3A3] shadow-xs'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top row: Name & Status Badge */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="font-semibold text-sm text-[#2D2A26] block truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] text-[#8A7E6B] block mt-0.5">
                                    Standard: {item.standard}
                                  </span>
                                </div>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                                    item.statusType === 'warning'
                                      ? 'bg-[#FEBA17]/20 text-[#855B00] border border-[#FEBA17]/50'
                                      : item.statusType === 'danger'
                                      ? 'bg-[#BC4F4F]/10 text-[#BC4F4F] border border-[#BC4F4F]/30'
                                      : 'bg-[#4A8C5C]/15 text-[#4A8C5C] border border-[#4A8C5C]/30'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              {/* Reading value */}
                              <div className="flex items-baseline justify-between pt-1 border-t border-[#E8DFD0]/60">
                                <span className="text-xs text-[#8A7E6B]">Live Sensor Value</span>
                                <span
                                  className={`text-base sm:text-lg font-bold ${
                                    item.statusType === 'warning'
                                      ? 'text-[#A67500]'
                                      : item.statusType === 'danger'
                                      ? 'text-[#BC4F4F]'
                                      : 'text-[#2D2A26]'
                                  }`}
                                >
                                  {item.value}
                                </span>
                              </div>
                            </div>

                            {/* Click to Reveal Fix Toggle */}
                            <div className="mt-4 pt-3 border-t border-[#E8DFD0]/60 space-y-2">
                              <button
                                type="button"
                                onClick={() => toggleDiagnostic(item.id)}
                                className={`w-full text-xs font-semibold py-2 px-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#2D2A26] text-white border-[#2D2A26] shadow-xs'
                                    : isAlert
                                    ? 'bg-[#FEBA17]/20 text-[#855B00] border-[#FEBA17]/50 hover:bg-[#FEBA17]/35'
                                    : 'bg-[#F9F3E6] text-[#5C5549] border-[#E8DFD0] hover:bg-[#F3CD97]/40 hover:text-[#2D2A26]'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 text-[11px]">
                                  {isAlert ? '⚠️' : '💡'}{' '}
                                  {isExpanded
                                    ? 'Hide Recommendation'
                                    : isAlert
                                    ? 'Click to Fix & View Action'
                                    : 'Click for Agronomic Insight'}
                                </span>
                                <span className="text-[10px] font-bold">
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </button>

                              {/* Expandable Action Recommendation */}
                              {isExpanded && (
                                <div
                                  className={`p-3 rounded-xl text-xs leading-relaxed border transition-all ${
                                    item.statusType === 'warning'
                                      ? 'bg-[#FEBA17]/15 border-[#FEBA17]/35 text-[#2D2A26]'
                                      : item.statusType === 'danger'
                                      ? 'bg-[#BC4F4F]/10 border-[#BC4F4F]/25 text-[#2D2A26]'
                                      : 'bg-[#F9F3E6] border-[#E8DFD0] text-[#5C5549]'
                                  }`}
                                >
                                  <strong className="text-[#2D2A26] block text-[10px] uppercase mb-1 tracking-wider">
                                    {item.actionTitle}
                                  </strong>
                                  <p className="text-xs leading-relaxed text-[#2D2A26]">
                                    {item.actionText}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

                {/* Botanical Baseline Guidelines */}
                <div className="p-6 rounded-2xl bg-white border border-[#E8DFD0] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs shadow-sm">
                  <div>
                    <span className="text-[#8A7E6B] block text-[10px] uppercase">Duration &amp; Stage</span>
                    <span className="font-semibold text-sm text-[#2D2A26] mt-0.5 block">
                      {catalog.duration_days_min}–{catalog.duration_days_max} Days ({daysLeftToHarvest} days to harvest)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A7E6B] block text-[10px] uppercase">ICAR Basal Fertilizer Standard</span>
                    <span className="font-semibold text-sm text-[#2D2A26] mt-0.5 block">
                      {(catalog.fertilizer_guide as any)?.basal || 'DAP 50 kg + MOP 30 kg / acre at land prep'}
                    </span>
                  </div>
                </div>
            </section>

            {/* ==============================================================
                03 / VIRTUAL IOT PROBE & SIMULATOR (FULL VIEWPORT SCALE)
                ============================================================== */}
            <section
              id="section-telemetry"
              className="min-h-[85vh] flex flex-col justify-center py-10 border-b border-[#E8DFD0] space-y-5 scroll-mt-6"
            >
              <div className="space-y-1">
                <span className="text-[11px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  03 / Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                  Interactive IoT Probe
                </h2>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Simulate live soil moisture and comprehensive nutrient changes (N, P, K, Mg, Ca, S, pH, OC, EC). The AI Agronomist instantly adapts advice and fertilizer calculations to your sliders.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] space-y-6 shadow-sm">
                {/* 1-Click Simulation Presets */}
                <div className="space-y-2.5">
                  <span className="text-xs font-medium text-[#8A7E6B] uppercase tracking-wider block">1-Click Scenarios</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <button
                      type="button"
                      onClick={() => applyRealtimeSoilData()}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        activeScenario === 'live'
                          ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                          : 'bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border-[#E8DFD0] text-[#2D2A26]'
                      }`}
                    >
                      Live Soil API
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLiveIot({
                          soilMoisture: 16,
                          nitrogen: 80,
                          phosphorus: 24,
                          potassium: 110,
                          magnesium: 28,
                          calcium: 240,
                          sulfur: 12,
                          soilPh: 7.6,
                          organicCarbon: 0.40,
                          electricalConductivity: 1.85,
                          temp: 36,
                        });
                        setActiveScenario('drought');
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        activeScenario === 'drought'
                          ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                          : 'bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border-[#E8DFD0] text-[#2D2A26]'
                      }`}
                    >
                      Drought Stress
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLiveIot({
                          soilMoisture: 88,
                          nitrogen: 60,
                          phosphorus: 28,
                          potassium: 90,
                          magnesium: 32,
                          calcium: 280,
                          sulfur: 14,
                          soilPh: 6.4,
                          organicCarbon: 0.70,
                          electricalConductivity: 0.40,
                          temp: 23,
                        });
                        setActiveScenario('monsoon');
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        activeScenario === 'monsoon'
                          ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                          : 'bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border-[#E8DFD0] text-[#2D2A26]'
                      }`}
                    >
                      Heavy Monsoon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLiveIot({
                          soilMoisture: 45,
                          nitrogen: 30,
                          phosphorus: 12,
                          potassium: 40,
                          magnesium: 14,
                          calcium: 110,
                          sulfur: 8,
                          soilPh: 5.7,
                          organicCarbon: 0.28,
                          electricalConductivity: 0.25,
                          temp: 25,
                        });
                        setActiveScenario('nutrient');
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        activeScenario === 'nutrient'
                          ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                          : 'bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border-[#E8DFD0] text-[#2D2A26]'
                      }`}
                    >
                      Nutrient Low
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const optMoisture = Math.round(((catalog.optimal_soil_moisture_min || 45) + (catalog.optimal_soil_moisture_max || 65)) / 2);
                        const optN = Math.round(((catalog.optimal_nitrogen_min || 100) + (catalog.optimal_nitrogen_max || 150)) / 2);
                        const optP = Math.round(((catalog.optimal_phosphorus_min || 35) + (catalog.optimal_phosphorus_max || 75)) / 2);
                        const optK = Math.round(((catalog.optimal_potassium_min || 110) + (catalog.optimal_potassium_max || 180)) / 2);
                        const optPh = Number((((catalog.optimal_ph_min || 6.0) + (catalog.optimal_ph_max || 6.8)) / 2).toFixed(1));
                        const optTemp = Number((((catalog.optimal_temperature_min || 20) + (catalog.optimal_temperature_max || 28)) / 2).toFixed(1));

                        setLiveIot({
                          soilMoisture: optMoisture,
                          nitrogen: optN,
                          phosphorus: optP,
                          potassium: optK,
                          magnesium: 52,
                          calcium: 420,
                          sulfur: 26,
                          soilPh: optPh,
                          organicCarbon: 0.85,
                          electricalConductivity: 0.75,
                          temp: optTemp,
                        });
                        setActiveScenario('optimal');
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        activeScenario === 'optimal'
                          ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                          : 'bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border-[#E8DFD0] text-[#2D2A26]'
                      }`}
                    >
                      Optimal State
                    </button>
                  </div>
                </div>

                {/* 1. Primary Macronutrients & Moisture */}
                <div className="space-y-3 pt-4 border-t border-[#E8DFD0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Primary Macronutrients &amp; Moisture</span>
                    <span className="text-[10px] text-[#8A7E6B]">NPK &amp; Volumetric Moisture</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Moisture */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Moisture</span>
                        <span className="font-bold text-sm text-[#FEBA17]">{liveIot.soilMoisture}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={liveIot.soilMoisture}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, soilMoisture: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>5% Dry</span>
                        <span>Target: {catalog.optimal_soil_moisture_min || 45}-{catalog.optimal_soil_moisture_max || 65}%</span>
                        <span>95% Sat</span>
                      </div>
                    </div>

                    {/* Nitrogen (N) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Nitrogen (N)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.nitrogen} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="250"
                        step="5"
                        value={liveIot.nitrogen}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, nitrogen: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>10 mg</span>
                        <span>Opt: {catalog.optimal_nitrogen_min || 100}-{catalog.optimal_nitrogen_max || 150}</span>
                        <span>250 mg</span>
                      </div>
                    </div>

                    {/* Phosphorus (P) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Phosphorus (P)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.phosphorus} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="1"
                        value={liveIot.phosphorus}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, phosphorus: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>5 mg</span>
                        <span>Opt: {catalog.optimal_phosphorus_min || 35}-{catalog.optimal_phosphorus_max || 75}</span>
                        <span>120 mg</span>
                      </div>
                    </div>

                    {/* Potassium (K) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Potassium (K)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.potassium} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="350"
                        step="5"
                        value={liveIot.potassium}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, potassium: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>20 mg</span>
                        <span>Opt: {catalog.optimal_potassium_min || 110}-{catalog.optimal_potassium_max || 180}</span>
                        <span>350 mg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Secondary Macronutrients & Soil Reaction */}
                <div className="space-y-3 pt-4 border-t border-[#E8DFD0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Secondary Nutrients &amp; Reaction</span>
                    <span className="text-[10px] text-[#8A7E6B]">Mg, Ca, Sulfur &amp; Soil pH</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Magnesium (Mg) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Magnesium (Mg)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.magnesium} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        step="1"
                        value={liveIot.magnesium}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, magnesium: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>5 mg</span>
                        <span>Opt: 30–70 mg/kg</span>
                        <span>150 mg</span>
                      </div>
                    </div>

                    {/* Calcium (Ca) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Calcium (Ca)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.calcium} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="10"
                        value={liveIot.calcium}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, calcium: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>50 mg</span>
                        <span>Opt: 250–600 mg/kg</span>
                        <span>1000 mg</span>
                      </div>
                    </div>

                    {/* Sulfur (S) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Sulfur (S)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.sulfur} <span className="text-[10px] text-[#8A7E6B] font-normal">mg/kg</span></span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="80"
                        step="1"
                        value={liveIot.sulfur}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, sulfur: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>2 mg</span>
                        <span>Opt: 15–40 mg/kg</span>
                        <span>80 mg</span>
                      </div>
                    </div>

                    {/* Soil pH */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Soil pH Level</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.soilPh} <span className="text-[10px] text-[#8A7E6B] font-normal">pH</span></span>
                      </div>
                      <input
                        type="range"
                        min="4.5"
                        max="9.5"
                        step="0.1"
                        value={liveIot.soilPh}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, soilPh: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>4.5 Acidic</span>
                        <span>Opt: {catalog.optimal_ph_min || 6.0}–{catalog.optimal_ph_max || 6.8}</span>
                        <span>9.5 Alkaline</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Soil Health, Salinity & Temperature */}
                <div className="space-y-3 pt-4 border-t border-[#E8DFD0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Soil Health, Salinity &amp; Temperature</span>
                    <span className="text-[10px] text-[#8A7E6B]">Organic Carbon, EC &amp; Thermal Balance</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Organic Carbon (OC) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Organic Carbon (OC)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.organicCarbon}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="2.50"
                        step="0.05"
                        value={liveIot.organicCarbon}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, organicCarbon: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>0.10% Poor</span>
                        <span>Opt: 0.60%–1.20%</span>
                        <span>2.50% Rich</span>
                      </div>
                    </div>

                    {/* Electrical Conductivity (EC) */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Salinity (EC)</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.electricalConductivity} <span className="text-[10px] text-[#8A7E6B] font-normal">dS/m</span></span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="4.00"
                        step="0.05"
                        value={liveIot.electricalConductivity}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, electricalConductivity: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>0.10 Non-saline</span>
                        <span>Opt: &lt; 1.5 dS/m</span>
                        <span>4.00 Saline</span>
                      </div>
                    </div>

                    {/* Soil Temperature */}
                    <div className="p-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A7E6B] uppercase font-medium">Soil Temperature</span>
                        <span className="font-bold text-sm text-[#2D2A26]">{liveIot.temp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="45"
                        step="0.5"
                        value={liveIot.temp}
                        onChange={(e) => {
                          setLiveIot({ ...liveIot, temp: Number(e.target.value) });
                          setActiveScenario('custom');
                        }}
                        className="w-full accent-[#FEBA17] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#8A7E6B]">
                        <span>12°C Cold</span>
                        <span>Opt: {catalog.optimal_temperature_min || 20}–{catalog.optimal_temperature_max || 28}°C</span>
                        <span>45°C Hot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==============================================================
                04 / AI AGRONOMIST CHAT (FULL VIEWPORT SCALE)
                ============================================================== */}
            <section
              id="section-ai"
              className="min-h-[85vh] flex flex-col justify-center py-10 border-b border-[#E8DFD0] space-y-5 scroll-mt-6"
            >
              <div className="space-y-1">
                <span className="text-[11px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  04 / Intelligence
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                  AI Agronomist
                </h2>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Ask questions about dosage, leaf disease spots, or spray schedules. Powered by local Llama 3.1 8B &amp; Google Gemini.
                </p>
              </div>

              <div>
                <CropChatSection
                  crop={crop}
                  liveIotData={liveIot}
                  farmerProfile={{
                    village: profile?.village,
                    district: profile?.district,
                    state: profile?.state,
                    soilType: profile?.soilType,
                  }}
                  weather={weather}
                />
              </div>
            </section>

            {/* ==============================================================
                05 / APMC MANDI INTELLIGENCE & OFFER EVALUATOR
                ============================================================== */}
            <section
              id="section-mandi"
              className="min-h-[85vh] flex flex-col justify-center py-10 space-y-5 scroll-mt-6"
            >
              <div className="space-y-1">
                <span className="text-[11px] tracking-[0.15em] text-[#8A7E6B] uppercase block">
                  05 / Commerce
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2A26]">
                  Mandi Intelligence
                </h2>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Real-time Government of India APMC spot prices, statutory MSP benchmarks, and live offer evaluation engine for {catalog.name}.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] space-y-6 shadow-sm">
                
                {/* 1. Official Price Metric Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1.5">
                    <span className="text-[10px] text-[#8A7E6B] uppercase font-medium block">Spot Modal Price</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#FEBA17] block">
                      ₹{currentModalPrice}
                      <span className="text-xs font-normal text-[#8A7E6B]"> / quintal</span>
                    </span>
                    <span className="text-xs text-[#8A7E6B] block">Market: {profile?.district || 'Regional'} Mandi</span>
                  </div>

                  <div className="p-5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1.5">
                    <span className="text-[10px] text-[#8A7E6B] uppercase font-medium block">Statutory MSP</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#2D2A26] block">
                      ₹{mspPrice}
                      <span className="text-xs font-normal text-[#8A7E6B]"> / quintal</span>
                    </span>
                    <span className="text-xs text-[#8A7E6B] block">Govt of India Benchmark</span>
                  </div>

                  <div className="p-5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-1.5">
                    <span className="text-[10px] text-[#8A7E6B] uppercase font-medium block">Storage Margin</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#4A8C5C] block">
                      +₹{mandiData?.advice?.projectedNetGainPerQuintal || 260}
                      <span className="text-xs font-normal text-[#8A7E6B]"> / q</span>
                    </span>
                    <span className="text-xs text-[#8A7E6B] block">Net after 45d storage</span>
                  </div>
                </div>

                {/* 2. Interactive Mandi Offer Price Evaluator */}
                <div className="p-5 sm:p-6 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DFD0]">
                    <div>
                      <h4 className="font-bold text-sm text-[#2D2A26]">
                        Mandi Offer Price Evaluator
                      </h4>
                      <p className="text-xs text-[#8A7E6B]">
                        Enter the price offered to you by a local trader to run instant MSP and spot market compliance checks.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#8A7E6B]">Crop:</span>
                      <span className="font-semibold text-[#2D2A26]">{catalog.name}</span>
                    </div>
                  </div>

                  {/* Input & Quick Presets */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-6 space-y-1.5">
                      <label className="text-xs font-medium text-[#8A7E6B] block">
                        Offered Rate (₹ / Quintal)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8A7E6B] font-bold">₹</span>
                        <input
                          type="number"
                          value={offeredPrice || ''}
                          onChange={(e) => {
                            setOfferedPrice(Number(e.target.value));
                            setActiveMandiPreset('custom');
                          }}
                          step="25"
                          min="500"
                          max="15000"
                          placeholder="e.g. 2350"
                          className="w-full bg-white border border-[#E8DFD0] rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-1.5">
                      <label className="text-xs font-medium text-[#8A7E6B] block">
                        Quick Presets
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOfferedPrice(Math.round(mspPrice * 0.65));
                            setActiveMandiPreset('low');
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            activeMandiPreset === 'low'
                              ? 'bg-[#BC4F4F]/20 border-[#BC4F4F] text-[#BC4F4F] font-bold shadow-sm ring-1 ring-[#BC4F4F]/30'
                              : 'bg-white hover:bg-[#BC4F4F]/10 border-[#BC4F4F]/30 text-[#BC4F4F]'
                          }`}
                        >
                          Low Bid (₹{Math.round(mspPrice * 0.65)})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOfferedPrice(Math.round(mspPrice * 0.95));
                            setActiveMandiPreset('near');
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            activeMandiPreset === 'near'
                              ? 'bg-[#FEBA17] border-[#FEBA17] text-[#14160C] font-bold shadow-xs'
                              : 'bg-white hover:bg-[#FEBA17]/20 border-[#FEBA17]/40 text-[#A67500]'
                          }`}
                        >
                          Near MSP (₹{Math.round(mspPrice * 0.95)})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOfferedPrice(currentModalPrice + 150);
                            setActiveMandiPreset('fair');
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            activeMandiPreset === 'fair'
                              ? 'bg-[#4A8C5C]/20 border-[#4A8C5C] text-[#4A8C5C] font-bold shadow-sm ring-1 ring-[#4A8C5C]/30'
                              : 'bg-white hover:bg-[#4A8C5C]/10 border-[#4A8C5C]/30 text-[#4A8C5C]'
                          }`}
                        >
                          Fair Spot (₹{currentModalPrice + 150})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Algorithmic Decision Banner */}
                  <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-all ${
                    evaluationTone === 'critical'
                      ? 'bg-[#BC4F4F]/10 border-[#BC4F4F]/30 text-[#2D2A26]'
                      : evaluationTone === 'hold'
                      ? 'bg-[#FEBA17]/15 border-[#FEBA17]/40 text-[#2D2A26]'
                      : 'bg-[#4A8C5C]/10 border-[#4A8C5C]/30 text-[#2D2A26]'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className={`text-xs uppercase tracking-wider font-bold ${
                        evaluationTone === 'critical'
                          ? 'text-[#BC4F4F]'
                          : evaluationTone === 'hold'
                          ? 'text-[#A67500]'
                          : 'text-[#4A8C5C]'
                      }`}>
                        {evaluationHeadline}
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span>vs MSP: <strong className={diffMsp < 0 ? 'text-[#BC4F4F]' : 'text-[#4A8C5C]'}>{diffMsp >= 0 ? '+' : ''}₹{diffMsp}/q</strong></span>
                        <span>vs Modal: <strong className={diffModal < 0 ? 'text-[#A67500]' : 'text-[#4A8C5C]'}>{diffModal >= 0 ? '+' : ''}₹{diffModal}/q</strong></span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-[#2D2A26]">
                      {evaluationAdvice}
                    </p>

                    {/* Government Grievance Callout Button if Exploitative */}
                    {isSubMspExploitative && (
                      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#BC4F4F]/20">
                        <div className="text-xs text-[#BC4F4F]">
                          <strong>Violates APMC Rules:</strong> Sub-MSP bids without statutory deductions are prohibited.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGrievanceData({
                              buyerName: '',
                              traderLicense: '',
                              mandiYard: `${profile?.district || 'Lucknow'} Mandi Yard`,
                              remarks: `Attempted procurement of ${catalog.name} at ₹${offeredPrice}/quintal against statutory Government MSP of ₹${mspPrice}/quintal.`,
                            });
                            setShowGrievanceModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#BC4F4F] hover:bg-[#A33D3D] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0"
                        >
                          <span>File Buyer Grievance</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </section>

          </main>
        </div>

      </div>

      {/* ====================================================================
          GOVERNMENT APMC & KISAN GRIEVANCE REDRESSAL MODAL
          ==================================================================== */}
      {showGrievanceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] shadow-xl text-[#2D2A26] space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD0]">
              <div>
                <span className="text-[10px] tracking-[0.15em] text-[#BC4F4F] uppercase block font-semibold">
                  Mandi Board &amp; Agriculture Dept
                </span>
                <h3 className="text-xl font-bold text-[#2D2A26]">
                  Lodge Buyer Grievance
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowGrievanceModal(false);
                  setGrievanceTrackingId(null);
                }}
                className="p-1 rounded-lg text-[#8A7E6B] hover:text-[#BC4F4F] transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {grievanceTrackingId ? (
              <div className="p-6 rounded-xl bg-[#F9F3E6] border border-[#4A8C5C]/30 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#4A8C5C]/20 text-[#4A8C5C] flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h4 className="text-base font-bold text-[#2D2A26]">
                  Grievance Submitted Successfully
                </h4>
                <p className="text-xs text-[#8A7E6B] leading-relaxed">
                  Your formal complaint regarding sub-MSP procurement of <strong>{catalog.name}</strong> has been logged with the District Mandi Secretary and forwarded to the State Vigilance Cell.
                </p>
                <div className="p-3 rounded-xl bg-white border border-[#E8DFD0] text-xs text-[#A67500] font-semibold">
                  Tracking Docket No: <strong>{grievanceTrackingId}</strong>
                </div>
                <div className="text-[11px] text-[#8A7E6B]">
                  National Kisan Helpline: <strong>1800-180-1551</strong> (Toll-Free, 24/7)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGrievanceModal(false);
                    setGrievanceTrackingId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#FEBA17] hover:bg-[#E5A60F] text-[#14160C] font-semibold text-xs transition"
                >
                  Close &amp; Return
                </button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#BC4F4F]/10 border border-[#BC4F4F]/20 text-[#2D2A26] space-y-1">
                  <span className="font-semibold text-[#BC4F4F] block">Incident Summary:</span>
                  <p>
                    Trader offered <strong>₹{offeredPrice}/quintal</strong> for {catalog.name}, which is <strong>₹{Math.abs(diffMsp)}/quintal below</strong> the official Government Statutory MSP of <strong>₹{mspPrice}/quintal</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#8A7E6B]">Trader / Buyer Name or Entity *</label>
                  <input
                    type="text"
                    required
                    value={grievanceData.buyerName}
                    onChange={(e) => setGrievanceData({ ...grievanceData, buyerName: e.target.value })}
                    placeholder="e.g. Shri Krishna Traders / Shop #14"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[#8A7E6B]">APMC Mandi Yard *</label>
                    <input
                      type="text"
                      required
                      value={grievanceData.mandiYard}
                      onChange={(e) => setGrievanceData({ ...grievanceData, mandiYard: e.target.value })}
                      placeholder="e.g. Lucknow Main Mandi"
                      className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[#8A7E6B]">Trader License (Optional)</label>
                    <input
                      type="text"
                      value={grievanceData.traderLicense}
                      onChange={(e) => setGrievanceData({ ...grievanceData, traderLicense: e.target.value })}
                      placeholder="e.g. LIC-UP-2024-884"
                      className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#8A7E6B]">Remarks / Details</label>
                  <textarea
                    rows={3}
                    value={grievanceData.remarks}
                    onChange={(e) => setGrievanceData({ ...grievanceData, remarks: e.target.value })}
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] resize-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E8DFD0]">
                  <div className="text-[11px] text-[#8A7E6B]">
                    Helpline: <strong>1800-180-1551</strong>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingGrievance}
                    className="px-5 py-2.5 rounded-xl bg-[#BC4F4F] hover:bg-[#A33D3D] text-white font-semibold text-xs transition disabled:opacity-40"
                  >
                    {submittingGrievance ? 'Submitting...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
