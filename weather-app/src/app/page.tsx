"use client";

import dynamic from "next/dynamic";
import { useWeather } from "@/hooks/useWeather";
import { useSearches } from "@/hooks/useSearches";
import { useEnrichment } from "@/hooks/useEnrichment";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastStrip from "@/components/ForecastStrip";
import YouTubePanel from "@/components/YouTubePanel";
import DateRangeSearch from "@/components/DateRangeSearch";
import InsightsPanel from "@/components/InsightsPanel";
import AISummary from "@/components/AISummary";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import PMAcceleratorBanner from "@/components/PMAcceleratorBanner";
import WeatherBackground from "@/components/WeatherBackground";
import Link from "next/link";

const WeatherMap = dynamic(() => import("@/components/WeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-2xl bg-white/5 sm:h-80" />
  ),
});

export default function HomePage() {
  // Single useWeather instance — all state and actions from one hook
  const {
    data,
    videos,
    loading,
    videosLoading,
    error,
    saving,
    saveSuccess,
    clearError,
    saveSearch,
    search,
    geolocate,
  } = useWeather();

  const { create, saving: dbSaving } = useSearches();
  const {
    data: enrichment,
    loading: enrichmentLoading,
    fetch: fetchEnrichment,
    clear: clearEnrichment,
  } = useEnrichment();

  const handleSearch = (location: string) => {
    clearEnrichment();
    search(location);
  };

  const handleGeolocate = () => {
    clearEnrichment();
    geolocate();
  };

  const handleSave = () => {
    if (data) saveSearch(data.current.name);
  };

  const handleRangeSearch = async (location: string, start: string, end: string) => {
    await create(location, start, end);
  };

  // Fetch enrichment once weather data arrives
  if (data && !enrichment && !enrichmentLoading) {
    fetchEnrichment(data.latitude, data.longitude);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <WeatherBackground />

      {/* Nav */}
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 text-lg font-bold">
              W
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              WeatherApp
            </span>
          </div>
          <Link
            href="/history"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Search History
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">

        {/* Hero */}
        <div className="mb-10 flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-400">
            Real-time weather data powered by OpenWeatherMap
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Weather,{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              anywhere.
            </span>
          </h1>
          <p className="max-w-md text-slate-400">
            Search any city, zip code, GPS coordinates, or landmark. Get current
            conditions, forecasts, air quality, and more.
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              onGeolocate={handleGeolocate}
              loading={loading}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={clearError} />
          </div>
        )}

        {/* Save success */}
        {saveSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
          >
            Search saved to history.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8">
            <LoadingSpinner message="Fetching weather data..." />
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <div className="flex flex-col gap-5">
            <WeatherCard
              weather={data.current}
              airQuality={data.airQuality}
              resolvedLocation={data.resolvedLocation}
              onSave={handleSave}
              saving={saving}
            />

            {/* AI Summary */}
            <AISummary
              weather={data.current}
              airQuality={data.airQuality}
              location={data.resolvedLocation}
            />
            <ForecastStrip forecast={data.forecast} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <WeatherMap
                latitude={data.latitude}
                longitude={data.longitude}
                locationName={data.resolvedLocation}
              />
            </div>
            <YouTubePanel
              videos={videos}
              location={data.resolvedLocation}
              loading={videosLoading}
            />
            <DateRangeSearch onSearch={handleRangeSearch} loading={dbSaving} />
            <InsightsPanel
              weather={data}
              enrichment={enrichment}
              enrichmentLoading={enrichmentLoading}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Current Weather", desc: "Temperature, humidity, wind, pressure" },
              { label: "5-Day Forecast", desc: "Daily highs, lows, and conditions" },
              { label: "Air Quality", desc: "AQI, PM2.5, pollen levels, UV index" },
              { label: "Location Map", desc: "Interactive map with OpenStreetMap" },
            ].map((feature) => (
              <div key={feature.label} className="glass rounded-2xl p-5">
                <p className="text-sm font-semibold text-white">{feature.label}</p>
                <p className="mt-1 text-xs text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <PMAcceleratorBanner />
    </div>
  );
}
