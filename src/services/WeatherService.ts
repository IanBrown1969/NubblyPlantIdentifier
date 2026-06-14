import axios from 'axios';

export interface WeatherTelemetry {
  temperature: number;
  description: string;
  placeName: string;
  frostAlert: boolean;
  heatAlert: boolean;
}

// WMO Weather Interpretation Codes → human-readable description
// https://open-meteo.com/en/docs#weathervariables
function wmoCodeToDescription(code: number): string {
  if (code === 0)                     return 'Clear sky';
  if (code <= 3)                      return 'Partly cloudy';
  if (code <= 48)                     return 'Foggy conditions';
  if (code <= 55)                     return 'Light drizzle';
  if (code <= 65)                     return 'Rainy showers';
  if (code <= 75)                     return 'Snowfall';
  if (code <= 82)                     return 'Rain showers';
  if (code <= 99)                     return 'Thunderstorm';
  return 'Overcast';
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export const WeatherService = {
  /**
   * Fetches live weather from Open-Meteo (free, no API key required) for the
   * given GPS coordinates, then maps the response to the app's WeatherTelemetry shape.
   * Falls back to a realistic seasonal simulator if the network request fails.
   */
  async getLocalWeather(latitude: number, longitude: number, placeName: string = 'My Garden'): Promise<WeatherTelemetry> {
    try {
      console.log(`[WeatherService] Fetching live weather for LAT: ${latitude.toFixed(4)}, LON: ${longitude.toFixed(4)} (${placeName})`);

      const { data } = await axios.get(OPEN_METEO_URL, {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,weathercode,apparent_temperature,precipitation',
          temperature_unit: 'celsius',
          timezone: 'auto',
        },
        timeout: 8000,
      });

      const current = data?.current;
      if (!current) throw new Error('Open-Meteo response missing current block');

      const temperature = Number(current.temperature_2m?.toFixed(1) ?? 20);
      const weatherCode = current.weathercode ?? 0;
      const description = wmoCodeToDescription(weatherCode);

      const frostAlert = temperature <= 3.0;
      const heatAlert = temperature >= 32.0;

      console.log(`[WeatherService] Live weather resolved — ${temperature}°C, "${description}", frost: ${frostAlert}, heat: ${heatAlert}`);

      return { temperature, description, placeName, frostAlert, heatAlert };
    } catch (e: any) {
      console.warn('[WeatherService] Live fetch failed, using seasonal fallback simulator:', e?.message || e);
      return this.simulateSeasonal(placeName);
    }
  },

  /**
   * Realistic seasonal fallback used when the device is offline or the API is unavailable.
   */
  simulateSeasonal(placeName: string): WeatherTelemetry {
    const month = new Date().getMonth(); // 0-indexed
    const isWinter = month === 10 || month === 11 || month === 0 || month === 1;

    let temperature: number;
    let description: string;

    if (isWinter) {
      temperature = Number((1.2 + Math.random() * 1.3).toFixed(1));
      description = 'Overcast frost, icy winds';
    } else {
      temperature = Number((18.5 + Math.random() * 6).toFixed(1));
      description = 'Clear skies, warm sunshine';
    }

    return {
      temperature,
      description,
      placeName,
      frostAlert: temperature <= 3.0,
      heatAlert: temperature >= 32.0,
    };
  },
};
