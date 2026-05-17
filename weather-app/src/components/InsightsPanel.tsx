"use client";

import type { WeatherSearchResult, EnrichmentData } from "@/types/weather";

interface InsightsPanelProps {
  weather: WeatherSearchResult;
  enrichment: EnrichmentData | null;
  enrichmentLoading: boolean;
}

interface Insight {
  emoji: string;
  text: string;
  severity: "info" | "warning" | "danger";
}

export default function InsightsPanel({
  weather,
  enrichment,
  enrichmentLoading,
}: InsightsPanelProps) {
  const { current, airQuality } = weather;
  const insights: Insight[] = [];

  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const windSpeed = current.wind.speed;
  const cloudCover = current.clouds.all;
  const now = Math.floor(Date.now() / 1000);

  // ── UV Index (from enrichment) ──────────────────────────────────────────
  if (enrichment?.uvData) {
    const { uvIndex, uvIndexMax, uvLabel, uvColor: _ } = enrichment.uvData;
    if (uvIndex >= 6) {
      insights.push({
        emoji: "☀️",
        text: `UV index is ${uvIndex} (${uvLabel}) — today's max is ${uvIndexMax}. Apply SPF 30+ sunscreen and seek shade between 10am–4pm.`,
        severity: uvIndex >= 8 ? "danger" : "warning",
      });
    } else if (uvIndex >= 3) {
      insights.push({
        emoji: "🕶️",
        text: `UV index is ${uvIndex} (${uvLabel}). Sunglasses recommended for extended outdoor time.`,
        severity: "info",
      });
    }
  } else if (cloudCover < 20 && !enrichmentLoading) {
    // Fallback when enrichment unavailable
    insights.push({
      emoji: "☀️",
      text: "Clear skies — UV exposure may be elevated. Consider sunscreen if outdoors for extended periods.",
      severity: "info",
    });
  }

  // ── Wind chill ──────────────────────────────────────────────────────────
  if (temp < 10 && windSpeed > 5) {
    const windChill = Math.round(
      13.12 +
        0.6215 * temp -
        11.37 * Math.pow(windSpeed * 3.6, 0.16) +
        0.3965 * temp * Math.pow(windSpeed * 3.6, 0.16)
    );
    insights.push({
      emoji: "🥶",
      text: `Wind chill makes it feel like ${windChill}°C — dress warmer than the thermometer suggests. Exposed skin can be at risk.`,
      severity: windChill < 0 ? "danger" : "warning",
    });
  }

  // ── Heat index ──────────────────────────────────────────────────────────
  if (temp > 27 && humidity > 60) {
    const heatIndex = Math.round(
      -8.78469475556 +
        1.61139411 * temp +
        2.33854883889 * humidity -
        0.14611605 * temp * humidity -
        0.012308094 * temp * temp -
        0.0164248277778 * humidity * humidity +
        0.002211732 * temp * temp * humidity +
        0.00072546 * temp * humidity * humidity -
        0.000003582 * temp * temp * humidity * humidity
    );
    insights.push({
      emoji: "🥵",
      text: `Heat index is ~${heatIndex}°C. High heat + humidity increases risk of heat exhaustion. Stay hydrated and limit strenuous activity.`,
      severity: heatIndex > 40 ? "danger" : "warning",
    });
  }

  // ── Humidity ────────────────────────────────────────────────────────────
  if (humidity > 85) {
    insights.push({
      emoji: "💧",
      text: "Very high humidity — sweat evaporates slowly, making it feel significantly hotter. Mold and mildew risk indoors.",
      severity: "warning",
    });
  } else if (humidity < 20) {
    insights.push({
      emoji: "🏜️",
      text: "Very low humidity — dry air can cause skin irritation, chapped lips, and dehydration. Drink extra water.",
      severity: "info",
    });
  }

  // ── Visibility ──────────────────────────────────────────────────────────
  if (current.visibility < 200) {
    insights.push({
      emoji: "🌫️",
      text: "Extremely low visibility (under 200m) — avoid driving if possible. Dense fog or heavy precipitation.",
      severity: "danger",
    });
  } else if (current.visibility < 1000) {
    insights.push({
      emoji: "🌫️",
      text: "Very low visibility (under 1km) — use fog lights when driving and increase following distance.",
      severity: "warning",
    });
  } else if (current.visibility < 5000) {
    insights.push({
      emoji: "🌁",
      text: "Reduced visibility — take extra care if driving or cycling.",
      severity: "info",
    });
  }

  // ── Wind ────────────────────────────────────────────────────────────────
  if (windSpeed > 17) {
    insights.push({
      emoji: "💨",
      text: `Strong winds at ${windSpeed} m/s — risk of falling objects and difficult driving conditions for high-sided vehicles.`,
      severity: "danger",
    });
  } else if (windSpeed > 10) {
    insights.push({
      emoji: "🌬️",
      text: `Moderate winds at ${windSpeed} m/s — secure loose outdoor items and be cautious on exposed routes.`,
      severity: "warning",
    });
  }

  // ── Air quality (OpenWeatherMap) ────────────────────────────────────────
  if (airQuality && airQuality.aqi >= 4) {
    insights.push({
      emoji: "😷",
      text: `Poor air quality (AQI ${airQuality.aqi}/5) — wear a mask outdoors. Sensitive groups (asthma, heart conditions) should stay indoors.`,
      severity: "danger",
    });
  } else if (airQuality && airQuality.aqi === 3) {
    insights.push({
      emoji: "😮‍💨",
      text: "Moderate air quality — sensitive individuals may experience mild symptoms. Limit prolonged outdoor exertion.",
      severity: "warning",
    });
  }

  // ── Enriched air quality (Open-Meteo) ──────────────────────────────────
  if (enrichment?.airQuality?.europeanAqi && enrichment.airQuality.europeanAqi > 60) {
    const aq = enrichment.airQuality;
    insights.push({
      emoji: "🏭",
      text: `European AQI: ${aq.europeanAqi} (${aq.label})${aq.pm25 ? ` · PM2.5: ${aq.pm25.toFixed(1)} µg/m³` : ""}${aq.no2 ? ` · NO₂: ${aq.no2.toFixed(1)} µg/m³` : ""}`,
      severity: (aq.europeanAqi ?? 0) > 80 ? "danger" : "warning",
    });
  }

  // ── Pollen ──────────────────────────────────────────────────────────────
  if (enrichment?.pollenData && enrichment.pollenData.level !== "Low") {
    const p = enrichment.pollenData;
    insights.push({
      emoji: "🌿",
      text: `${p.level} ${p.dominantPollen} pollen levels — allergy sufferers should take antihistamines before going outdoors and keep windows closed.`,
      severity: p.level === "Very High" ? "danger" : "warning",
    });
  }

  // ── Sunrise/sunset ──────────────────────────────────────────────────────
  const minutesToSunset = Math.round((current.sys.sunset - now) / 60);
  const minutesToSunrise = Math.round((current.sys.sunrise - now) / 60);

  if (minutesToSunset > 0 && minutesToSunset < 45) {
    insights.push({
      emoji: "🌅",
      text: `Sunset in ~${minutesToSunset} minutes — golden hour for photography. Temperatures will drop soon after.`,
      severity: "info",
    });
  } else if (minutesToSunrise > 0 && minutesToSunrise < 45) {
    insights.push({
      emoji: "🌄",
      text: `Sunrise in ~${minutesToSunrise} minutes — temperatures are at their lowest right now.`,
      severity: "info",
    });
  }

  // ── Night driving ───────────────────────────────────────────────────────
  if (now > current.sys.sunset || now < current.sys.sunrise) {
    if (current.visibility < 5000) {
      insights.push({
        emoji: "🌙",
        text: "Night-time with reduced visibility — use full headlights and reduce speed.",
        severity: "warning",
      });
    }
  }

  // ── Travel tip ──────────────────────────────────────────────────────────
  const weatherId = current.weather[0]?.id ?? 800;
  if (weatherId >= 200 && weatherId < 300) {
    insights.push({
      emoji: "⛈️",
      text: "Thunderstorm in the area — avoid open fields, tall trees, and water. Seek shelter indoors.",
      severity: "danger",
    });
  } else if (weatherId >= 600 && weatherId < 700) {
    insights.push({
      emoji: "❄️",
      text: "Snow conditions — allow extra travel time, use winter tyres if available, and watch for black ice.",
      severity: "warning",
    });
  } else if (weatherId >= 300 && weatherId < 400) {
    insights.push({
      emoji: "🌧️",
      text: "Drizzle conditions — roads may be slippery. Cyclists and pedestrians should wear high-visibility clothing.",
      severity: "info",
    });
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          ✅ Conditions look good — no significant weather concerns right now.
        </p>
      </div>
    );
  }

  const severityStyles = {
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
    danger: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  };

  const textStyles = {
    info: "text-blue-700 dark:text-blue-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-red-700 dark:text-red-300",
  };

  const headerStyles = {
    info: "text-blue-800 dark:text-blue-200",
    warning: "text-amber-800 dark:text-amber-200",
    danger: "text-red-800 dark:text-red-200",
  };

  // Group by severity for visual hierarchy
  const dangers = insights.filter((i) => i.severity === "danger");
  const warnings = insights.filter((i) => i.severity === "warning");
  const infos = insights.filter((i) => i.severity === "info");
  const ordered = [...dangers, ...warnings, ...infos];

  const topSeverity = dangers.length > 0 ? "danger" : warnings.length > 0 ? "warning" : "info";

  return (
    <div className={`rounded-xl border p-4 ${severityStyles[topSeverity]}`}>
      <h3 className={`mb-3 font-semibold ${headerStyles[topSeverity]}`}>
        💡 Things to Consider
        {enrichmentLoading && (
          <span className="ml-2 text-xs font-normal opacity-60">
            (loading more data…)
          </span>
        )}
      </h3>
      <ul className="space-y-2">
        {ordered.map((insight, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 text-sm ${textStyles[insight.severity]}`}
          >
            <span className="mt-0.5 shrink-0">{insight.emoji}</span>
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
