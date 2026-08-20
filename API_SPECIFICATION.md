# 🌾 FasalMitra (AgroSmart) — Backend REST API Specification
## Version 1.0.0 (August 2026)

This document provides a comprehensive reference for all REST API endpoints, schemas, authentication mechanisms, and background cron jobs implemented in the FasalMitra backend.

---

## 🔒 Authentication & Headers

| Header | Description | Required |
|:-------|:------------|:--------:|
| `Authorization: Bearer <SUPABASE_JWT>` | Supabase Auth token (or session cookie in browser) | For protected endpoints |
| `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>` | Vercel Cron authorization secret | For cron background syncs |
| `Content-Type: application/json` | Request payload format | For `POST`/`PATCH` |

### Standard Response Envelope
All API endpoints return JSON conforming to this structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-08-19T18:00:00.000Z",
    "requestId": "uuid-v4",
    "count": 10
  }
}
```

---

## 📡 API Endpoint Index

### 1. Farmer Profile & Soil Baseline
- `GET /api/v1/profile` — Get authenticated farmer profile with Kaegro soil baseline.
- `PATCH /api/v1/profile` — Update farmer profile, locality, and preferences (auto-refreshes Kaegro soil properties if coordinates/state change).

### 2. Agronomic Master Crop Catalog
- `GET /api/v1/crops/catalog` — Query reference catalog of 32+ major crops with FAO-56 Kc values, growth stages, fertilizer guidelines, and MSP price floors.
  - Query Params:
    - `category`: `Cereal` | `Pulse` | `Vegetable` | `Fruit` | `Cash Crop` | `Oilseed` | `Spices` | `Plantation`
    - `search`: Case-insensitive text search by English or Hindi crop name
    - `season`: `Kharif` | `Rabi` | `Zaid`
    - `limit`: Default `50` (max `100`)
    - `offset`: Default `0`

### 3. Farmer Active Crops ("My Crops")
- `GET /api/v1/crops` — List all crops for authenticated farmer with live stage progress %, days since sowing, and attached virtual IoT probe data.
- `POST /api/v1/crops` — Add new crop to farm. Automatically initializes linked `virtual_iot_devices` probe.
  - Body:
    ```json
    {
      "cropCatalogId": "uuid",
      "customCropName": "North Field Tomatoes",
      "landSizeAcres": 2.5,
      "sowingDate": "2026-07-01",
      "irrigationSource": "Drip",
      "currentStatus": "Vegetative",
      "notes": "Using raised beds with plastic mulch"
    }
    ```
- `GET /api/v1/crops/:id` — Retrieve single crop with full agronomic bounds, IoT state, and health diagnosis score.
- `PATCH /api/v1/crops/:id` — Update status, land size, custom name, or notes.
- `DELETE /api/v1/crops/:id` — Delete crop and cascade delete linked IoT telemetry & AI chat history.

### 4. Daily Irrigation Advisor (Section 1)
- `GET /api/v1/crops/:id/irrigation` — On-the-spot FAO-56 Penman-Monteith crop water calculation ($ET_c = ET_0 \times K_c$).
  - Evaluates live soil moisture vs crop optimal bounds and 24-48h rainfall forecast.
  - Returns action: `SKIP` | `REDUCE` | `NORMAL` | `IRRIGATE_MORE` | `HOLD_DRAIN`.
  - Calculates water savings in Liters ($N \times D \times 4047 \text{ L}$).

### 5. Virtual IoT Digital Twin (Section 4)
- `GET /api/v1/iot/:cropId` — Read virtual probe telemetry (Moisture %, N, P, K in mg/kg, pH, soil temp).
- `PATCH /api/v1/iot/:cropId` — Update sliders or apply 1-click simulation presets.
  - Body (Slider update):
    ```json
    {
      "soilMoisturePct": 38.5,
      "nitrogenMgKg": 115.0,
      "phosphorusMgKg": 42.0,
      "potassiumMgKg": 145.0,
      "soilPh": 6.7
    }
    ```
  - Body (Simulation preset):
    ```json
    {
      "preset": "DROUGHT"
    }
    ```
    *Available presets*: `DROUGHT` | `MONSOON` | `NUTRIENT_DEPLETION` | `OPTIMAL` | `SALINITY_SPIKE` | `ACIDIC_SHOCK`

### 6. Per-Crop Dual AI Advisor (Section 2)
- `GET /api/v1/ai/chat/:cropId` — Retrieve chronological chat message history for this crop.
- `POST /api/v1/ai/chat/:cropId` — Send farmer question with automatic context injection (soil, IoT, weather, disease knowledge).
  - Body:
    ```json
    {
      "message": "My tomato leaves are turning yellow with brown rings, what should I do?",
      "engine": "gemini",
      "language": "en"
    }
    ```
  - Returns structured agronomic response with actionable remedies, fertilizer dosing in kg for their acreage, and disease treatment.

### 7. Gemini Vision Disease Scanner
- `POST /api/v1/ai/diagnose` — Multimodal crop disease identification from leaf photo.
  - Body:
    ```json
    {
      "imageBase64": "data:image/jpeg;base64,...",
      "mimeType": "image/jpeg",
      "cropName": "Tomato",
      "symptomsDescription": "Dark target spots on lower leaves",
      "language": "en"
    }
    ```

### 8. Weather Forecast API
- `GET /api/v1/weather?lat=28.61&lon=77.20` — 16-day Open-Meteo weather and soil moisture forecast with 3-hour database cache-aside.

### 9. APMC Mandi Market Intelligence & Sell vs Hold
- `GET /api/v1/mandi-prices?commodity=Wheat&days=30` — 30/60/90-day price trend analysis, nearest APMC markets, and "Sell Now vs. Store & Wait" algorithmic recommendation.

### 10. Background Cron Jobs (Secured via CRON_SECRET)
- `POST /api/cron/ingest-mandi-prices` — Daily 9 PM IST sync from `data.gov.in`.
- `POST /api/cron/cleanup-weather-cache` — Hourly purge of expired (>24h) weather cache records.

---

## 🗄️ Database Table Summary (10 Tables)

| Table | Primary Key | Description | RLS Policy |
|:------|:------------|:------------|:----------:|
| `profiles` | `id` (UUID -> auth.users) | Farmer identity, locality, Kaegro soil baseline | User isolation |
| `crop_catalog` | `id` (UUID) | 32+ master reference crops (FAO-56 Kc, MSP, stages) | Public read |
| `farmer_crops` | `id` (UUID) | Active crops grown by farmer | User isolation |
| `virtual_iot_devices` | `id` (UUID) | Current IoT probe readings per crop | User crop check |
| `crop_ai_chats` | `id` (UUID) | Per-crop AI chat thread history | User crop check |
| `weather_cache` | `id` (UUID) | 16-day weather forecast (3h TTL) | Public read |
| `mandi_prices` | `id` (UUID) | APMC commodity market price history | Public read |
| `mandi_price_sync_log` | `id` (UUID) | Mandi ingestion tracking logs | Service role |
| `disease_catalog` | `id` (UUID) | 50+ plant disease agronomic knowledge base | Public read |
| `handle_new_user()` | Trigger | Auto-creates farmer profile on signup | System trigger |
