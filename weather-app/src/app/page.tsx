"use client";

import dynamic from "next/dynamic";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastStrip from "@/components/ForecastStrip";
import YouTubePanel from "@/components/YouTubePanel";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import PMAcceleratorBanner from "@/components/PMAcceleratorBanner";
import Link from "next/link";

// Leaflet must be loaded client-side only (no SSR)
const WeatherMap = dynamic(() => import("@/components/WeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 sm:h-80" />
  ),
});

export default function HomePage() {
  const {
    data,
    videos,
    loading,
    videosLoading,
    error,
    saving,
    saveSuccess,
    search,
    geolocate,
    saveSearch,
    clearError,
  } = useWeather();

  const handleSave = () => {
    if (data) saveSearch(data.current.name);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🌤️ WeatherApp
          </h1>
          <Link
            href="/history"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            📋 Search History
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Search */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Real-Time Weather
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Search any city, zip code, coordinates, or landmark
            </p>
          </div>

          <SearchBar
            onSearch={search}
            onGeolocate={geolocate}
            loading={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} onDismiss={clearError} />
          </div>
        )}

        {/* Save success toast */}
        {saveSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          >
            ✅ Search saved to history!
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8">
            <LoadingSpinner message="Fetching weather data…" />
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <div className="mt-8 flex flex-col gap-6">
            {/* Current weather */}
            <WeatherCard
              weather={data.current}
              airQuality={data.airQuality}
              resolvedLocation={data.resolvedLocation}
              onSave={handleSave}
              saving={saving}
            />

            {/* 5-day forecast */}
            <ForecastStrip forecast={data.forecast} />

            {/* Map + YouTube side by side on large screens */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <WeatherMap
                latitude={data.latitude}
                longitude={data.longitude}
                locationName={data.resolvedLocation}
              />
              <YouTubePanel
                videos={videos}
                location={data.resolvedLocation}
                loading={videosLoading}
              />
            </div>

            {/* Non-obvious insights */}
            <InsightsPanel weather={data} />
          </div>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
          <div className="mt-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-6xl">🌍</p>
            <p className="mt-4 text-lg">Search a location to see the weather</p>
            <p className="mt-1 text-sm">
              Try &quot;New York&quot;, &quot;10001&quot;, or &quot;48.8566,2.3522&quot;
            </p>
          </div>
        )}
      </main>

      <PMAcceleratorBanner />
    </div>
  );
}

// ─────────────────────────────────────────────
// Non-obvious insights panel
// ─────────────────────────────────────────────
import type { WeatherSearchResult } from "@/types/weather";

function InsightsPanel({ weather }: { weather: WeatherSearchResult }) {
  const { current, airQuality } = weather;
  const insights: string[] = [];

  // UV index insight (not in free current weather, but we can infer from time/clouds)
  const cloudCover = current.clouds.all;
  if (cloudCover < 20) {
    insights.push("☀️ Clear skies — UV exposure may be high. Consider sunscreen if outdoors.");
  }

  // Wind chill / heat index
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const windSpeed = current.wind.speed;

  if (temp < 10 && windSpeed > 5) {
    const windChill = Math.round(
      13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed * 3.6, 0.16) +
      0.3965 * temp * Math.pow(windSpeed * 3.6, 0.16)
    );
    insights.push(`🥶 Wind chill makes it feel like ${windChill}°C — dress warmer than the temperature suggests.`);
  }

  if (temp > 27 && humidity > 60) {
    insights.push("🥵 High heat and humidity — risk of heat exhaustion. Stay hydrated and avoid prolonged sun exposure.");
  }

  // Humidity comfort
  if (humidity > 80) {
    insights.push("💧 Very high humidity — sweat won't evaporate efficiently, making it feel hotter.");
  } else if (humidity < 20) {
    insights.push("🏜️ Very low humidity — dry air can cause skin irritation and dehydration. Drink extra water.");
  }

  // Visibility
  if (current.visibility < 1000) {
    insights.push("🌫️ Very low visibility (under 1km) — dangerous driving conditions. Use fog lights.");
  } else if (current.visibility < 5000) {
    insights.push("🌁 Reduced visibility — take care if driving or cycling.");
  }

  // Air quality
  if (airQuality && airQuality.aqi >= 4) {
    insights.push("😷 Poor air quality — consider wearing a mask outdoors, especially if you have respiratory conditions.");
  }

  // Sunrise/sunset travel tip
  const now = Math.floor(Date.now() / 1000);
  const minutesToSunset = Math.round((current.sys.sunset - now) / 60);
  if (minutesToSunset > 0 && minutesToSunset < 60) {
    insights.push(`🌅 Sunset in about ${minutesToSunset} minutes — great time for golden hour photos!`);
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <h3 className="mb-3 font-semibold text-amber-800 dark:text-amber-200">
        💡 Things to Consider
      </h3>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="text-sm text-amber-700 dark:text-amber-300">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
