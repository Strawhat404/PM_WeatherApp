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
      className="flex flex-col gap-2 sm:flex-row"
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
          placeholder="City, zip code, coordinates, or landmark..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-slate-500 backdrop-blur focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          disabled={loading}
          autoComplete="off"
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Searching..." : "Search"}
      </button>

      <button
        type="button"
        onClick={onGeolocate}
        disabled={loading}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        title="Use my current location"
        aria-label="Use my current location"
      >
        My Location
      </button>
    </form>
  );
}
