"use client";

import { useState, useCallback } from "react";
import type { WeatherSearchResult, YouTubeVideo } from "@/types/weather";

interface WeatherState {
  data: WeatherSearchResult | null;
  videos: YouTubeVideo[];
  loading: boolean;
  videosLoading: boolean;
  error: string | null;
  saving: boolean;
  saveSuccess: boolean;
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    videos: [],
    loading: false,
    videosLoading: false,
    error: null,
    saving: false,
    saveSuccess: false,
  });

  const search = useCallback(async (location: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      saveSuccess: false,
      videos: [],
    }));

    try {
      const res = await fetch(
        `/api/weather?location=${encodeURIComponent(location)}`
      );
      const json = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: json.error ?? "Failed to fetch weather data.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        data: json,
        loading: false,
        error: null,
      }));

      // Use the resolved location name for a more precise YouTube search
      fetchVideos(json.resolvedLocation ?? location);
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Network error. Please check your connection and try again.",
      }));
    }
  }, []);

  const fetchVideos = useCallback(async (location: string) => {
    setState((prev) => ({ ...prev, videosLoading: true }));
    try {
      const res = await fetch(
        `/api/youtube?location=${encodeURIComponent(location)}`
      );
      const json = await res.json();
      setState((prev) => ({
        ...prev,
        videos: json.videos ?? [],
        videosLoading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, videosLoading: false }));
    }
  }, []);

  const geolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        search(`${latitude},${longitude}`);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location access denied. Please allow location access in your browser settings.",
          2: "Unable to determine your location. Please try searching manually.",
          3: "Location request timed out. Please try again.",
        };
        setState((prev) => ({
          ...prev,
          loading: false,
          error: messages[err.code] ?? "Failed to get your location.",
        }));
      },
      { timeout: 10000 }
    );
  }, [search]);

  const saveSearch = useCallback(
    async (location: string) => {
      if (!state.data) return;

      setState((prev) => ({ ...prev, saving: true, saveSuccess: false }));

      try {
        const res = await fetch("/api/searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location }),
        });

        if (!res.ok) {
          const json = await res.json();
          setState((prev) => ({
            ...prev,
            saving: false,
            error: json.error ?? "Failed to save search.",
          }));
          return;
        }

        setState((prev) => ({ ...prev, saving: false, saveSuccess: true }));

        // Auto-clear success message after 3s
        setTimeout(() => {
          setState((prev) => ({ ...prev, saveSuccess: false }));
        }, 3000);
      } catch {
        setState((prev) => ({
          ...prev,
          saving: false,
          error: "Failed to save search. Please try again.",
        }));
      }
    },
    [state.data]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    search,
    geolocate,
    saveSearch,
    clearError,
  };
}
