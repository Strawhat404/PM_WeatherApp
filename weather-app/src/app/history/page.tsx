"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SavedSearch } from "@/types/weather";
import { useSearches } from "@/hooks/useSearches";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import PMAcceleratorBanner from "@/components/PMAcceleratorBanner";

export default function HistoryPage() {
  const {
    searches,
    loading,
    error,
    deleting,
    updating,
    fetchAll,
    update,
    remove,
    clearError,
  } = useSearches();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"createdAt" | "resolvedLocation">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Sorting & filtering ───────────────────────────────────────────────────
  const displayed = [...searches]
    .filter((s) =>
      filterText
        ? s.resolvedLocation.toLowerCase().includes(filterText.toLowerCase()) ||
          s.locationInput.toLowerCase().includes(filterText.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const valA = sortField === "createdAt" ? a.createdAt : a.resolvedLocation;
      const valB = sortField === "createdAt" ? b.createdAt : b.resolvedLocation;
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // ── Edit handlers ─────────────────────────────────────────────────────────
  const startEdit = (s: SavedSearch) => {
    setEditingId(s.id);
    setEditLocation(s.locationInput);
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
    const ok = await update(id, { location: editLocation.trim() });
    if (ok) cancelEdit();
    else setEditError("Failed to update. Please try again.");
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this search record?")) return;
    await remove(id);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/export?format=${format}`, "_blank");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            ← 🌤️ WeatherApp
          </Link>
          <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Search History
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searches.length} saved search{searches.length !== 1 ? "es" : ""}
            </p>
            {/* Filter */}
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by location…"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Filter searches"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("json")}
              disabled={searches.length === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              ⬇ JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={searches.length === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              ⬇ CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={clearError} />
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

        {/* No filter results */}
        {!loading && searches.length > 0 && displayed.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-400">
            No results match &quot;{filterText}&quot;
          </p>
        )}

        {/* Table */}
        {!loading && displayed.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Location Input
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300"
                    onClick={() => toggleSort("resolvedLocation")}
                  >
                    Resolved <SortIcon field="resolvedLocation" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Temp
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Conditions
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Date Range
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Saved <SortIcon field="createdAt" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayed.map((s) => {
                  const weather = s.weatherData as unknown as Record<string, unknown> | null;
                  const main = weather?.main as Record<string, unknown> | undefined;
                  const weatherArr = weather?.weather as Array<Record<string, unknown>> | undefined;
                  const temp = main?.temp != null ? `${Math.round(main.temp as number)}°C` : "—";
                  const description = (weatherArr?.[0]?.description as string) ?? "—";
                  const isEditing = editingId === s.id;
                  const isDeleting = deleting === s.id;
                  const isUpdating = updating === s.id;

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
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdate(s.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              aria-label="Edit location"
                              autoFocus
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

                      {/* Resolved */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {s.resolvedLocation}
                      </td>

                      {/* Temp */}
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        {temp}
                      </td>

                      {/* Conditions */}
                      <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">
                        {description}
                      </td>

                      {/* Date range */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {s.dateRangeStart && s.dateRangeEnd ? (
                          <>
                            {new Date(s.dateRangeStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" → "}
                            {new Date(s.dateRangeEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
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
                              disabled={isUpdating}
                              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {isUpdating ? "Saving…" : "Save"}
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
                              disabled={isDeleting}
                              className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              aria-label={`Delete ${s.locationInput}`}
                            >
                              {isDeleting ? "…" : "🗑 Delete"}
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
