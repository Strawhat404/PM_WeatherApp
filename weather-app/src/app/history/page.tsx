"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SavedSearch } from "@/types/weather";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import PMAcceleratorBanner from "@/components/PMAcceleratorBanner";

export default function HistoryPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchSearches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/searches");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load history.");
      setSearches(json.searches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this search record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/searches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to delete.");
        return;
      }
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (search: SavedSearch) => {
    setEditingId(search.id);
    setEditLocation(search.locationInput);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLocation("");
    setEditError(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editLocation.trim()) {
      setEditError("Location cannot be empty.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/searches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: editLocation.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setEditError(json.error ?? "Failed to update.");
        return;
      }
      setSearches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...json.search } : s))
      );
      cancelEdit();
    } catch {
      setEditError("Failed to update. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/export?format=${format}`, "_blank");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            ← 🌤️ WeatherApp
          </Link>
          <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Search History
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Actions bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searches.length} saved search{searches.length !== 1 ? "es" : ""}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("json")}
              disabled={searches.length === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              ⬇ Export JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={searches.length === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner message="Loading search history…" />}

        {/* Empty state */}
        {!loading && searches.length === 0 && !error && (
          <div className="mt-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-5xl">📭</p>
            <p className="mt-4 text-lg">No saved searches yet</p>
            <p className="mt-1 text-sm">
              Search for a location and click &quot;Save Search&quot; to see it here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go Search
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && searches.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Resolved</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Temp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Conditions</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Saved</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {searches.map((s) => {
                  const weather = s.weatherData as unknown as Record<string, unknown> | null;
                  const main = weather?.main as Record<string, unknown> | undefined;
                  const weatherArr = weather?.weather as Array<Record<string, unknown>> | undefined;
                  const temp = main?.temp != null ? `${Math.round(main.temp as number)}°C` : "—";
                  const description = (weatherArr?.[0]?.description as string) ?? "—";
                  const isEditing = editingId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      {/* Location input */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              aria-label="Edit location"
                            />
                            {editError && (
                              <p className="text-xs text-red-500">{editError}</p>
                            )}
                          </div>
                        ) : (
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {s.locationInput}
                          </span>
                        )}
                      </td>

                      {/* Resolved location */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {s.resolvedLocation}
                      </td>

                      {/* Temperature */}
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        {temp}
                      </td>

                      {/* Conditions */}
                      <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">
                        {description}
                      </td>

                      {/* Saved at */}
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(s.id)}
                              disabled={editSaving}
                              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {editSaving ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                              aria-label={`Edit ${s.locationInput}`}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              aria-label={`Delete ${s.locationInput}`}
                            >
                              {deletingId === s.id ? "…" : "🗑 Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <PMAcceleratorBanner />
    </div>
  );
}
