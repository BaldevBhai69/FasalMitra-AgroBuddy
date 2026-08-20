import { CropCatalog, FarmerCrop, VirtualIoTDevice } from '@/types/crop.types';
import { IrrigationRecommendation, WeatherForecastResponse } from '@/types/weather.types';

export class IrrigationService {
  /**
   * Calculates on-the-spot daily irrigation advice based on FAO-56 Penman-Monteith ETc,
   * live virtual IoT probe readings, and real-time precipitation forecast.
   */
  calculateIrrigationAdvice(
    crop: FarmerCrop,
    catalog: CropCatalog,
    iot: VirtualIoTDevice,
    weather: WeatherForecastResponse
  ): IrrigationRecommendation {
    const todayWeather = weather.daily[0] || {
      et0FaoMm: 4.5,
      precipitationMm: 0,
      precipitationProbabilityPct: 10,
      temperatureMax: 30,
      temperatureMin: 20,
      humidityMeanPct: 50,
      weatherDescription: 'Clear sky',
    };

    const tomorrowWeather = weather.daily[1] || {
      precipitationMm: 0,
      precipitationProbabilityPct: 10,
    };

    // 1. Calculate Crop Evapotranspiration (ETc = ET0 * Kc)
    const currentKc = this.resolveCropCoefficientKc(crop, catalog);
    const et0 = todayWeather.et0FaoMm || 4.5;
    const etc = Number((et0 * currentKc).toFixed(2));

    // 2. Aggregate Rainfall Forecast
    const rainNext24h = Number((todayWeather.precipitationMm || 0).toFixed(1));
    const rainNext48h = Number(((todayWeather.precipitationMm || 0) + (tomorrowWeather.precipitationMm || 0)).toFixed(1));
    const rainProb48h = Math.max(todayWeather.precipitationProbabilityPct || 0, tomorrowWeather.precipitationProbabilityPct || 0);

    // 3. Evaluate Soil Moisture Deficit
    const currentMoisture = Number(iot.soil_moisture_pct);
    const optMin = Number(catalog.optimal_soil_moisture_min || 40.0);
    const optMax = Number(catalog.optimal_soil_moisture_max || 65.0);

    const moistureDeficitPct = Math.max(0, optMin - currentMoisture);
    const isSaturated = currentMoisture > optMax + 5;
    const isCriticallyDry = currentMoisture < optMin * 0.7;

    // 4. Conversion factor: 1 mm depth on 1 acre = 4,046.86 Liters
    const LITERS_PER_MM_PER_ACRE = 4047.0;
    const landAcres = Number(crop.land_size_acres);

    let action: IrrigationRecommendation['action'] = 'NORMAL';
    let badgeColor: IrrigationRecommendation['badgeColor'] = 'green';
    let headline = 'Maintain Scheduled Irrigation';
    let explanation = `Soil moisture is within the optimal agronomic range (${optMin}% - ${optMax}%). Continue standard scheduled irrigation.`;
    let recommendedWaterDepthMm = etc;
    let waterSavingsLiters = 0;

    // RULE 1: Significant Rain Expected (> 8mm in 48h) -> SKIP or REDUCE
    if (rainNext48h >= 15.0 || (rainNext48h >= 8.0 && rainProb48h >= 60)) {
      action = 'SKIP';
      badgeColor = 'blue';
      headline = `SKIP Irrigation — Heavy Rain Forecasted (${rainNext48h} mm)`;
      recommendedWaterDepthMm = 0;
      waterSavingsLiters = Math.round(etc * landAcres * LITERS_PER_MM_PER_ACRE);
      explanation = `Open-Meteo forecasts ${rainNext48h} mm of precipitation in the next 48 hours (${rainProb48h}% probability). Skipping irrigation today saves approximately ${waterSavingsLiters.toLocaleString()} Liters of water across your ${landAcres} acre field and prevents waterlogging.`;
    } else if (rainNext24h >= 5.0 && rainProb48h >= 50) {
      action = 'REDUCE';
      badgeColor = 'blue';
      headline = `REDUCE Irrigation by 50% — Light Showers Expected (${rainNext24h} mm)`;
      recommendedWaterDepthMm = Number((etc * 0.5).toFixed(1));
      waterSavingsLiters = Math.round((etc - recommendedWaterDepthMm) * landAcres * LITERS_PER_MM_PER_ACRE);
      explanation = `Light rain of ${rainNext24h} mm is anticipated today. Reduce your scheduled irrigation volume by half to conserve ~${waterSavingsLiters.toLocaleString()} Liters.`;
    }
    // RULE 2: Soil Over-saturated -> HOLD / DRAIN
    else if (isSaturated) {
      action = 'HOLD_DRAIN';
      badgeColor = 'red';
      headline = `HOLD Irrigation — Soil is Waterlogged (${currentMoisture}%)`;
      recommendedWaterDepthMm = 0;
      waterSavingsLiters = Math.round(etc * landAcres * LITERS_PER_MM_PER_ACRE);
      explanation = `Current soil moisture probe reading is ${currentMoisture}%, which exceeds the safe threshold of ${optMax}%. Withhold all irrigation and ensure field drainage ditches are cleared to protect root aeration and prevent fungal root rot.`;
    }
    // RULE 3: Below Minimum Moisture -> IRRIGATE MORE
    else if (currentMoisture < optMin) {
      action = 'IRRIGATE_MORE';
      badgeColor = isCriticallyDry ? 'red' : 'yellow';
      const extraDepth = Number((moistureDeficitPct * 0.4).toFixed(1));
      recommendedWaterDepthMm = Number((etc + extraDepth).toFixed(1));
      headline = `Irrigate Promptly — Soil Moisture Deficit (${currentMoisture}%)`;
      explanation = `Soil moisture is at ${currentMoisture}%, below the required ${optMin}% threshold for ${catalog.name} in its ${crop.current_status} stage. Apply approximately ${recommendedWaterDepthMm} mm of irrigation depth (${Math.round(recommendedWaterDepthMm * landAcres * LITERS_PER_MM_PER_ACRE).toLocaleString()} Liters) to restore root zone moisture.`;
    }

    const recommendedWaterVolumeLiters = Math.round(recommendedWaterDepthMm * landAcres * LITERS_PER_MM_PER_ACRE);

    return {
      action,
      badgeColor,
      headline,
      explanation,
      cropEvapotranspirationEtcMm: etc,
      referenceEt0Mm: et0,
      cropCoefficientKc: currentKc,
      currentSoilMoisturePct: currentMoisture,
      optimalSoilMoistureMinPct: optMin,
      optimalSoilMoistureMaxPct: optMax,
      soilMoistureDeficitPct: moistureDeficitPct,
      expectedRainNext24hMm: rainNext24h,
      expectedRainNext48hMm: rainNext48h,
      waterSavingsLiters,
      recommendedWaterDepthMm,
      recommendedWaterVolumeLiters,
      weatherSummary: {
        tempC: Number(((todayWeather.temperatureMax + todayWeather.temperatureMin) / 2).toFixed(1)),
        humidityPct: todayWeather.humidityMeanPct,
        rainProbNext48hPct: rainProb48h,
        weatherDescription: todayWeather.weatherDescription,
      },
    };
  }

  /**
   * Resolves dynamic Kc coefficient based on current growth stage
   */
  private resolveCropCoefficientKc(crop: FarmerCrop, catalog: CropCatalog): number {
    const status = crop.current_status;
    const kcIni = Number(catalog.kc_initial || 0.40);
    const kcMid = Number(catalog.kc_mid || 1.15);
    const kcEnd = Number(catalog.kc_end || 0.70);

    switch (status) {
      case 'Planning':
      case 'Sown':
        return kcIni;
      case 'Vegetative':
        return Number(((kcIni + kcMid) / 2).toFixed(2));
      case 'Flowering':
        return kcMid;
      case 'Harvesting':
      case 'Harvested':
        return kcEnd;
      default:
        return kcMid;
    }
  }
}

export const irrigationService = new IrrigationService();
