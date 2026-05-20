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
    <div className="flex min-h-screen flex-col bg-mesh">
      {/* Nav */}
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 text-lg font-bold">
              W
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">WeatherApp</span>
          </Link>
          <h1 className="text-sm font-medium text-slate-400">
            Search History
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400">
              {searches.length} saved search{searches.length !== 1 ? "es" : ""}
            </p>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by location..."
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
              aria-label="Filter searches"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("json")}
              disabled={searches.length === 0}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={searches.length === 0}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
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
          <div className="mt-16 text-center text-slate-500">
            <p className="text-5xl">📭</p>
            <p className="mt-4 text-lg text-white">No saved searches yet</p>
            <p className="mt-1 text-sm">
              Search for a location and click &quot;Save Search&quot; to see it here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-400"
            >
              Go Search
            </Link>
          </div>
        )}

        {/* No filter results */}
        {!loading && searches.length > 0 && displayed.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No results match &quot;{filterText}&quot;
          </p>
        )}

        {/* Table */}
        {!loading && displayed.length > 0 && (
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-sky-400"
                    onClick={() => toggleSort("resolvedLocation")}
                  >
                    Resolved <SortIcon field="resolvedLocation" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Temp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Conditions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date Range</th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-sky-400"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Saved <SortIcon field="createdAt" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                      className="transition hover:bg-white/5"
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
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:border-sky-500/50 focus:outline-none"
                              aria-label="Edit location"
                              autoFocus
                            />
                            {editError && (
                              <p className="text-xs text-red-400">{editError}</p>
                            )}
                          </div>
                        ) : (
                          <span className="font-medium text-white">{s.locationInput}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{s.resolvedLocation}</td>
                      <td className="px-4 py-3 font-semibold text-sky-400">{temp}</td>
                      <td className="px-4 py-3 capitalize text-slate-400">{description}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {s.dateRangeStart && s.dateRangeEnd ? (
                          <>
                            {new Date(s.dateRangeStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" → "}
                            {new Date(s.dateRangeEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(s.id)}
                              disabled={isUpdating}
                              className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-40"
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={isDeleting}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                            >
                              {isDeleting ? "..." : "Delete"}
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
