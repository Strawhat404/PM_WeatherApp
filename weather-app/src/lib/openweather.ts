import axios from "axios";
import type {
  CurrentWeather,
  ForecastResponse,
  AirQualityData,
} from "@/types/weather";

const BASE_URL = "https://api.openweathermap.org";
const API_KEY = process.env.OPENWEATHER_API_KEY;

// ─────────────────────────────────────────────
// Geocoding — resolve any location string to
// lat/lon + display name
// ─────────────────────────────────────────────

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Resolve a free-text location (city, zip, landmark, coordinates)
 * to a geocoding result. Supports:
 *  - City name: "London"
 *  - City + country: "Paris,FR"
 *  - US zip: "10001"
 *  - GPS coordinates: "40.7128,-74.0060"
 *  - Landmarks resolved via city name fuzzy match
 */
export async function geocodeLocation(
  location: string
): Promise<GeocodingResult> {
  if (!API_KEY) {
    throw new Error("OPENWEATHER_API_KEY is not set");
  }

  const trimmed = location.trim();

  // Check if input looks like GPS coordinates (e.g. "40.7128,-74.0060")
  const coordsMatch = trimmed.match(
    /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/
  );
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);

    // Reverse geocode to get a display name
    const res = await axios.get(`${BASE_URL}/geo/1.0/reverse`, {
      params: { lat, lon, limit: 1, appid: API_KEY },
    });

    if (!res.data || res.data.length === 0) {
      // Return a minimal result with the raw coordinates as name
      return { name: trimmed, lat, lon, country: "" };
    }

    return res.data[0] as GeocodingResult;
  }

  // Check if input looks like a US zip code (5 digits)
  const zipMatch = trimmed.match(/^\d{5}$/);
  if (zipMatch) {
    const res = await axios.get(`${BASE_URL}/geo/1.0/zip`, {
      params: { zip: `${trimmed},US`, appid: API_KEY },
    });
    const data = res.data;
    return {
      name: data.name,
      lat: data.lat,
      lon: data.lon,
      country: data.country,
    };
  }

  // Default: free-text geocoding (city, landmark, etc.)
  const res = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
    params: { q: trimmed, limit: 1, appid: API_KEY },
  });

  if (!res.data || res.data.length === 0) {
    throw new Error(`Location not found: "${location}"`);
  }

  return res.data[0] as GeocodingResult;
}

/**
 * Build a human-readable resolved location string
 */
export function formatLocation(geo: GeocodingResult): string {
  const parts = [geo.name];
  if (geo.state) parts.push(geo.state);
  if (geo.country) parts.push(geo.country);
  return parts.join(", ");
}

// ─────────────────────────────────────────────
// Current weather
// ─────────────────────────────────────────────

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<CurrentWeather> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY is not set");

  const res = await axios.get(`${BASE_URL}/data/2.5/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric", // Celsius; frontend can convert to °F
    },
  });

  return res.data as CurrentWeather;
}

// ─────────────────────────────────────────────
// 5-day / 3-hour forecast
// ─────────────────────────────────────────────

export async function getForecast(
  lat: number,
  lon: number
): Promise<ForecastResponse> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY is not set");

  const res = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      cnt: 40, // 5 days × 8 intervals per day
    },
  });

  return res.data as ForecastResponse;
}

// ─────────────────────────────────────────────
// Air Quality Index
// ─────────────────────────────────────────────

export async function getAirQuality(
  lat: number,
  lon: number
): Promise<AirQualityData | null> {
  if (!API_KEY) return null;

  try {
    const res = await axios.get(`${BASE_URL}/data/2.5/air_pollution`, {
      params: { lat, lon, appid: API_KEY },
    });

    const item = res.data?.list?.[0];
    if (!item) return null;

    return {
      aqi: item.main.aqi,
      components: {
        co: item.components.co,
        no2: item.components.no2,
        o3: item.components.o3,
        pm2_5: item.components.pm2_5,
        pm10: item.components.pm10,
      },
    };
  } catch {
    // AQI is non-critical — fail silently
    return null;
  }
}

// ─────────────────────────────────────────────
// Historical weather (date range)
// Uses the timemachine endpoint (One Call API 3.0)
// Falls back to forecast data for future dates
// ─────────────────────────────────────────────

export interface DailyTemperature {
  date: string; // ISO date string
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  description: string;
  icon: string;
}

export async function getTemperatureForDateRange(
  lat: number,
  lon: number,
  startDate: Date,
  endDate: Date
): Promise<DailyTemperature[]> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY is not set");

  const now = new Date();
  const results: DailyTemperature[] = [];

  // Generate array of dates between start and end (inclusive)
  const dates: Date[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const date of dates) {
    const isHistorical = date < now;

    if (isHistorical) {
      // Historical: use timemachine endpoint
      const dt = Math.floor(date.getTime() / 1000);
      try {
        const res = await axios.get(`${BASE_URL}/data/3.0/onecall/timemachine`, {
          params: { lat, lon, dt, appid: API_KEY, units: "metric" },
        });

        const daily = res.data?.data?.[0];
        if (daily) {
          results.push({
            date: date.toISOString().split("T")[0],
            tempMin: daily.temp,
            tempMax: daily.temp,
            tempAvg: daily.temp,
            description: daily.weather?.[0]?.description ?? "",
            icon: daily.weather?.[0]?.icon ?? "01d",
          });
        }
      } catch {
        // Skip days that fail (API limits, etc.)
      }
    } else {
      // Future: pull from 5-day forecast and match the date
      try {
        const res = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
          params: { lat, lon, appid: API_KEY, units: "metric", cnt: 40 },
        });

        const items = res.data?.list ?? [];
        const dateStr = date.toISOString().split("T")[0];
        const matching = items.filter((item: { dt_txt: string }) =>
          item.dt_txt.startsWith(dateStr)
        );

        if (matching.length > 0) {
          const temps = matching.map((i: { main: { temp: number } }) => i.main.temp);
          const tempMin = Math.min(...temps);
          const tempMax = Math.max(...temps);
          const tempAvg = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
          const mid = matching[Math.floor(matching.length / 2)];

          results.push({
            date: dateStr,
            tempMin,
            tempMax,
            tempAvg: Math.round(tempAvg * 10) / 10,
            description: mid.weather?.[0]?.description ?? "",
            icon: mid.weather?.[0]?.icon ?? "01d",
          });
        }
      } catch {
        // Skip
      }
    }
  }

  return results;
}
