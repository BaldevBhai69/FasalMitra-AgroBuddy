export interface CropContextPayload {
  name: string;
  hindiName?: string;
  customCropName?: string;
  growthStage?: string;
  landSizeAcres?: number;
  sowingDate?: string;
  daysSinceSowing?: number;
  irrigationSource?: string;
  optimalSoilMoistureMin?: number;
  optimalSoilMoistureMax?: number;
  optimalNitrogenMin?: number;
  optimalNitrogenMax?: number;
  optimalPhosphorusMin?: number;
  optimalPhosphorusMax?: number;
  optimalPotassiumMin?: number;
  optimalPotassiumMax?: number;
  optimalPhMin?: number;
  optimalPhMax?: number;
  durationDaysMax?: number;
  mspPricePerQuintal?: number;
  fertilizerGuide?: {
    basal?: string;
    top_dressing?: string;
  };
}

export interface FarmerProfilePayload {
  village?: string;
  district?: string;
  state?: string;
  soilType?: string;
  soilPh?: number;
  preferredLanguage?: string;
}

export interface WeatherContextPayload {
  tempC?: number;
  humidityPct?: number;
  rainTodayMm?: number;
  rainProbNext48hPct?: number;
  rainExpectedNext48hMm?: number;
}

export interface ChatMessageContextSnapshot {
  cropName: string;
  growthStage: string;
  daysSinceSown: number;
  landSizeAcres: number;
  location: string;
  soil: {
    type?: string | null;
    ph?: number | null;
    organicCarbonPct?: number | null;
  };
  iot: {
    moisturePct: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    magnesium?: number;
    calcium?: number;
    sulfur?: number;
    organicCarbon?: number;
    electricalConductivity?: number;
    ph: number;
    tempC: number;
  };
  weather: {
    tempC: number;
    humidityPct: number;
    rainTodayMm: number;
    rainProbNext48hPct: number;
    rainExpectedNext48hMm: number;
  };
}

export interface AIChatResponsePayload {
  message: string;
  structuredAdvice?: {
    diagnosis?: string;
    actionRequired?: string;
    fertilizerDosing?: {
      product: string;
      quantityKg: number;
      method: string;
    }[];
    irrigationAdvice?: string;
    preventionTips?: string[];
  };
  engineUsed: string;
  tokensUsed?: number;
}

export interface DiseaseDiagnosisResult {
  detectedDisease: string;
  cropName: string;
  confidenceScore: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  symptomsIdentified: string[];
  cause: string;
  organicRemedies: string[];
  chemicalTreatments: {
    chemicalName: string;
    dosage: string;
    safetyWaitingPeriodDays: number;
  }[];
  preventiveAdvice: string[];
  engineUsed: string;
}

