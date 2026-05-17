"use client";

import { useEffect, useRef } from "react";

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

/**
 * Leaflet map showing the searched location pin.
 * Uses OpenStreetMap tiles — 100% free, no API key needed.
 * Loaded dynamically to avoid SSR issues with Leaflet.
 */
export default function WeatherMap({
  latitude,
  longitude,
  locationName,
}: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Store map instance to avoid re-initializing on re-renders
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import Leaflet (client-only)
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Remove existing map instance if location changed
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView([latitude, longitude], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>${locationName}</strong>`)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, locationName]);

  return (
    <div className="w-full">
      <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
        Location Map
      </h3>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="h-64 w-full rounded-xl border border-gray-200 shadow-sm dark:border-gray-700 sm:h-80"
        aria-label={`Map showing ${locationName}`}
        role="img"
      />
    </div>
  );
}
