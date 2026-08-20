import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { ApiError } from '@/lib/utils/api-error';
import { ollamaService } from './ollama.service';
import { weatherService } from './weather.service';
import { iotService } from './iot.service';
import {
  AIChatResponsePayload,
  ChatMessageContextSnapshot,
  CropContextPayload,
  FarmerProfilePayload,
  WeatherContextPayload,
} from '@/types/ai.types';
import { CropCatalog, FarmerCrop, VirtualIoTDevice } from '@/types/crop.types';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  mr: 'Marathi (मराठी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
};

export class AIChatService {
  private geminiClient: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !this.geminiClient) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return this.geminiClient;
  }

  private getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  }

  /**
   * Generates per-crop contextual advisory message using Gemini or local Ollama (Llama 3.1 8B)
   */
  async sendMessage(
    farmerCropId: string,
    userMessage: string,
    preferredEngine: 'gemini' | 'ollama' = 'gemini',
    targetLanguage: string = 'auto',
    iotOverride?: Partial<VirtualIoTDevice>,
    modelName?: string,
    clientCropContext?: CropContextPayload,
    clientFarmerProfile?: FarmerProfilePayload,
    clientWeatherContext?: WeatherContextPayload
  ): Promise<AIChatResponsePayload> {
    const supabase = createAdminSupabaseClient();

    // 1. Fetch Farmer Crop details + Catalog + Profile from database if available
    const { data: cropData } = await supabase
      .from('farmer_crops')
      .select('*, crop_catalog:crop_catalog_id(*), profile:farmer_id(*)')
      .eq('id', farmerCropId)
      .maybeSingle();

    let crop: Partial<FarmerCrop> = {};
    let catalog: Partial<CropCatalog> = {};
    let profile: Record<string, unknown> = {};

    if (cropData) {
      crop = cropData as unknown as FarmerCrop;
      catalog = (cropData as Record<string, unknown>).crop_catalog as CropCatalog;
      profile = ((cropData as Record<string, unknown>).profile as Record<string, unknown>) || {};
    }

    // Merge with client-side crop context (crucial for localStorage / demo crops)
    if (clientCropContext) {
      catalog = {
        ...catalog,
        name: clientCropContext.name || catalog.name || 'Tomato',
        hindi_name: clientCropContext.hindiName || catalog.hindi_name || 'टमाटर',
        optimal_soil_moisture_min: clientCropContext.optimalSoilMoistureMin ?? catalog.optimal_soil_moisture_min ?? 45,
        optimal_soil_moisture_max: clientCropContext.optimalSoilMoistureMax ?? catalog.optimal_soil_moisture_max ?? 65,
        optimal_nitrogen_min: clientCropContext.optimalNitrogenMin ?? catalog.optimal_nitrogen_min ?? 100,
        optimal_nitrogen_max: clientCropContext.optimalNitrogenMax ?? catalog.optimal_nitrogen_max ?? 150,
        optimal_phosphorus_min: clientCropContext.optimalPhosphorusMin ?? catalog.optimal_phosphorus_min ?? 50,
        optimal_phosphorus_max: clientCropContext.optimalPhosphorusMax ?? catalog.optimal_phosphorus_max ?? 80,
        optimal_potassium_min: clientCropContext.optimalPotassiumMin ?? catalog.optimal_potassium_min ?? 120,
        optimal_potassium_max: clientCropContext.optimalPotassiumMax ?? catalog.optimal_potassium_max ?? 180,
        optimal_ph_min: clientCropContext.optimalPhMin ?? catalog.optimal_ph_min ?? 6.0,
        optimal_ph_max: clientCropContext.optimalPhMax ?? catalog.optimal_ph_max ?? 6.8,
        duration_days_max: clientCropContext.durationDaysMax ?? catalog.duration_days_max ?? 90,
        msp_price_per_quintal: clientCropContext.mspPricePerQuintal ?? catalog.msp_price_per_quintal ?? 2400,
        fertilizer_guide: clientCropContext.fertilizerGuide ?? catalog.fertilizer_guide ?? { basal: 'DAP 50 kg + MOP 30 kg / acre' },
      };

      const effectiveSowingDate = clientCropContext.sowingDate || crop.sowing_date;
      const dynamicDays = effectiveSowingDate
        ? Math.max(0, Math.floor((Date.now() - new Date(effectiveSowingDate).getTime()) / (1000 * 60 * 60 * 24)))
        : (clientCropContext.daysSinceSowing ?? (crop as any).days_since_sowing ?? 0);

      crop = {
        ...crop,
        id: farmerCropId,
        custom_crop_name: clientCropContext.customCropName || crop.custom_crop_name || `${catalog.name} Field`,
        land_size_acres: clientCropContext.landSizeAcres ?? crop.land_size_acres ?? 2.5,
        current_status: clientCropContext.growthStage || crop.current_status || 'Vegetative',
        sowing_date: effectiveSowingDate || new Date().toISOString().split('T')[0],
        days_since_sowing: dynamicDays,
        irrigation_source: clientCropContext.irrigationSource || crop.irrigation_source || 'Drip',
      } as any;
    } else if (!crop.id) {
      catalog = {
        id: 'cat-tomato',
        name: 'Tomato',
        hindi_name: 'टमाटर',
        optimal_soil_moisture_min: 45,
        optimal_soil_moisture_max: 65,
        optimal_nitrogen_min: 100,
        optimal_nitrogen_max: 150,
        optimal_phosphorus_min: 50,
        optimal_phosphorus_max: 80,
        optimal_potassium_min: 120,
        optimal_potassium_max: 180,
        optimal_ph_min: 6.0,
        optimal_ph_max: 6.8,
        duration_days_max: 90,
        msp_price_per_quintal: 2400,
        fertilizer_guide: { basal: 'DAP 50 kg + MOP 30 kg / acre' },
      };
      crop = {
        id: farmerCropId,
        custom_crop_name: 'Tomato Field (Plot A)',
        land_size_acres: 2.5,
        current_status: 'Vegetative',
        sowing_date: new Date().toISOString().split('T')[0],
        days_since_sowing: 0,
        irrigation_source: 'Drip',
      } as any;
    }

    // Merge profile
    if (clientFarmerProfile) {
      profile = {
        ...profile,
        village_locality: clientFarmerProfile.village || profile.village_locality || 'Malihabad',
        district: clientFarmerProfile.district || profile.district || 'Lucknow',
        state: clientFarmerProfile.state || profile.state || 'Uttar Pradesh',
        primary_soil_type: clientFarmerProfile.soilType || profile.primary_soil_type || 'Alluvial Soil',
        soil_ph: clientFarmerProfile.soilPh || profile.soil_ph || 6.5,
      };
    } else if (!profile.district) {
      profile = {
        village_locality: 'Malihabad',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        primary_soil_type: 'Alluvial Soil',
        soil_ph: 6.5,
      };
    }

    // 2. Fetch or Initialize Virtual IoT Readings (merged with live UI simulation overrides)
    const baseIot = await iotService.getOrCreateDevice(farmerCropId);
    const iot = { ...baseIot, ...(iotOverride || {}) };

    // 3. Live Weather: prefer client context, otherwise fetch via weatherService
    let weatherSummary: {
      tempC: number;
      humidityPct: number;
      rainTodayMm: number;
      rainProbNext48hPct: number;
      rainExpectedNext48hMm: number;
    };

    if (clientWeatherContext && clientWeatherContext.tempC !== undefined) {
      weatherSummary = {
        tempC: Number(clientWeatherContext.tempC),
        humidityPct: Number(clientWeatherContext.humidityPct || 65),
        rainTodayMm: Number(clientWeatherContext.rainTodayMm || 0),
        rainProbNext48hPct: Number(clientWeatherContext.rainProbNext48hPct || 15),
        rainExpectedNext48hMm: Number(clientWeatherContext.rainExpectedNext48hMm || 0),
      };
    } else {
      const lat = Number(profile.latitude || 26.8467);
      const lon = Number(profile.longitude || 80.9462);
      const weather = await weatherService.getForecast(lat, lon);
      weatherSummary = {
        tempC: weather.current.temperatureC,
        humidityPct: weather.current.humidityPct,
        rainTodayMm: weather.current.precipitationMm,
        rainProbNext48hPct: Math.max(
          weather.daily[0]?.precipitationProbabilityPct || 0,
          weather.daily[1]?.precipitationProbabilityPct || 0
        ),
        rainExpectedNext48hMm: Number(
          ((weather.daily[0]?.precipitationMm || 0) + (weather.daily[1]?.precipitationMm || 0)).toFixed(1)
        ),
      };
    }

    // 4. Set Language to English
    const languageName = 'English';

    // 5. Build Context Snapshot
    const contextSnapshot: ChatMessageContextSnapshot = {
      cropName: String(catalog.name || 'Crop'),
      growthStage: crop.current_status || 'Vegetative',
      daysSinceSown: (crop as any).days_since_sowing ?? 0,
      landSizeAcres: Number(crop.land_size_acres || 2.5),
      location: `${profile.village_locality || ''}, ${profile.district || ''}, ${profile.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
      soil: {
        type: String(profile.primary_soil_type || 'Alluvial Soil').split('(')[0].trim(),
        ph: Number(iot.soil_ph || profile.soil_ph || 6.5),
        organicCarbonPct: Number(profile.organic_carbon_pct || 0.65),
      },
      iot: {
        moisturePct: Number(iot.soil_moisture_pct || 48),
        nitrogen: Number(iot.nitrogen_mg_kg || 120),
        phosphorus: Number(iot.phosphorus_mg_kg || 40),
        potassium: Number(iot.potassium_mg_kg || 150),
        magnesium: Number((iot as any).magnesium_mg_kg || 45),
        calcium: Number((iot as any).calcium_mg_kg || 380),
        sulfur: Number((iot as any).sulfur_mg_kg || 22),
        organicCarbon: Number((iot as any).organic_carbon_pct || profile.organic_carbon_pct || 0.65),
        electricalConductivity: Number((iot as any).electrical_conductivity_ds_m || 0.85),
        ph: Number(iot.soil_ph || 6.5),
        tempC: Number(iot.soil_temperature_c || 26),
      },
      weather: weatherSummary,
    };

    // 6. Fetch Recent Conversation History (Last 6 messages for continuity)
    const { data: pastHistory } = await supabase
      .from('crop_ai_chats')
      .select('role, content')
      .eq('farmer_crop_id', farmerCropId)
      .order('created_at', { ascending: false })
      .limit(6);

    const chronologicalHistory = ((pastHistory || []) as any[]).reverse();

    // 7. Construct Comprehensive System Prompt (STRICTLY ENGLISH)
    const systemPrompt = `You are FasalMitra AI, an elite Agricultural Agronomist and Crop Scientist.
You are in a live consultation session with a farmer regarding their ${catalog.name} crop.

LANGUAGE REQUIREMENT:
You MUST respond strictly in 100% clear, professional English. Do NOT use any Hindi words, Hindi script (Devanagari), or mixed Hinglish. Everything must be in English.

=== REAL-TIME TELEMETRY & AGRONOMIC CONTEXT (AUTO-INJECTED) ===
- Crop Name: ${catalog.name}
- Field Variety / Title: ${crop.custom_crop_name}
- Growth Stage: ${crop.current_status} (Day ${contextSnapshot.daysSinceSown} of ~${catalog.duration_days_max} days)
- Farm Area: ${crop.land_size_acres} Acres, Irrigation Method: ${crop.irrigation_source || 'Drip'}
- Farm Location: ${contextSnapshot.location}
- Soil Type: ${contextSnapshot.soil.type}

- LIVE SENSOR / IoT SOIL & NUTRIENT READINGS:
  * Soil Moisture: ${contextSnapshot.iot.moisturePct}% (Optimal for ${catalog.name}: ${catalog.optimal_soil_moisture_min}% - ${catalog.optimal_soil_moisture_max}%)
  * Available Nitrogen (N): ${contextSnapshot.iot.nitrogen} mg/kg (Optimal: ${catalog.optimal_nitrogen_min} - ${catalog.optimal_nitrogen_max} mg/kg)
  * Phosphorus (P): ${contextSnapshot.iot.phosphorus} mg/kg (Optimal: ${catalog.optimal_phosphorus_min || 35} - ${catalog.optimal_phosphorus_max || 75} mg/kg)
  * Potassium (K): ${contextSnapshot.iot.potassium} mg/kg (Optimal: ${catalog.optimal_potassium_min || 110} - ${catalog.optimal_potassium_max || 180} mg/kg)
  * Magnesium (Mg): ${contextSnapshot.iot.magnesium} mg/kg (Standard: 30 - 70 mg/kg)
  * Calcium (Ca): ${contextSnapshot.iot.calcium} mg/kg (Standard: 250 - 600 mg/kg)
  * Sulfur (S): ${contextSnapshot.iot.sulfur} mg/kg (Standard: 15 - 40 mg/kg)
  * Soil Organic Carbon: ${contextSnapshot.iot.organicCarbon}% (Standard: 0.60% - 1.20%)
  * Electrical Conductivity (Salinity EC): ${contextSnapshot.iot.electricalConductivity} dS/m (Standard: < 1.5 dS/m)
  * Soil pH: ${contextSnapshot.iot.ph} (Optimal pH: ${catalog.optimal_ph_min} - ${catalog.optimal_ph_max}), Soil Temp: ${contextSnapshot.iot.tempC}°C

- LIVE WEATHER AT FARM:
  * Current: ${contextSnapshot.weather.tempC}°C, Humidity: ${contextSnapshot.weather.humidityPct}%, Rain Today: ${contextSnapshot.weather.rainTodayMm} mm
  * 48-Hour Forecast: Rain probability ${contextSnapshot.weather.rainProbNext48hPct}%, Expected rainfall ${contextSnapshot.weather.rainExpectedNext48hMm} mm
=== END AGRONOMIC CONTEXT ===

CORE INSTRUCTIONS:
1. DIRECT ANSWER IN ENGLISH: Thoroughly and clearly answer the farmer's specific query in plain, standard English using the live telemetry and weather data provided above. Never output a single title or echo the user's question back.
2. SOIL & NUTRIENT QUERY: If the farmer asks about soil conditions, fertility, or secondary nutrients (such as Magnesium, Calcium, Phosphorus, Potassium, Sulfur, pH, or Organic Carbon), explicitly cite their live readings (Moisture: ${contextSnapshot.iot.moisturePct}%, N: ${contextSnapshot.iot.nitrogen} mg/kg, P: ${contextSnapshot.iot.phosphorus} mg/kg, K: ${contextSnapshot.iot.potassium} mg/kg, Mg: ${contextSnapshot.iot.magnesium} mg/kg, Ca: ${contextSnapshot.iot.calcium} mg/kg, S: ${contextSnapshot.iot.sulfur} mg/kg, pH: ${contextSnapshot.iot.ph}), evaluate whether they meet optimal standards for ${catalog.name}, and provide clear corrective advice in English.
3. WEATHER & IRRIGATION QUERY: If the farmer asks about weather or irrigation, state current conditions (${contextSnapshot.weather.tempC}°C, ${contextSnapshot.weather.humidityPct}% humidity) and the 48h rain forecast (${contextSnapshot.weather.rainExpectedNext48hMm} mm, ${contextSnapshot.weather.rainProbNext48hPct}% probability), and give an unequivocal recommendation to water or hold in English.
4. FERTILIZER QUERY: Calculate precise dosages in English for ${crop.land_size_acres} acres (e.g. "Apply 35 kg Urea for your ${crop.land_size_acres} acres").
5. LANGUAGE: Respond strictly in English.
6. FORMAT: Respond in valid JSON with this exact structure:
{
  "message": "A detailed, friendly, and complete 3 to 5 sentence agronomic advisory in English directly answering the farmer's question...",
  "structuredAdvice": {
    "actionRequired": "Immediate priority action in English",
    "irrigationAdvice": "Specific watering advice in English",
    "fertilizerDosing": [
      { "product": "Urea / DAP / 19:19:19", "quantityKg": 25, "method": "Top-dressing / Drip / Foliar" }
    ],
    "preventionTips": ["Practical agronomic tip 1", "Practical agronomic tip 2"]
  }
}`;

    // 8. Execute AI Inference with Cloud-First & Local-Edge Resilient Strategy
    let resultPayload: AIChatResponsePayload;

    if (preferredEngine === 'ollama') {
      try {
        resultPayload = await this.executeOllamaInference(systemPrompt, chronologicalHistory, userMessage, modelName);
      } catch (ollamaErr) {
        logger.warn('Ollama unavailable, falling back to Gemini Cloud', { error: String(ollamaErr) });
        try {
          resultPayload = await this.executeGeminiInference(systemPrompt, chronologicalHistory, userMessage);
        } catch (geminiErr) {
          logger.warn('Gemini cloud fallback failed, generating local agronomic advisory', { error: String(geminiErr) });
          resultPayload = this.generateGracefulAgronomicFallback(catalog as CropCatalog, crop as FarmerCrop, iot as VirtualIoTDevice, userMessage, 'en', profile, weatherSummary);
        }
      }
    } else {
      try {
        resultPayload = await this.executeGeminiInference(systemPrompt, chronologicalHistory, userMessage, modelName);
      } catch (geminiErr) {
        logger.warn('Gemini cloud API call failed, attempting local Ollama edge fallback', { error: String(geminiErr) });
        try {
          const isOllamaReady = await ollamaService.isAvailable();
          if (isOllamaReady) {
            resultPayload = await this.executeOllamaInference(systemPrompt, chronologicalHistory, userMessage, modelName);
          } else {
            resultPayload = this.generateGracefulAgronomicFallback(catalog as CropCatalog, crop as FarmerCrop, iot as VirtualIoTDevice, userMessage, 'en', profile, weatherSummary);
          }
        } catch {
          resultPayload = this.generateGracefulAgronomicFallback(catalog as CropCatalog, crop as FarmerCrop, iot as VirtualIoTDevice, userMessage, 'en', profile, weatherSummary);
        }
      }
    }

    // 9. Persist Messages to crop_ai_chats table
    try {
      await (supabase.from('crop_ai_chats') as any).insert([
        {
          farmer_crop_id: farmerCropId,
          role: 'user',
          content: userMessage,
          context_snapshot: contextSnapshot,
          engine_used: resultPayload.engineUsed,
        },
        {
          farmer_crop_id: farmerCropId,
          role: 'assistant',
          content: resultPayload.message,
          context_snapshot: resultPayload.structuredAdvice,
          engine_used: resultPayload.engineUsed,
          tokens_used: resultPayload.tokensUsed,
        },
      ]);
    } catch (saveErr) {
      logger.warn('Failed to save chat message to crop_ai_chats table', { error: String(saveErr) });
    }

    return resultPayload;
  }

  private async executeGeminiInference(
    systemPrompt: string,
    history: { role: string; content: string }[],
    userMessage: string,
    customModelName?: string
  ): Promise<AIChatResponsePayload> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini client not initialized (GEMINI_API_KEY missing)');
    }

    const modelName = customModelName || this.getModelName();
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(cleanText);
      return {
        message: parsed.message || parsed.response || parsed.advice || text,
        structuredAdvice: parsed.structuredAdvice,
        engineUsed: modelName,
      };
    } catch {
      return {
        message: text,
        engineUsed: modelName,
      };
    }
  }

  private async executeOllamaInference(
    systemPrompt: string,
    history: { role: string; content: string }[],
    userMessage: string,
    customModelName?: string
  ): Promise<AIChatResponsePayload> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((h) => ({
        role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: h.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await ollamaService.chat(messages, customModelName, true);

    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(cleanText);
      return {
        message: parsed.message || parsed.response || parsed.advice || parsed.answer || cleanText,
        structuredAdvice: parsed.structuredAdvice,
        engineUsed: `ollama:${response.model}`,
      };
    } catch {
      return {
        message: response.text,
        engineUsed: `ollama:${response.model}`,
      };
    }
  }

  private generateGracefulAgronomicFallback(
    catalog: CropCatalog,
    crop: FarmerCrop,
    iot: VirtualIoTDevice,
    _userMessage: string,
    language: string,
    profile?: Record<string, unknown>,
    weatherSummary?: any
  ): AIChatResponsePayload {
    const isHindi = language === 'hi';
    const moisture = Number(iot.soil_moisture_pct || 48);
    const optMin = Number(catalog.optimal_soil_moisture_min || 45);
    const optMax = Number(catalog.optimal_soil_moisture_max || 65);
    const soilType = String(profile?.primary_soil_type || 'Alluvial Soil').split('(')[0].trim();
    const temp = weatherSummary?.tempC || 27;

    const message = isHindi
      ? `नमस्ते! आपके **${catalog.hindi_name || catalog.name}** की फसल (${crop.land_size_acres} एकड़, ${soilType} मिट्टी) अभी **${crop.current_status}** अवस्था में है। वर्तमान मिट्टी की नमी **${moisture}%** है (मानक स्तर: ${optMin}%–${optMax}%) तथा तापमान **${temp}°C** है। ${
          moisture < optMin
            ? `नमी कम होने के कारण आज 25–30 मिमी हल्की सिंचाई करें।`
            : moisture > optMax
            ? `मिट्टी में अधिक जलभराव है, जल निकास सुनिश्चित करें।`
            : `वर्तमान स्थिति आदर्श है, मानक शेड्यूल जारी रखें।`
        }`
      : `Hello! Your **${catalog.name}** crop (${crop.land_size_acres} acres, ${soilType}) is in the **${crop.current_status}** stage. Current soil moisture is **${moisture}%** (Optimal: ${optMin}%–${optMax}%) and ambient temperature is **${temp}°C**. ${
          moisture < optMin
            ? `Moisture is below threshold; apply 25–30 mm light irrigation today.`
            : moisture > optMax
            ? `Soil is over-saturated; ensure field drainage trenches are clear.`
            : `Conditions are optimal; maintain standard fertigation schedule.`
        }`;

    return {
      message,
      structuredAdvice: {
        actionRequired: moisture < optMin ? 'Apply irrigation today' : moisture > optMax ? 'Clear field drainage' : 'Maintain standard monitoring',
        irrigationAdvice: moisture < optMin ? 'Soil moisture below optimal threshold. Water today.' : 'Moisture is adequate.',
        preventionTips: [
          `Scout leaf undersides weekly for pests during ${crop.current_status} stage`,
          `Keep soil pH in the ${catalog.optimal_ph_min || 6.0}–${catalog.optimal_ph_max || 6.8} range for optimal nutrient uptake`,
        ],
      },
      engineUsed: 'offline-agronomy-engine',
    };
  }
}

export const aiChatService = new AIChatService();
