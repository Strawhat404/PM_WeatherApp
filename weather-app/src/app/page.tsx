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

  const { create, saving: dbSaving } = useSearches();
  const {
    data: enrichment,
    loading: enrichmentLoading,
    fetch: fetchEnrichment,
    clear: clearEnrichment,
  } = useEnrichment();

  const handleSave = () => {
    if (data) saveSearch(data.current.name);
  };

  const handleRangeSearch = async (
    location: string,
    start: string,
    end: string
  ) => {
    await create(location, start, end);
  };

  // Fetch enrichment data whenever weather data changes
  const handleSearch = (location: string) => {
    clearEnrichment();
    search(location);
  };

  const handleGeolocate = () => {
    clearEnrichment();
    geolocate();
  };

  // Trigger enrichment fetch when weather data arrives
  if (data && !enrichment && !enrichmentLoading) {
    fetchEnrichment(data.latitude, data.longitude);
  }

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
            onSearch={handleSearch}
            onGeolocate={handleGeolocate}
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

            {/* Date range temperature query */}
            <DateRangeSearch
              onSearch={handleRangeSearch}
              loading={dbSaving}
            />

            {/* Non-obvious insights with enrichment data */}
            <InsightsPanel
              weather={data}
              enrichment={enrichment}
              enrichmentLoading={enrichmentLoading}
            />
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

