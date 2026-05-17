import { NextRequest, NextResponse } from "next/server";
import { getUVIndex, getPollenData, getEnrichedAirQuality } from "@/lib/openmeteo";

/**
 * GET /api/enrichment?lat=<number>&lon=<number>
 *
 * Returns enriched environmental data for a location:
 * - UV index (current + today's max)
 * - Pollen levels (6 types)
 * - Enriched air quality (European AQI, US AQI, PM2.5, PM10, NO2, O3)
 *
 * Uses Open-Meteo API — 100% free, no API key required.
 * All three calls run in parallel and fail silently individually.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  const lat = parseFloat(latStr ?? "");
  const lon = parseFloat(lonStr ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Valid lat and lon parameters are required." },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Coordinates out of range." },
      { status: 400 }
    );
  }

  // All three run in parallel — individual failures return null
  const [uvData, pollenData, airQuality] = await Promise.all([
    getUVIndex(lat, lon),
    getPollenData(lat, lon),
    getEnrichedAirQuality(lat, lon),
  ]);

  return NextResponse.json({ uvData, pollenData, airQuality });
}
