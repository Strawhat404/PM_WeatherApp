import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stringify } from "csv-stringify/sync";

/**
 * GET /api/export?format=json|csv
 *
 * Exports all saved weather searches from the database.
 * Supported formats:
 *   - json  → pretty-printed JSON array, Content-Disposition attachment
 *   - csv   → flat CSV with all key weather fields as columns
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() ?? "json";

  if (!["json", "csv"].includes(format)) {
    return NextResponse.json(
      { error: "Invalid format. Supported values: 'json', 'csv'." },
      { status: 400 }
    );
  }

  try {
    const searches = await prisma.weatherSearch.findMany({
      orderBy: { createdAt: "desc" },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `weather-searches-${timestamp}`;

    // ── JSON export ──────────────────────────────────────────────────────
    if (format === "json") {
      // Shape the output cleanly — strip internal Prisma types
      const output = searches.map((s) => ({
        id: s.id,
        locationInput: s.locationInput,
        resolvedLocation: s.resolvedLocation,
        latitude: s.latitude,
        longitude: s.longitude,
        dateRangeStart: s.dateRangeStart?.toISOString() ?? null,
        dateRangeEnd: s.dateRangeEnd?.toISOString() ?? null,
        weatherData: s.weatherData,
        forecastData: s.forecastData,
        airQualityData: s.airQualityData,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

      return new NextResponse(JSON.stringify(output, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // ── CSV export ───────────────────────────────────────────────────────
    const rows = searches.map((s) => {
      const weather = s.weatherData as Record<string, unknown> | null;
      const main = weather?.main as Record<string, unknown> | undefined;
      const wind = weather?.wind as Record<string, unknown> | undefined;
      const sys = weather?.sys as Record<string, unknown> | undefined;
      const weatherArr = weather?.weather as Array<Record<string, unknown>> | undefined;
      const clouds = weather?.clouds as Record<string, unknown> | undefined;
      const airQuality = s.airQualityData as Record<string, unknown> | null;

      return {
        id: s.id,
        location_input: s.locationInput,
        resolved_location: s.resolvedLocation,
        latitude: s.latitude,
        longitude: s.longitude,
        date_range_start: s.dateRangeStart?.toISOString() ?? "",
        date_range_end: s.dateRangeEnd?.toISOString() ?? "",
        // Weather fields
        temperature_c: main?.temp ?? "",
        feels_like_c: main?.feels_like ?? "",
        temp_min_c: main?.temp_min ?? "",
        temp_max_c: main?.temp_max ?? "",
        humidity_pct: main?.humidity ?? "",
        pressure_hpa: main?.pressure ?? "",
        wind_speed_ms: wind?.speed ?? "",
        wind_direction_deg: wind?.deg ?? "",
        cloud_cover_pct: clouds?.all ?? "",
        weather_main: weatherArr?.[0]?.main ?? "",
        weather_description: weatherArr?.[0]?.description ?? "",
        weather_icon: weatherArr?.[0]?.icon ?? "",
        visibility_m: weather?.visibility ?? "",
        sunrise_unix: sys?.sunrise ?? "",
        sunset_unix: sys?.sunset ?? "",
        // Air quality
        aqi: airQuality
          ? (airQuality as Record<string, unknown>).aqi ?? ""
          : "",
        pm2_5: airQuality
          ? ((airQuality as Record<string, unknown>).components as Record<string, unknown>)?.pm2_5 ?? ""
          : "",
        pm10: airQuality
          ? ((airQuality as Record<string, unknown>).components as Record<string, unknown>)?.pm10 ?? ""
          : "",
        // Metadata
        created_at: s.createdAt.toISOString(),
        updated_at: s.updatedAt.toISOString(),
      };
    });

    const csv = stringify(rows, {
      header: true,
      cast: {
        // Ensure numbers don't get quoted
        number: (value) => ({ value: String(value), quoted: false }),
      },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data. Please try again." },
      { status: 500 }
    );
  }
}
