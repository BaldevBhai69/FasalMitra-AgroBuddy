# 🌾 FasalMitra (AgroSmart) — Frontend Developer Connection Guide

This guide provides everything needed for a frontend developer to connect to the FasalMitra backend API endpoints. All backend services, database tables, Row-Level Security policies, and AI inference engines are fully tested, compiled, and operational.

---

## 📑 Table of Contents
1. [Architecture & Base URL](#1-architecture--base-url)
2. [Authentication & Session Flow](#2-authentication--session-flow)
3. [Standard API Envelope & Error Format](#3-standard-api-envelope--error-format)
4. [TypeScript Types Import](#4-typescript-types-import)
5. [Complete API Endpoints Reference](#5-complete-api-endpoints-reference)
   - [Auth & Farmer Profile](#51-auth--farmer-profile)
   - [Crop Catalog (Master Knowledge Base)](#52-crop-catalog-master-knowledge-base)
   - [Farmer Crops (Active Farming Operations)](#53-farmer-crops-active-farming-operations)
   - [FAO-56 Irrigation Decision Engine](#54-fao-56-irrigation-decision-engine)
   - [Virtual IoT Telemetry & Simulation Presets (Digital Twin)](#55-virtual-iot-telemetry--simulation-presets-digital-twin)
   - [Per-Crop AI Advisory Chat (Gemini 3.6 Flash)](#56-per-crop-ai-advisory-chat-gemini-36-flash)
   - [Multimodal Leaf Disease Vision Scanner](#57-multimodal-leaf-disease-vision-scanner)
   - [Live Weather & 16-Day Forecast](#58-live-weather--16-day-forecast)
   - [Mandi Market Prices & Sell vs. Hold Advisor](#59-mandi-market-prices--sell-vs-hold-advisor)
6. [Frontend API Client Helper (Drop-in Code)](#6-frontend-api-client-helper-drop-in-code)

---

## 1. Architecture & Base URL

- **Backend Framework**: Next.js 15 (App Router) + Supabase (PostgreSQL 15 + PostgREST + Auth)
- **Base URL**: Relative `/api/v1` (or `http://localhost:3000/api/v1` during development)
- **Content-Type**: `application/json` for all mutating `POST`, `PATCH`, `PUT` requests.
- **Credentials**: `credentials: 'include'` (browser cookies are handled automatically by `@supabase/ssr`).

---

## 2. Authentication & Session Flow

The app uses **Supabase Auth** with cookie-based session management (`@supabase/ssr`).

### Initializing the Browser Supabase Client
Use the pre-built client in `src/lib/supabase/client.ts`:

```typescript
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const supabase = createBrowserSupabaseClient();
```

### Sign Up / Login Patterns
```typescript
// 1. Email & Password Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'farmer@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      username: 'ramesh_farmer',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      village_locality: 'Malihabad',
    },
  },
});

// 2. Email & Password Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'farmer@example.com',
  password: 'SecurePassword123!',
});

// 3. Sign Out
await supabase.auth.signOut();
```

> **Note**: When a user signs up, the backend database trigger `handle_new_user()` automatically creates their entry in `public.profiles`. All subsequent API requests send auth cookies automatically with `fetch('/api/v1/...')`.

---

## 3. Standard API Envelope & Error Format

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-08-20T00:00:00.000Z",
    "count": 1
  }
}
```

### Standard Error Response (HTTP 400 / 401 / 403 / 404 / 422 / 429 / 500)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "landSizeAcres",
        "message": "Number must be greater than 0"
      }
    ]
  }
}
```

---

## 4. TypeScript Types Import

All domain types and API response models are centralized and can be imported directly into any frontend component:

```typescript
import { CropCatalog, FarmerCrop, FarmerCropDetail, VirtualIoTDevice } from '@/types/crop.types';
import { IrrigationRecommendation, WeatherForecastResponse } from '@/types/weather.types';
import { IoTAgronomicStatus, IoTSimulationPreset, IoTTelemetryPayload } from '@/types/iot.types';
import { AIChatResponsePayload, DiseaseDiagnosisResult } from '@/types/ai.types';
import { MandiPriceTrendPoint, MandiPriceRecord, SellVsHoldAdvice } from '@/types/mandi.types';
import { ApiResponse, ApiErrorResponse } from '@/types/api.types';
```

---

## 5. Complete API Endpoints Reference

---

### 5.1 Auth & Farmer Profile

#### `GET /api/v1/profile`
Fetches the currently authenticated farmer's profile, including auto-fetched Kaegro soil baseline.
- **Auth**: Required (Cookie)
- **Response `data`**:
  ```typescript
  interface FarmerProfile {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
    phone_number: string | null;
    state: string;
    district: string;
    village_locality: string;
    latitude: number | null;
    longitude: number | null;
    soil_type: string | null;            // e.g. "Alluvial Loam"
    soil_ph: number | null;              // e.g. 6.8
    soil_organic_carbon_pct: number | null; // e.g. 0.72
    soil_nitrogen_mg_kg: number | null;  // e.g. 130.0
    soil_sand_pct: number | null;
    soil_silt_pct: number | null;
    soil_clay_pct: number | null;
    soil_cec: number | null;
    soil_data_source: string | null;     // "kaegro" | "openlandmap" | "regional_fallback"
    preferred_language: 'en' | 'hi' | 'mr' | 'pa' | 'te' | 'ta';
    preferred_ai_engine: 'gemini' | 'ollama';
    created_at: string;
    updated_at: string;
  }
  ```

#### `PATCH /api/v1/profile`
Updates farmer profile. If latitude/longitude/state changes without manual soil values, the backend **automatically re-fetches and syncs Kaegro soil baseline**.
- **Auth**: Required (Cookie)
- **Request Body** (all fields optional):
  ```json
  {
    "fullName": "Ramesh Patel",
    "phoneNumber": "9876543210",
    "state": "Uttar Pradesh",
    "district": "Lucknow",
    "villageLocality": "Malihabad",
    "latitude": 26.8467,
    "longitude": 80.9462,
    "preferredLanguage": "hi",
    "preferredAiEngine": "gemini"
  }
  ```
- **Response**: `{ "success": true, "data": FarmerProfile }`

---

### 5.2 Crop Catalog (Master Knowledge Base)

#### `GET /api/v1/crops/catalog`
Search and filter 32+ master Indian crops with FAO-56 constants, water requirements, and MSP data.
- **Auth**: Public
- **Query Parameters**:
  - `category`: `Cereal` | `Pulse` | `Vegetable` | `Fruit` | `Cash Crop` | `Oilseed` | `Spices` | `Plantation`
  - `search`: Search query string (e.g. `tomato` or `टमाटर`)
- **Example**: `GET /api/v1/crops/catalog?category=Vegetable&search=tomato`
- **Response `data`**: `CropCatalog[]`
  ```typescript
  interface CropCatalog {
    id: string;
    name: string;                        // "Tomato"
    hindi_name: string | null;           // "टमाटर"
    icon_emoji: string;                  // "🍅"
    category: string;                    // "Vegetable"
    optimal_temperature_min: number;     // 18.0
    optimal_temperature_max: number;     // 27.0
    optimal_soil_moisture_min: number;   // 45.0 (%)
    optimal_soil_moisture_max: number;   // 65.0 (%)
    optimal_ph_min: number;              // 6.0
    optimal_ph_max: number;              // 6.8
    optimal_nitrogen_min: number;        // 100.0 (mg/kg)
    optimal_nitrogen_max: number;        // 150.0
    optimal_phosphorus_min: number;      // 50.0
    optimal_phosphorus_max: number;      // 80.0
    optimal_potassium_min: number;       // 120.0
    optimal_potassium_max: number;       // 180.0
    kc_initial: number;                  // 0.45
    kc_mid: number;                      // 1.15
    kc_end: number;                      // 0.80
    duration_days_min: number;           // 75
    duration_days_max: number;           // 95
    water_requirement_mm: number;        // 550.0 (mm total season)
    sowing_seasons: string[];            // ["Rabi", "Kharif", "Zaid"]
    growth_stages: {
      stage: string;
      days: number;
      water_need: string;
      description: string;
    }[];
    general_tips: string[];
    fertilizer_guide: Record<string, string>;
    msp_price_per_quintal: number | null; // e.g. 1800.00
    is_perishable: boolean;
    storage_duration_days: number;
  }
  ```

---

### 5.3 Farmer Crops (Active Farming Operations)

#### `GET /api/v1/crops`
Lists all active crops owned by the logged-in farmer with enriched stage progress and linked virtual IoT device.
- **Auth**: Required (Cookie)
- **Response `data`**: `FarmerCropDetail[]`
  ```typescript
  interface FarmerCropDetail {
    id: string;
    farmer_id: string;
    crop_catalog_id: string;
    custom_crop_name: string | null;      // e.g. "North Field Plot 1"
    land_size_acres: number;              // e.g. 2.5
    sowing_date: string;                  // "2026-07-20"
    expected_harvest_date: string | null; // "2026-10-25"
    irrigation_source: 'Borewell' | 'Canal' | 'Drip' | 'Rainfed' | 'Sprinkler' | 'Tube Well' | 'River/Pond';
    current_status: 'Planning' | 'Sown' | 'Vegetative' | 'Flowering' | 'Harvesting' | 'Harvested';
    notes: string | null;
    created_at: string;
    updated_at: string;
    crop_catalog: CropCatalog;
    iot_device: VirtualIoTDevice | null;
    days_since_sowing: number;            // Auto-calculated e.g. 31
    stage_progress_pct: number;           // e.g. 34 (%)
    estimated_days_left: number;          // e.g. 59 (days)
  }
  ```

#### `POST /api/v1/crops`
Adds a new active crop for the farmer and **automatically provisions a linked Virtual IoT sensor probe**.
- **Auth**: Required (Cookie)
- **Request Body**:
  ```json
  {
    "cropCatalogId": "c0a80123-0000-0000-0000-000000000001",
    "customCropName": "Tomato North Field",
    "landSizeAcres": 2.5,
    "sowingDate": "2026-08-01",
    "expectedHarvestDate": "2026-11-05",
    "irrigationSource": "Drip",
    "currentStatus": "Vegetative",
    "notes": "Using organic vermicompost basal dressing"
  }
  ```
- **Response**: `{ "success": true, "data": FarmerCropDetail, "status": 201 }`

#### `GET /api/v1/crops/:id`
Retrieves a single crop with real-time agronomic health evaluation score (`0-100`) and deficiency alert flags.
- **Auth**: Required (Cookie)
- **Response `data`**: `FarmerCropDetail & { health_status: IoTAgronomicStatus }`

#### `PATCH /api/v1/crops/:id`
Updates crop details or advances growth stage (e.g. from `'Vegetative'` to `'Flowering'`).
- **Auth**: Required (Cookie)
- **Request Body** (all optional):
  ```json
  {
    "customCropName": "Updated Name",
    "landSizeAcres": 3.0,
    "currentStatus": "Flowering",
    "irrigationSource": "Drip",
    "notes": "Second split fertigation completed"
  }
  ```

#### `DELETE /api/v1/crops/:id`
Deletes the active crop and cascades to delete all linked virtual IoT probes and AI chat history.
- **Auth**: Required (Cookie)
- **Response**: `{ "success": true, "data": { "message": "Crop and linked virtual telemetry deleted successfully" } }`

---

### 5.4 FAO-56 Irrigation Decision Engine

#### `GET /api/v1/crops/:id/irrigation`
Calculates instant daily irrigation requirement using FAO-56 Penman-Monteith ($ET_c = ET_0 \times K_c$), 48-hour precipitation probability, and live soil moisture deficit. Returns water savings volume in Liters.
- **Auth**: Required (Cookie)
- **Response `data`**:
  ```typescript
  interface IrrigationRecommendation {
    action: 'SKIP' | 'REDUCE' | 'NORMAL' | 'IRRIGATE_MORE' | 'HOLD_DRAIN';
    badgeColor: 'blue' | 'yellow' | 'green' | 'red';
    headline: string;                      // e.g. "💧 SKIP Irrigation — Rain Forecasted (18.4 mm)"
    explanation: string;                   // Farmer-friendly agronomic rationale
    cropEvapotranspirationEtcMm: number;  // ETc in mm/day (e.g. 5.18)
    referenceEt0Mm: number;                // ET0 in mm/day (e.g. 4.5)
    cropCoefficientKc: number;             // Kc for current stage (e.g. 1.15)
    currentSoilMoisturePct: number;        // Current sensor probe reading (e.g. 48.0%)
    optimalSoilMoistureMinPct: number;     // 40.0%
    optimalSoilMoistureMaxPct: number;     // 65.0%
    soilMoistureDeficitPct: number;
    expectedRainNext24hMm: number;
    expectedRainNext48hMm: number;
    waterSavingsLiters: number;            // Liters saved by skipping (e.g. 52,408 L)
    recommendedWaterDepthMm: number;       // Irrigation depth to apply today (mm)
    recommendedWaterVolumeLiters: number;  // Volume to apply in Liters across field acreage
    weatherSummary: {
      tempC: number;
      humidityPct: number;
      rainProbNext48hPct: number;
      weatherDescription: string;
    };
  }
  ```

---

### 5.5 Virtual IoT Telemetry & Simulation Presets (Digital Twin)

#### `GET /api/v1/iot/:cropId`
Fetches current virtual sensor readings and evaluates agronomic health.
- **Auth**: Required (Cookie)
- **Response `data`**:
  ```json
  {
    "device": {
      "id": "uuid",
      "farmer_crop_id": "uuid",
      "device_name": "Virtual Soil Probe v1",
      "is_simulation_mode": false,
      "soil_moisture_pct": 48.0,
      "nitrogen_mg_kg": 120.0,
      "phosphorus_mg_kg": 45.0,
      "potassium_mg_kg": 150.0,
      "soil_ph": 6.8,
      "soil_temperature_c": 24.5,
      "organic_carbon_pct": 0.72,
      "electrical_conductivity_ds_m": 1.1,
      "last_sync_at": "2026-08-20T00:00:00.000Z"
    },
    "health": {
      "moistureStatus": "OPTIMAL",
      "nitrogenStatus": "OPTIMAL",
      "phosphorusStatus": "OPTIMAL",
      "potassiumStatus": "OPTIMAL",
      "phStatus": "OPTIMAL",
      "overallHealthScore": 100,
      "alerts": []
    }
  }
  ```

#### `PATCH /api/v1/iot/:cropId`
Used by the frontend to update telemetry from **interactive UI sliders** OR apply **1-click simulation presets**.
- **Auth**: Required (Cookie)

**Option A: Updating from UI Sliders**
```json
{
  "soilMoisturePct": 22.0,
  "nitrogenMgKg": 75.0,
  "phosphorusMgKg": 30.0,
  "potassiumMgKg": 110.0,
  "soilPh": 6.2,
  "soilTemperatureC": 28.0,
  "isSimulationMode": true
}
```

**Option B: 1-Click Simulation Preset**
```json
{
  "preset": "DROUGHT"
}
```
*Available Preset Values*:
- `"DROUGHT"` (Moisture 16%, Temp 32°C)
- `"MONSOON"` (Moisture 85%, Temp 21°C)
- `"NUTRIENT_DEPLETION"` (N: 28, P: 12, K: 35 mg/kg)
- `"OPTIMAL"` (Moisture 55%, N: 140, P: 60, K: 160 mg/kg)
- `"SALINITY_SPIKE"` (pH 8.4, EC 4.8 dS/m)
- `"ACIDIC_SHOCK"` (pH 4.8)

---

### 5.6 Per-Crop AI Advisory Chat (Gemini 3.6 Flash)

#### `GET /api/v1/ai/chat/:cropId`
Fetches chronological conversation history for this specific crop.
- **Auth**: Required (Cookie)
- **Response `data`**: Array of chat messages with role, content, and metadata.

#### `POST /api/v1/ai/chat/:cropId`
Sends a farmer's question to the AI Agronomist with **automatic agronomic context injection** (soil baseline, live IoT probe readings, 16-day weather forecast, crop growth stage, and fertilizer guide).
- **Auth**: Required (Cookie)
- **Request Body**:
  ```json
  {
    "message": "मेरे टमाटर के पौधों की पत्तियां पीली पड़ रही हैं। क्या खाद दूं?",
    "language": "hi",
    "engine": "gemini"
  }
  ```
  *Supported Languages*: `'en'` (English), `'hi'` (Hindi), `'mr'` (Marathi), `'pa'` (Punjabi), `'te'` (Telugu), `'ta'` (Tamil).
- **Response `data`**:
  ```typescript
  interface AIChatResponsePayload {
    message: string;                      // Full conversational advisory in requested language
    structuredAdvice?: {
      diagnosis?: string;                 // e.g. "Early Nitrogen Deficiency"
      actionRequired?: string;            // Immediate action for today
      fertilizerDosing?: {
        product: string;                  // e.g. "Urea (46% N)"
        quantityKg: number;               // Tailored for specific field acreage (e.g. 35 kg)
        method: string;                   // "Top dress / Broadcast"
      }[];
      irrigationAdvice?: string;
      preventionTips?: string[];
    };
    engineUsed: string;                   // "gemini-3.6-flash"
    tokensUsed?: number;
  }
  ```

---

### 5.7 Multimodal Leaf Disease Vision Scanner

#### `POST /api/v1/ai/diagnose`
Uploads a plant leaf photo (Base64) for instant disease identification, severity assessment, and organic/chemical treatments using Gemini Vision + grounded disease catalog pathology.
- **Auth**: Public / Rate Limited (20/min)
- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "mimeType": "image/jpeg",
    "cropName": "Tomato",
    "symptomsDescription": "Brown concentric rings on lower leaves",
    "language": "hi"
  }
  ```
- **Response `data`**:
  ```typescript
  interface DiseaseDiagnosisResult {
    detectedDisease: string;              // "Early Blight (Alternaria solani)"
    cropName: string;                     // "Tomato"
    confidenceScore: number;              // 0.94 (94%)
    severity: 'Low' | 'Moderate' | 'High' | 'Critical';
    symptomsIdentified: string[];         // ["Concentric brown target rings", "Yellow halo"]
    cause: string;                        // "Alternaria solani fungus aggravated by humid conditions"
    organicRemedies: string[];            // ["Foliar spray of Trichoderma harzianum @ 5g/L", "Neem oil 0.5%"]
    chemicalTreatments: {
      chemicalName: string;               // "Mancozeb 75% WP"
      dosage: string;                     // "2.5g per Liter of water"
      safetyWaitingPeriodDays: number;    // 14 days
    }[];
    preventiveAdvice: string[];
    engineUsed: string;                   // "gemini-3.6-flash"
  }
  ```

---

### 5.8 Live Weather & 16-Day Forecast

#### `GET /api/v1/weather`
Returns live weather and 16-day daily forecast + Open-Meteo soil moisture (backed by a 3-hour database cache-aside).
- **Auth**: Public
- **Query Parameters**:
  - `latitude`: `number` (Default: `26.8467` — Lucknow)
  - `longitude`: `number` (Default: `80.9462`)
- **Example**: `GET /api/v1/weather?latitude=26.8467&longitude=80.9462`
- **Response `data`**: `WeatherForecastResponse`
  ```typescript
  interface WeatherForecastResponse {
    current: {
      temperatureC: number;
      humidityPct: number;
      precipitationMm: number;
      windSpeedKmh: number;
      weatherCode: number;
      weatherDescription: string;
      soilMoisture0to7cm: number;
      soilTemperature0to7cm: number;
    };
    daily: {
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      precipitationMm: number;
      precipitationProbabilityPct: number;
      humidityMeanPct: number;
      windSpeedMaxKmh: number;
      et0FaoMm: number;                   // Reference Evapotranspiration
      weatherDescription: string;
    }[];
    dataSource: 'database_cache' | 'open_meteo_live';
    cachedAt: string;
  }
  ```

---

### 5.9 Mandi Market Prices & Sell vs. Hold Advisor

#### `GET /api/v1/mandi-prices`
Fetches APMC mandi market price trends and algorithmic **"Sell Now vs. Store & Wait"** cold storage financial recommendation factoring perishability and monthly storage fees.
- **Auth**: Public
- **Query Parameters**:
  - `commodity`: `string` (e.g. `Tomato`, `Wheat`, `Potato`, `Onion`, `Mustard`)
  - `state`: `string` (optional, e.g. `Uttar Pradesh`)
  - `district`: `string` (optional, e.g. `Lucknow`)
  - `days`: `number` (optional, default: `30`)
- **Example**: `GET /api/v1/mandi-prices?commodity=Tomato&state=Uttar%20Pradesh`
- **Response `data`**:
  ```typescript
  interface MandiPricesApiResponse {
    trends: {
      date: string;
      modalPrice: number;
      minPrice: number;
      maxPrice: number;
      marketCount: number;
    }[];
    records: MandiPriceRecord[];
    sellVsHoldAdvice: {
      recommendation: 'SELL_NOW' | 'HOLD_AND_STORE' | 'MODERATE_HOLD';
      badgeTitle: string;                  // "HOLD & STORE (BULLISH)"
      headline: string;                    // "Hold in Cold Storage for ~45 Days (Net Upside +18.4%)"
      reasoning: string;                   // Complete financial and perishability breakdown
      currentModalPricePerQuintal: number; // e.g. 2400 (₹/quintal)
      mspBenchmarkPerQuintal: number | null;// e.g. 2275 (₹/quintal)
      priceVersusMspDiffPct: number | null;
      forecastedPrice45Days: number;       // e.g. 2850
      projectedGrossGainPct: number;
      estimatedStorageCostPerMonthPerQuintal: number; // ₹90/month
      estimatedStorageDurationDays: number;
      projectedNetGainPct: number;         // +14.2% net after storage fees
      confidenceScorePct: number;          // 84%
      isPerishable: boolean;
      nearestMandis: {
        marketName: string;
        district: string;
        state: string;
        modalPrice: number;
        arrivalDate: string;
      }[];
    };
  }
  ```

---

## 6. Frontend API Client Helper (Drop-in Code)

The frontend developer can paste this utility in `src/lib/api-client.ts` for clean, typed, automatic error-handled API calls:

```typescript
// src/lib/api-client.ts
import { ApiResponse } from '@/types/api.types';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Includes Supabase Auth cookies
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success || json.data === undefined) {
    const code = json.code || 'HTTP_ERROR';
    const message = json.error || response.statusText || 'An unexpected error occurred';
    throw new ApiClientError(code, message, response.status, json.details);
  }

  return json.data;
}

// Example usage in React components:
// const crops = await apiRequest<FarmerCropDetail[]>('/api/v1/crops');
// const advice = await apiRequest<IrrigationRecommendation>(`/api/v1/crops/${cropId}/irrigation`);
```

---

## 🚀 Readiness Checklist
- [x] All 10 Supabase tables & RLS policies active
- [x] Seed data (32 crops & 50+ plant diseases) loaded
- [x] Live Google Gemini 3.6 Flash AI advisory verified
- [x] Open-Meteo 16-day weather & FAO-56 ET0 calculations verified
- [x] data.gov.in Mandi price pipeline operational
- [x] TypeScript types and Zod validation aligned
- [x] Production build compiled cleanly with 0 errors
