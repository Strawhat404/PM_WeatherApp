"use client";

import { useState, useRef } from "react";

interface SearchBarProps {
  onSearch: (location: string) => void;
  onGeolocate: () => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, onGeolocate, loading }: SearchBarProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl"
      role="search"
      aria-label="Weather search"
    >
      <div className="relative flex-1">
        <label htmlFor="location-input" className="sr-only">
          Enter a location
        </label>
        <input
          id="location-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="City, zip code, coordinates, or landmark…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          disabled={loading}
          autoComplete="off"
          aria-label="Location search input"
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Search weather"
      >
        {loading ? "Searching…" : "Search"}
      </button>

      <button
        type="button"
        onClick={onGeolocate}
        disabled={loading}
        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        title="Use my current location"
        aria-label="Use my current location"
      >
        📍 My Location
      </button>
    </form>
  );
}
