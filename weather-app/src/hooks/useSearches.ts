"use client";

import { useState, useCallback } from "react";
import type { SavedSearch } from "@/types/weather";

interface SearchesState {
  searches: SavedSearch[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  deleting: string | null;
  updating: string | null;
}

export function useSearches() {
  const [state, setState] = useState<SearchesState>({
    searches: [],
    loading: false,
    error: null,
    saving: false,
    deleting: null,
    updating: null,
  });

  // ── READ ALL ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/searches");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load searches.");
      setState((prev) => ({ ...prev, searches: json.searches, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load searches.",
      }));
    }
  }, []);

  // ── CREATE ────────────────────────────────────────────────────────────────
  const create = useCallback(
    async (
      location: string,
      dateRangeStart?: string,
      dateRangeEnd?: string
    ): Promise<SavedSearch | null> => {
      setState((prev) => ({ ...prev, saving: true, error: null }));
      try {
        const res = await fetch("/api/searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location, dateRangeStart, dateRangeEnd }),
        });
        const json = await res.json();
        if (!res.ok) {
          setState((prev) => ({
            ...prev,
            saving: false,
            error: json.error ?? "Failed to save search.",
          }));
          return null;
        }
        const newSearch = json.search as SavedSearch;
        setState((prev) => ({
          ...prev,
          saving: false,
          searches: [newSearch, ...prev.searches],
        }));
        return newSearch;
      } catch {
        setState((prev) => ({
          ...prev,
          saving: false,
          error: "Network error. Failed to save search.",
        }));
        return null;
      }
    },
    []
  );

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const update = useCallback(
    async (
      id: string,
      fields: { location?: string; dateRangeStart?: string; dateRangeEnd?: string }
    ): Promise<boolean> => {
      setState((prev) => ({ ...prev, updating: id, error: null }));
      try {
        const res = await fetch(`/api/searches/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        const json = await res.json();
        if (!res.ok) {
          setState((prev) => ({
            ...prev,
            updating: null,
            error: json.error ?? "Failed to update search.",
          }));
          return false;
        }
        setState((prev) => ({
          ...prev,
          updating: null,
          searches: prev.searches.map((s) =>
            s.id === id ? { ...s, ...json.search } : s
          ),
        }));
        return true;
      } catch {
        setState((prev) => ({
          ...prev,
          updating: null,
          error: "Network error. Failed to update search.",
        }));
        return false;
      }
    },
    []
  );

  // ── DELETE ────────────────────────────────────────────────────────────────
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, deleting: id, error: null }));
    try {
      const res = await fetch(`/api/searches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setState((prev) => ({
          ...prev,
          deleting: null,
          error: json.error ?? "Failed to delete search.",
        }));
        return false;
      }
      setState((prev) => ({
        ...prev,
        deleting: null,
        searches: prev.searches.filter((s) => s.id !== id),
      }));
      return true;
    } catch {
      setState((prev) => ({
        ...prev,
        deleting: null,
        error: "Network error. Failed to delete search.",
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchAll,
    create,
    update,
    remove,
    clearError,
  };
}
