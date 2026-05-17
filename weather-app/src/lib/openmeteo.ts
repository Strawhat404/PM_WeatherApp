import axios from "axios";

/**
 * Open-Meteo API client
 * 100% free, no API key required.
 * Docs: https://open-meteo.com/en/docs
 */

const BASE_URL = "https://api.open-meteo.com/v1";

export interface UVData {
  uvIndex: number;
  uvIndexMax: number;
  uvLabel: string;
  uvColor: string;
}

export interface PollenData {
  alder: number | null;
  birch: number | null;
  grass: number | null;
  mugwort: number | null;
  olive: number | null;
  ragweed: number | null;
  dominantPollen: string;
  level: "Low" | "Moderate" | "High" | "Very High";
  levelColor: string;
}

export interface AirQualityEnriched {
  europeanAqi: number | null;
  usAqi: number | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  label: string;
  color: string;
}

// ─────────────────────────────────────────────
// UV Index (current + today's max)
// ─────────────────────────────────────────────

export async function getUVIndex(
  lat: number,
  lon: number
): Promise<UVData | null> {
  try {
    const res = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "uv_index",
        daily: "uv_index_max",
        timezone: "auto",
        forecast_days: 1,
      },
    });

    const uvIndex = res.data?.current?.uv_index ?? 0;
    const uvIndexMax = res.data?.daily?.uv_index_max?.[0] ?? uvIndex;

    return {
      uvIndex: Math.round(uvIndex * 10) / 10,
      uvIndexMax: Math.round(uvIndexMax * 10) / 10,
      uvLabel: getUVLabel(uvIndex),
      uvColor: getUVColor(uvIndex),
    };
  } catch {
    return null;
  }
}

function getUVLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function getUVColor(uv: number): string {
  if (uv <= 2) return "text-green-600";
  if (uv <= 5) return "text-yellow-500";
  if (uv <= 7) return "text-orange-500";
  if (uv <= 10) return "text-red-500";
  return "text-purple-600";
}

// ─────────────────────────────────────────────
// Pollen data (European Air Quality API)
// ─────────────────────────────────────────────

export async function getPollenData(
  lat: number,
  lon: number
): Promise<PollenData | null> {
  try {
    const res = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          "alder_pollen",
          "birch_pollen",
          "grass_pollen",
          "mugwort_pollen",
          "olive_pollen",
          "ragweed_pollen",
        ].join(","),
        timezone: "auto",
      },
    });

    const current = res.data?.current;
    if (!current) return null;

    const pollens: Record<string, number | null> = {
      Alder: current.alder_pollen ?? null,
      Birch: current.birch_pollen ?? null,
      Grass: current.grass_pollen ?? null,
      Mugwort: current.mugwort_pollen ?? null,
      Olive: current.olive_pollen ?? null,
      Ragweed: current.ragweed_pollen ?? null,
    };

    // Find dominant pollen type
    let maxVal = 0;
    let dominant = "None";
    for (const [name, val] of Object.entries(pollens)) {
      if (val !== null && val > maxVal) {
        maxVal = val;
        dominant = name;
      }
    }

    const level = getPollenLevel(maxVal);

    return {
      alder: pollens.Alder,
      birch: pollens.Birch,
      grass: pollens.Grass,
      mugwort: pollens.Mugwort,
      olive: pollens.Olive,
      ragweed: pollens.Ragweed,
      dominantPollen: dominant,
      level: level.label,
      levelColor: level.color,
    };
  } catch {
    return null;
  }
}

function getPollenLevel(value: number): { label: "Low" | "Moderate" | "High" | "Very High"; color: string } {
  if (value <= 10) return { label: "Low", color: "text-green-600" };
  if (value <= 30) return { label: "Moderate", color: "text-yellow-500" };
  if (value <= 80) return { label: "High", color: "text-orange-500" };
  return { label: "Very High", color: "text-red-600" };
}

// ─────────────────────────────────────────────
// Enriched Air Quality (Open-Meteo AQ API)
// ─────────────────────────────────────────────

export async function getEnrichedAirQuality(
  lat: number,
  lon: number
): Promise<AirQualityEnriched | null> {
  try {
    const res = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
      params: {
        latitude: lat,
        longitude: lon,
        current: "european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
        timezone: "auto",
      },
    });

    const current = res.data?.current;
    if (!current) return null;

    const europeanAqi = current.european_aqi ?? null;
    const label = getEuropeanAQILabel(europeanAqi);

    return {
      europeanAqi,
      usAqi: current.us_aqi ?? null,
      pm25: current.pm2_5 ?? null,
      pm10: current.pm10 ?? null,
      no2: current.nitrogen_dioxide ?? null,
      o3: current.ozone ?? null,
      label: label.text,
      color: label.color,
    };
  } catch {
    return null;
  }
}

function getEuropeanAQILabel(aqi: number | null): { text: string; color: string } {
  if (aqi === null) return { text: "Unknown", color: "text-gray-500" };
  if (aqi <= 20) return { text: "Good", color: "text-green-600" };
  if (aqi <= 40) return { text: "Fair", color: "text-yellow-500" };
  if (aqi <= 60) return { text: "Moderate", color: "text-orange-500" };
  if (aqi <= 80) return { text: "Poor", color: "text-red-500" };
  if (aqi <= 100) return { text: "Very Poor", color: "text-purple-600" };
  return { text: "Extremely Poor", color: "text-red-900" };
}
