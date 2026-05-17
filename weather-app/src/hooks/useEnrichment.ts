"use client";

import { useState, useCallback } from "react";
import type { EnrichmentData } from "@/types/weather";

interface EnrichmentState {
  data: EnrichmentData | null;
  loading: boolean;
}

export function useEnrichment() {
  const [state, setState] = useState<EnrichmentState>({
    data: null,
    loading: false,
  });

  const fetch = useCallback(async (lat: number, lon: number) => {
    setState({ data: null, loading: true });
    try {
      const res = await window.fetch(
        `/api/enrichment?lat=${lat}&lon=${lon}`
      );
      if (!res.ok) {
        setState({ data: null, loading: false });
        return;
      }
      const json: EnrichmentData = await res.json();
      setState({ data: json, loading: false });
    } catch {
      // Enrichment is non-critical — fail silently
      setState({ data: null, loading: false });
    }
  }, []);

  const clear = useCallback(() => {
    setState({ data: null, loading: false });
  }, []);

  return { ...state, fetch, clear };
}
