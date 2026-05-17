"use client";

import { useState } from "react";

interface DateRangeSearchProps {
  onSearch: (location: string, start: string, end: string) => void;
  loading: boolean;
}

interface RangeResult {
  date: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  description: string;
  icon: string;
}

interface RangeResponse {
  resolvedLocation: string;
  temperatures: RangeResult[];
}

export default function DateRangeSearch({ onSearch, loading }: DateRangeSearchProps) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RangeResponse | null>(null);
  const [fetching, setFetching] = useState(false);

  // Default date range: today to +4 days
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 5);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) { setError("Location is required."); return; }
    if (!startDate) { setError("Start date is required."); return; }
    if (!endDate) { setError("End date is required."); return; }
    if (startDate > endDate) { setError("Start date must be before end date."); return; }

    setFetching(true);
    setResults(null);

    try {
      const params = new URLSearchParams({
        location: location.trim(),
        start: startDate,
        end: endDate,
      });
      const res = await fetch(`/api/weather/range?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to fetch temperature data.");
        return;
      }

      setResults(json);
      // Also notify parent to optionally save
      onSearch(location.trim(), startDate, endDate);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const isBusy = loading || fetching;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">
        📅 Temperature by Date Range
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Location */}
        <div>
          <label
            htmlFor="range-location"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Location
          </label>
          <input
            id="range-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, zip, or coordinates"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isBusy}
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="range-start"
              className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Start Date
            </label>
            <input
              id="range-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={maxDateStr}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isBusy}
            />
          </div>
          <div>
            <label
              htmlFor="range-end"
              className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              End Date
            </label>
            <input
              id="range-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              max={maxDateStr}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isBusy}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Fetching…" : "Get Temperatures"}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Results for {results.resolvedLocation}
          </p>
          <div className="space-y-2">
            {results.temperatures.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                    width={32}
                    height={32}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {new Date(day.date + "T12:00:00Z").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                      {day.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°C
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    avg {day.tempAvg}°C
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
