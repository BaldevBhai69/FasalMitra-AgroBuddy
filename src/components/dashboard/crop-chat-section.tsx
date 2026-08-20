'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerCropDetail } from '@/types/crop.types';
import { AIChatResponsePayload, DiseaseDiagnosisResult } from '@/types/ai.types';

import { WeatherForecastResponse } from '@/types/weather.types';

interface CropChatSectionProps {
  crop: FarmerCropDetail;
  liveIotData: {
    soilMoisture: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    magnesium?: number;
    calcium?: number;
    sulfur?: number;
    soilPh: number;
    organicCarbon?: number;
    electricalConductivity?: number;
    temp: number;
  };
  farmerProfile?: {
    village?: string;
    district?: string;
    state?: string;
    soilType?: string;
  };
  weather?: WeatherForecastResponse | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  engineUsed?: string;
  structuredAdvice?: AIChatResponsePayload['structuredAdvice'];
  diagnosis?: DiseaseDiagnosisResult;
  timestamp: string;
}

export const CropChatSection: React.FC<CropChatSectionProps> = ({
  crop,
  liveIotData,
  farmerProfile,
  weather,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'ollama' | 'gemini'>('ollama');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ isAvailable: boolean; model: string; latency?: number }>({
    isAvailable: false,
    model: 'llama3.1:8b',
  });
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Probe local Ollama status
  useEffect(() => {
    async function checkOllama() {
      try {
        const res = await fetch('/api/v1/ai/status');
        const json = await res.json();
        if (json?.data?.ollama) {
          setOllamaStatus({
            isAvailable: json.data.ollama.isAvailable,
            model: json.data.ollama.currentModel || 'llama3.1:8b',
            latency: json.data.ollama.latencyMs,
          });
        }
      } catch {
        // ignore probe errors
      }
    }
    checkOllama();
  }, []);

  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Welcome! I am your FasalMitra Agronomist. I have loaded live data for your ${crop.crop_catalog.name} (${crop.land_size_acres} Acres, ${crop.current_status} stage) with Soil Type: ${farmerProfile?.soilType?.split('(')[0]?.trim() || 'Alluvial'}, Moisture: ${liveIotData.soilMoisture}%, Nitrogen: ${liveIotData.nitrogen} mg/kg, and pH: ${liveIotData.soilPh}. Ask any question regarding irrigation, fertilizer dosage, or crop protection.`,
          engineUsed: selectedEngine === 'ollama' ? 'Llama 3.1 8B (Local)' : 'Gemini 3.6 Flash',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [crop, liveIotData, farmerProfile]);

  useEffect(() => {
    // Only scroll internal chat area when active conversations happen, never scroll window on page load
    if (messages.length > 1 && messagesScrollRef.current) {
      messagesScrollRef.current.scrollTo({
        top: messagesScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) {
      setInputPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    setLoading(true);

    try {
      const weatherPayload = weather ? {
        tempC: weather.current?.temperatureC,
        humidityPct: weather.current?.humidityPct,
        rainTodayMm: weather.current?.precipitationMm,
        rainProbNext48hPct: Math.max(
          weather.daily?.[0]?.precipitationProbabilityPct || 0,
          weather.daily?.[1]?.precipitationProbabilityPct || 0
        ),
        rainExpectedNext48hMm: Number(
          ((weather.daily?.[0]?.precipitationMm || 0) + (weather.daily?.[1]?.precipitationMm || 0)).toFixed(1)
        ),
      } : undefined;

      const res = await fetch(`/api/v1/ai/chat/${crop.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          engine: selectedEngine,
          language: 'en',
          cropContext: {
            name: crop.crop_catalog.name,
            hindiName: crop.crop_catalog.hindi_name,
            customCropName: crop.custom_crop_name,
            growthStage: crop.current_status,
            landSizeAcres: crop.land_size_acres,
            sowingDate: crop.sowing_date,
            daysSinceSowing: crop.days_since_sowing,
            irrigationSource: crop.irrigation_source,
            optimalSoilMoistureMin: crop.crop_catalog.optimal_soil_moisture_min,
            optimalSoilMoistureMax: crop.crop_catalog.optimal_soil_moisture_max,
            optimalNitrogenMin: crop.crop_catalog.optimal_nitrogen_min,
            optimalNitrogenMax: crop.crop_catalog.optimal_nitrogen_max,
            optimalPhosphorusMin: crop.crop_catalog.optimal_phosphorus_min,
            optimalPhosphorusMax: crop.crop_catalog.optimal_phosphorus_max,
            optimalPotassiumMin: crop.crop_catalog.optimal_potassium_min,
            optimalPotassiumMax: crop.crop_catalog.optimal_potassium_max,
            optimalPhMin: crop.crop_catalog.optimal_ph_min,
            optimalPhMax: crop.crop_catalog.optimal_ph_max,
            durationDaysMax: crop.crop_catalog.duration_days_max,
            mspPricePerQuintal: crop.crop_catalog.msp_price_per_quintal,
            fertilizerGuide: crop.crop_catalog.fertilizer_guide as any,
          },
          farmerProfile: {
            village: farmerProfile?.village,
            district: farmerProfile?.district,
            state: farmerProfile?.state,
            soilType: farmerProfile?.soilType,
          },
          weatherContext: weatherPayload,
          iotOverride: {
            soil_moisture_pct: liveIotData.soilMoisture,
            nitrogen_mg_kg: liveIotData.nitrogen,
            phosphorus_mg_kg: liveIotData.phosphorus,
            potassium_mg_kg: liveIotData.potassium,
            magnesium_mg_kg: liveIotData.magnesium,
            calcium_mg_kg: liveIotData.calcium,
            sulfur_mg_kg: liveIotData.sulfur,
            soil_ph: liveIotData.soilPh,
            organic_carbon_pct: liveIotData.organicCarbon,
            electrical_conductivity_ds_m: liveIotData.electricalConductivity,
            soil_temperature_c: liveIotData.temp,
          },
        }),
      });

      const json = await res.json();
      const payload: AIChatResponsePayload = json?.data || {
        message: 'Could not connect to model. Please verify that Ollama or Gemini API key is configured.',
        engineUsed: selectedEngine,
      };

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: payload.message,
        structuredAdvice: payload.structuredAdvice,
        engineUsed: payload.engineUsed || (selectedEngine === 'ollama' ? 'Llama 3.1 8B' : 'Gemini Cloud'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `Note: Model inference encountered a temporary issue (${err.message}). If using local Ollama, ensure \`ollama run llama3.1:8b\` is active.`,
          engineUsed: selectedEngine,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload / Leaf Vision entry
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const userMsg: ChatMessage = {
        id: `user-img-${Date.now()}`,
        role: 'user',
        content: `[Uploaded leaf photo for pathology scan: ${file.name}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch('/api/v1/ai/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            cropName: crop.crop_catalog.name,
            language: 'hi',
          }),
        });

        const json = await res.json();
        const diag: DiseaseDiagnosisResult = json?.data;

        if (diag) {
          const aiMsg: ChatMessage = {
            id: `ai-diag-${Date.now()}`,
            role: 'assistant',
            content: `**Disease Diagnosis Result:**\n\n**Detected:** ${diag.detectedDisease} (${diag.severity} Severity, ${diag.confidenceScore}% Confidence)\n\n**Cause:** ${diag.cause}\n\n**Symptoms:** ${diag.symptomsIdentified?.join(', ')}\n\n**Organic Remedy:** ${diag.organicRemedies?.join('; ')}\n\n**Chemical Treatment:** ${diag.chemicalTreatments?.map((c) => `${c.chemicalName} (${c.dosage})`).join('; ')}`,
            diagnosis: diag,
            engineUsed: diag.engineUsed || 'Gemini Vision 3.6',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `diag-err-${Date.now()}`,
            role: 'assistant',
            content: `Leaf scan failed: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setLoading(false);
        setAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] shadow-sm space-y-4 flex flex-col h-[660px]">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEBA17]/20 flex items-center justify-center text-[#A67500]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#2D2A26]">
              AI Agronomist
            </h3>
            <p className="text-[11px] text-[#8A7E6B]">
              {crop.custom_crop_name} | {liveIotData.soilMoisture}% Moisture | pH {liveIotData.soilPh}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="text-[11px] text-[#8A7E6B] hover:text-[#BC4F4F] transition"
          title="Clear Conversation"
        >
          Clear
        </button>
      </div>

      {/* Injected Telemetry Capsule Drawer */}
      {showTelemetryDrawer && (
        <div className="p-3.5 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0] text-xs text-[#2D2A26] space-y-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#A67500]">
            <span>Context Injected in Every Query:</span>
            <button onClick={() => setShowTelemetryDrawer(false)} className="text-[#8A7E6B] hover:text-[#BC4F4F] transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-white border border-[#E8DFD0]">
              <span className="text-[#8A7E6B] block">Soil Type</span>
              <span className="font-semibold">{farmerProfile?.soilType?.split('(')[0]?.trim() || 'Alluvial'} (pH {liveIotData.soilPh})</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E8DFD0]">
              <span className="text-[#8A7E6B] block">Growth Stage</span>
              <span className="font-semibold">{crop.current_status}</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E8DFD0]">
              <span className="text-[#8A7E6B] block">Moisture</span>
              <span className="font-semibold text-[#A67500]">{liveIotData.soilMoisture}%</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E8DFD0]">
              <span className="text-[#8A7E6B] block">NPK</span>
              <span className="font-semibold">N:{liveIotData.nitrogen} P:{liveIotData.phosphorus} K:{liveIotData.potassium}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={messagesScrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                msg.role === 'user'
                  ? 'bg-[#FEBA17] text-[#14160C] font-semibold shadow-xs'
                  : 'bg-[#F9F3E6] border border-[#E8DFD0] text-[#2D2A26] leading-relaxed'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between text-[10px] pb-1 border-b border-[#E8DFD0] text-[#8A7E6B]">
                  <span className="font-semibold text-[#A67500]">
                    {msg.engineUsed || 'FasalMitra Agronomist'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.content}</p>

              {/* Structured Actionable Advice Card */}
              {msg.structuredAdvice && (
                <div className="pt-2 mt-2 border-t border-[#E8DFD0] space-y-2 text-[11px]">
                  {msg.structuredAdvice.actionRequired && (
                    <div className="p-2 rounded-lg bg-[#FEBA17]/15 border border-[#FEBA17]/40 text-[#A67500] font-semibold">
                      Priority Action: {msg.structuredAdvice.actionRequired}
                    </div>
                  )}

                  {msg.structuredAdvice.fertilizerDosing && msg.structuredAdvice.fertilizerDosing.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[#8A7E6B] font-semibold block text-[10px]">Dosage for {crop.land_size_acres} Acres:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.structuredAdvice.fertilizerDosing.map((f, i) => (
                          <div key={i} className="p-1.5 rounded-lg bg-white border border-[#E8DFD0] flex justify-between">
                            <span className="font-medium">{f.product}</span>
                            <span className="font-semibold text-[#A67500]">{f.quantityKg} kg ({f.method})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.structuredAdvice.irrigationAdvice && (
                    <div className="text-[#8A7E6B]">
                      <span className="font-semibold text-[#2D2A26]">Irrigation:</span> {msg.structuredAdvice.irrigationAdvice}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="p-3.5 rounded-2xl bg-[#F9F3E6] border border-[#E8DFD0] text-xs text-[#A67500] flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#FEBA17] border-t-transparent rounded-full animate-spin" />
              <span>{selectedEngine === 'ollama' ? 'Llama 3.1 analyzing...' : 'Gemini reasoning...'}</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          onClick={() => handleSendMessage(`What fertilizer dosage is needed today for my ${crop.land_size_acres} acres of ${crop.crop_catalog.name}?`)}
          className="px-2.5 py-1 rounded-full text-[11px] bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border border-[#E8DFD0] text-[#2D2A26] transition"
        >
          Dosage for {crop.land_size_acres} Acres
        </button>
        <button
          onClick={() => handleSendMessage(`My soil moisture is ${liveIotData.soilMoisture}%. Should I irrigate today?`)}
          className="px-2.5 py-1 rounded-full text-[11px] bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border border-[#E8DFD0] text-[#2D2A26] transition"
        >
          Irrigation Advice
        </button>
        <button
          onClick={() => handleSendMessage(`What are the common diseases in ${crop.crop_catalog.name} at ${crop.current_status} stage and organic remedies?`)}
          className="px-2.5 py-1 rounded-full text-[11px] bg-[#F9F3E6] hover:bg-[#FEBA17]/20 border border-[#E8DFD0] text-[#2D2A26] transition"
        >
          Disease Prevention
        </button>
      </div>

      {/* Input Bar */}
      <div className="relative rounded-2xl bg-[#F9F3E6] border border-[#E8DFD0] focus-within:border-[#FEBA17] transition-all p-3 sm:p-3.5 space-y-2">
        
        {/* Text Area */}
        <div className="w-full">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => {
              setInputPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask FasalMitra Agronomist anything about ${crop.custom_crop_name}...`}
            className="w-full bg-transparent border-0 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/60 focus:outline-none resize-none max-h-24 leading-relaxed"
          />
        </div>

        {/* Hidden Image File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between pt-1">
          
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzingImage || loading}
              className="w-8 h-8 rounded-xl bg-white hover:bg-[#FEBA17]/20 text-[#8A7E6B] hover:text-[#A67500] border border-[#E8DFD0] flex items-center justify-center transition disabled:opacity-40"
              title="Add leaf photograph"
              aria-label="Add photograph"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEBA17]/20 border border-[#E8DFD0] text-xs font-medium text-[#2D2A26] transition"
              >
                <span>{selectedEngine === 'ollama' ? 'Llama 3.1 8B' : 'Gemini 3.6'}</span>
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 p-1.5 rounded-xl bg-white border border-[#E8DFD0] shadow-lg z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEngine('ollama');
                      setShowModelMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                      selectedEngine === 'ollama'
                        ? 'bg-[#FEBA17]/20 text-[#A67500] font-semibold border border-[#FEBA17]/40'
                        : 'text-[#2D2A26] hover:bg-[#F9F3E6]'
                    }`}
                  >
                    <span>Llama 3.1 8B</span>
                    <span className={`w-2 h-2 rounded-full ${ollamaStatus.isAvailable ? 'bg-[#4A8C5C]' : 'bg-[#FEBA17]'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEngine('gemini');
                      setShowModelMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                      selectedEngine === 'gemini'
                        ? 'bg-[#FEBA17]/20 text-[#A67500] font-semibold border border-[#FEBA17]/40'
                        : 'text-[#2D2A26] hover:bg-[#F9F3E6]'
                    }`}
                  >
                    <span>Gemini 3.6 Flash</span>
                    <span className="w-2 h-2 rounded-full bg-[#4A8C5C]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputPrompt.trim()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              inputPrompt.trim() && !loading
                ? 'bg-[#FEBA17] hover:bg-[#E5A60F] text-[#14160C] shadow-xs'
                : 'bg-[#E8DFD0]/50 text-[#8A7E6B]/40 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};
