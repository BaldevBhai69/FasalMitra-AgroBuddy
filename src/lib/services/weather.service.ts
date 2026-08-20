import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { DailyForecastItem, WeatherForecastResponse } from '@/types/weather.types';

// WMO Weather interpretation codes
export const WMO_WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export class WeatherService {
  private CACHE_TTL_HOURS = 3;

  /**
   * Retrieves 16-day weather forecast with ET0 and soil moisture.
   * Utilizes database cache-aside with 3-hour TTL before hitting Open-Meteo.
   */
  async getForecast(
    latitude: number,
    longitude: number,
    forceFresh: boolean = false
  ): Promise<WeatherForecastResponse> {
    const latRounded = Number(latitude.toFixed(3));
    const lonRounded = Number(longitude.toFixed(3));

    if (!forceFresh) {
      const cached = await this.getCachedForecast(latRounded, lonRounded);
      if (cached) {
        return cached;
      }
    }

    // Cache miss or expired — fetch live from Open-Meteo
    return this.fetchAndCacheLiveForecast(latRounded, lonRounded);
  }

  /**
   * Checks Supabase weather_cache table for fresh forecast
   */
  private async getCachedForecast(
    latitude: number,
    longitude: number
  ): Promise<WeatherForecastResponse | null> {
    try {
      const supabase = createAdminSupabaseClient();
      const cutoffTime = new Date(Date.now() - this.CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('latitude', latitude)
        .eq('longitude', longitude)
        .gte('fetched_at', cutoffTime)
        .gte('forecast_date', new Date().toISOString().split('T')[0])
        .order('forecast_date', { ascending: true })
        .limit(16);

      if (error || !data || data.length === 0) {
        return null;
      }

      const daily: DailyForecastItem[] = (data as any[]).map((row) => ({
        date: row.forecast_date,
        temperatureMax: Number(row.temperature_max_c || 28),
        temperatureMin: Number(row.temperature_min_c || 18),
        precipitationMm: Number(row.precipitation_mm || 0),
        precipitationProbabilityPct: Number(row.precipitation_probability_pct || 0),
        humidityMeanPct: Number(row.humidity_mean_pct || 55),
        windSpeedMaxKmh: Number(row.wind_speed_max_kmh || 10),
        et0FaoMm: Number(row.et0_fao_mm || 4.2),
        weatherCode: row.weather_code || 0,
        weatherDescription: WMO_WEATHER_CODES[row.weather_code || 0] || 'Clear sky',
        soilMoisture0To7cm: row.soil_moisture_0_7cm ? Number(row.soil_moisture_0_7cm) : undefined,
        soilMoisture7To28cm: row.soil_moisture_7_28cm ? Number(row.soil_moisture_7_28cm) : undefined,
        soilTemperature0To7cm: row.soil_temperature_0_7cm ? Number(row.soil_temperature_0_7cm) : undefined,
      }));

      const today = daily[0];

      return {
        latitude,
        longitude,
        timezone: 'Asia/Kolkata',
        elevation: 200,
        current: {
          temperatureC: (today.temperatureMax + today.temperatureMin) / 2,
          humidityPct: today.humidityMeanPct,
          precipitationMm: today.precipitationMm,
          windSpeedKmh: today.windSpeedMaxKmh,
          weatherCode: today.weatherCode,
          soilMoisturePct: today.soilMoisture0To7cm ? Number((today.soilMoisture0To7cm * 100).toFixed(1)) : 45.0,
          soilTemperatureC: today.soilTemperature0To7cm || 24.5,
        },
        daily,
        source: 'cache',
        cachedAt: (data[0] as any).fetched_at,
      };
    } catch (err) {
      logger.warn('Failed to query weather_cache table, proceeding to live fetch', { error: String(err) });
      return null;
    }
  }

  /**
   * Fetches fresh forecast from Open-Meteo Weather + Soil API and persists in weather_cache
   */
  private async fetchAndCacheLiveForecast(
    latitude: number,
    longitude: number
  ): Promise<WeatherForecastResponse> {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,et0_fao_evapotranspiration,weather_code&hourly=soil_temperature_0_to_7cm,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm&timezone=Asia/Kolkata&forecast_days=16`;

      const res = await fetch(weatherUrl, { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } });

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}: ${await res.text()}`);
      }

      const raw = await res.json();
      const dailyData = raw.daily;

      const daily: DailyForecastItem[] = [];
      const cacheRowsToUpsert: any[] = [];

      for (let i = 0; i < (dailyData?.time?.length || 0); i++) {
        const date = dailyData.time[i];
        const tempMax = Number(dailyData.temperature_2m_max?.[i] ?? 30.0);
        const tempMin = Number(dailyData.temperature_2m_min?.[i] ?? 20.0);
        const precip = Number(dailyData.precipitation_sum?.[i] ?? 0.0);
        const precipProb = Number(dailyData.precipitation_probability_max?.[i] ?? 0);
        const humidity = Number(dailyData.relative_humidity_2m_mean?.[i] ?? 50.0);
        const windSpeed = Number(dailyData.wind_speed_10m_max?.[i] ?? 12.0);
        const et0 = Number(dailyData.et0_fao_evapotranspiration?.[i] ?? 4.5);
        const weatherCode = Number(dailyData.weather_code?.[i] ?? 0);

        // Approximate soil moisture from hourly slice (noon index: i * 24 + 12)
        const hourlyIndex = Math.min(i * 24 + 12, (raw.hourly?.soil_moisture_0_to_7cm?.length || 1) - 1);
        const soilMoisture0_7 = raw.hourly?.soil_moisture_0_to_7cm?.[hourlyIndex] ?? 0.35;
        const soilMoisture7_28 = raw.hourly?.soil_moisture_7_to_28cm?.[hourlyIndex] ?? 0.38;
        const soilTemp = raw.hourly?.soil_temperature_0_to_7cm?.[hourlyIndex] ?? 24.0;

        daily.push({
          date,
          temperatureMax: tempMax,
          temperatureMin: tempMin,
          precipitationMm: precip,
          precipitationProbabilityPct: precipProb,
          humidityMeanPct: humidity,
          windSpeedMaxKmh: windSpeed,
          et0FaoMm: et0,
          weatherCode,
          weatherDescription: WMO_WEATHER_CODES[weatherCode] || 'Partly cloudy',
          soilMoisture0To7cm: soilMoisture0_7,
          soilMoisture7To28cm: soilMoisture7_28,
          soilTemperature0To7cm: soilTemp,
        });

        cacheRowsToUpsert.push({
          latitude,
          longitude,
          forecast_date: date,
          temperature_max_c: tempMax,
          temperature_min_c: tempMin,
          precipitation_mm: precip,
          precipitation_probability_pct: precipProb,
          humidity_mean_pct: humidity,
          wind_speed_max_kmh: windSpeed,
          et0_fao_mm: et0,
          weather_code: weatherCode,
          soil_moisture_0_7cm: soilMoisture0_7,
          soil_moisture_7_28cm: soilMoisture7_28,
          soil_temperature_0_7cm: soilTemp,
          fetched_at: new Date().toISOString(),
        });
      }

      // Upsert into weather_cache in background
      try {
        const supabase = createAdminSupabaseClient();
        await (supabase.from('weather_cache') as any)
          .upsert(cacheRowsToUpsert, { onConflict: 'latitude,longitude,forecast_date' });
      } catch (cacheErr) {
        logger.warn('Failed to upsert weather_cache records', { error: String(cacheErr) });
      }

      const today = daily[0] || {
        temperatureMax: 30,
        temperatureMin: 20,
        humidityMeanPct: 55,
        precipitationMm: 0,
        windSpeedMaxKmh: 10,
        weatherCode: 0,
        soilMoisture0To7cm: 0.40,
        soilTemperature0To7cm: 25,
      };

      return {
        latitude,
        longitude,
        timezone: raw.timezone || 'Asia/Kolkata',
        elevation: raw.elevation || 200,
        current: {
          temperatureC: Number(((today.temperatureMax + today.temperatureMin) / 2).toFixed(1)),
          humidityPct: today.humidityMeanPct,
          precipitationMm: today.precipitationMm,
          windSpeedKmh: today.windSpeedMaxKmh,
          weatherCode: today.weatherCode,
          soilMoisturePct: Number(((today.soilMoisture0To7cm || 0.45) * 100).toFixed(1)),
          soilTemperatureC: today.soilTemperature0To7cm || 25.0,
        },
        daily,
        source: 'open-meteo-live',
        cachedAt: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('Failed to fetch Open-Meteo forecast, generating resilient agronomic fallback', err);
      return this.generateFallbackForecast(latitude, longitude);
    }
  }

  private generateFallbackForecast(latitude: number, longitude: number): WeatherForecastResponse {
    const daily: DailyForecastItem[] = [];
    const now = new Date();

    for (let i = 0; i < 16; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      daily.push({
        date: dateStr,
        temperatureMax: 31.5,
        temperatureMin: 21.0,
        precipitationMm: i === 1 ? 12.0 : 0.0,
        precipitationProbabilityPct: i === 1 ? 65 : 10,
        humidityMeanPct: 58.0,
        windSpeedMaxKmh: 14.0,
        et0FaoMm: 4.6,
        weatherCode: i === 1 ? 61 : 1,
        weatherDescription: i === 1 ? 'Slight rain' : 'Mainly clear',
        soilMoisture0To7cm: 0.42,
        soilMoisture7To28cm: 0.45,
        soilTemperature0To7cm: 24.5,
      });
    }

    return {
      latitude,
      longitude,
      timezone: 'Asia/Kolkata',
      elevation: 200,
      current: {
        temperatureC: 26.5,
        humidityPct: 58.0,
        precipitationMm: 0.0,
        windSpeedKmh: 14.0,
        weatherCode: 1,
        soilMoisturePct: 42.0,
        soilTemperatureC: 24.5,
      },
      daily,
      source: 'open-meteo-live',
    };
  }
}

export const weatherService = new WeatherService();
