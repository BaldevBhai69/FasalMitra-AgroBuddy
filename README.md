# 🌾 FasalMitra (AgroSmart) — Smart AgriTech Platform

> **Precision Agronomy, Virtual IoT Digital Twin, Mandi Market Intelligence & Dual-Engine AI Advisor**

Built with **Next.js 15 App Router**, **TypeScript**, **Supabase (PostgreSQL with RLS & Supavisor Port 6543)**, **Google Gemini 3.6 Flash**, and **Local Ollama Edge Inference on RTX 4050 GPU**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate your credentials:
```bash
cp .env.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (Free from [Google AI Studio](https://aistudio.google.com/))
- `CRON_SECRET` (For securing Vercel background cron jobs)
- `DATA_GOV_IN_API_KEY` (Free from [data.gov.in](https://data.gov.in/))

### 3. Setup Database & Seed 30+ Crops & 50+ Diseases
Run the combined schema script in your **Supabase SQL Editor**:
- Open `supabase/full_schema.sql` and run it in the Supabase Dashboard SQL Editor.
- Or run individual numbered migration files from `supabase/migrations/` (001 through 008) followed by `supabase/seed/seed.sql`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Architecture & Verification
- Run typecheck: `npm run typecheck`
- Run production build: `npm run build`
- API Reference: See [API_SPECIFICATION.md](./API_SPECIFICATION.md)
