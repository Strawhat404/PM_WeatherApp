"use client";

import { useState, useEffect, useCallback } from "react";
import type { CurrentWeather, AirQualityData } from "@/types/weather";

interface AISummaryProps {
  weather: CurrentWeather;
  airQuality: AirQualityData | null;
  location: string;
}

export default function AISummary({ weather, airQuality, location }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(false);
    setSummary(null);

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, airQuality, location }),
      });

      const json = await res.json();

      if (json.summary) {
        setSummary(json.summary);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [weather, airQuality, location]);

  // Auto-fetch when component mounts
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="glass rounded-2xl p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
            <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">AI Weather Summary</h3>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-400">
            Gemini
          </span>
        </div>
        {!loading && (
          <button
            onClick={fetchSummary}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
            aria-label="Regenerate summary"
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-violet-400"
                style={{
                  animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-slate-400">Generating AI summary...</p>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); opacity: 0.4; }
              50% { transform: translateY(-6px); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {!loading && summary && (
        <p className="text-sm leading-relaxed text-slate-300">{summary}</p>
      )}

      {!loading && error && (
        <p className="text-sm text-slate-500">
          AI summary unavailable.{" "}
          <button onClick={fetchSummary} className="text-violet-400 hover:underline">
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
