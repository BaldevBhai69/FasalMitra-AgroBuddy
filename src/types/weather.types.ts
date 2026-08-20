export interface DailyForecastItem {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationMm: number;
  precipitationProbabilityPct: number;
  humidityMeanPct: number;
  windSpeedMaxKmh: number;
  et0FaoMm: number;
  weatherCode: number;
  weatherDescription: string;
  soilMoisture0To7cm?: number;
  soilMoisture7To28cm?: number;
  soilTemperature0To7cm?: number;
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  current: {
    temperatureC: number;
    humidityPct: number;
    precipitationMm: number;
    windSpeedKmh: number;
    weatherCode: number;
    soilMoisturePct: number;
    soilTemperatureC: number;
  };
  daily: DailyForecastItem[];
  source: 'cache' | 'open-meteo-live';
  cachedAt?: string;
}

export interface IrrigationRecommendation {
  action: 'SKIP' | 'REDUCE' | 'NORMAL' | 'IRRIGATE_MORE' | 'HOLD_DRAIN';
  badgeColor: 'green' | 'yellow' | 'red' | 'blue';
  headline: string;
  explanation: string;
  cropEvapotranspirationEtcMm: number;
  referenceEt0Mm: number;
  cropCoefficientKc: number;
  currentSoilMoisturePct: number;
  optimalSoilMoistureMinPct: number;
  optimalSoilMoistureMaxPct: number;
  soilMoistureDeficitPct: number;
  expectedRainNext24hMm: number;
  expectedRainNext48hMm: number;
  waterSavingsLiters: number;
  recommendedWaterDepthMm: number;
  recommendedWaterVolumeLiters: number;
  weatherSummary: {
    tempC: number;
    humidityPct: number;
    rainProbNext48hPct: number;
    weatherDescription: string;
  };
}
