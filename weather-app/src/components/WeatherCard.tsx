"use client";

import Image from "next/image";
import type { CurrentWeather, AirQualityData } from "@/types/weather";

interface WeatherCardProps {
  weather: CurrentWeather;
  airQuality: AirQualityData | null;
  resolvedLocation: string;
  onSave: () => void;
  saving: boolean;
}

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Good", color: "text-emerald-400" },
  2: { label: "Fair", color: "text-yellow-400" },
  3: { label: "Moderate", color: "text-orange-400" },
  4: { label: "Poor", color: "text-red-400" },
  5: { label: "Very Poor", color: "text-purple-400" },
};

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function formatTime(unix: number, timezone: number): string {
  const date = new Date((unix + timezone) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getHumidityComfort(humidity: number): string {
  if (humidity < 30) return "Dry";
  if (humidity <= 60) return "Comfortable";
  if (humidity <= 70) return "Humid";
  return "Very Humid";
}

export default function WeatherCard({
  weather,
  airQuality,
  resolvedLocation,
  onSave,
  saving,
}: WeatherCardProps) {
  const tempC = Math.round(weather.main.temp);
  const tempF = celsiusToFahrenheit(weather.main.temp);
  const feelsC = Math.round(weather.main.feels_like);
  const feelsF = celsiusToFahrenheit(weather.main.feels_like);
  const icon = weather.weather[0]?.icon ?? "01d";
  const description = weather.weather[0]?.description ?? "";
  const aqi = airQuality ? AQI_LABELS[airQuality.aqi] : null;

  return (
    <div className="glass rounded-2xl p-6">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{resolvedLocation}</h2>
          <p className="mt-1 capitalize text-slate-400">{description}</p>
        </div>
        <Image
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          width={72}
          height={72}
          className="drop-shadow-lg"
        />
      </div>

      {/* Temperature */}
      <div className="mt-4 flex items-end gap-4">
        <span className="text-7xl font-thin text-white">{tempC}°C</span>
        <span className="mb-2 text-2xl text-slate-400">{tempF}°F</span>
      </div>
      <p className="text-sm text-slate-400">
        Feels like {feelsC}°C / {feelsF}°F
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Humidity" value={`${weather.main.humidity}%`} sub={getHumidityComfort(weather.main.humidity)} />
        <Stat label="Wind" value={`${weather.wind.speed} m/s`} sub={`${weather.wind.deg}°`} />
        <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
        <Stat
          label="Visibility"
          value={
            weather.visibility >= 1000
              ? `${(weather.visibility / 1000).toFixed(1)} km`
              : `${weather.visibility} m`
          }
        />
      </div>

      {/* Sunrise / Sunset */}
      <div className="mt-4 flex gap-6 text-sm text-slate-400">
        <span>Sunrise {formatTime(weather.sys.sunrise, weather.timezone)}</span>
        <span>Sunset {formatTime(weather.sys.sunset, weather.timezone)}</span>
      </div>

      {/* Air Quality */}
      {aqi && (
        <div className="mt-3 text-sm text-slate-400">
          Air Quality:{" "}
          <span className={`font-semibold ${aqi.color}`}>{aqi.label}</span>
          {airQuality && (
            <span className="ml-3 text-slate-500">
              PM2.5: {airQuality.components.pm2_5.toFixed(1)} · PM10: {airQuality.components.pm10.toFixed(1)}
            </span>
          )}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save Search"}
      </button>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
