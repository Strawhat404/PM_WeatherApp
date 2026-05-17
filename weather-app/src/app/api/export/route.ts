import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stringify } from "csv-stringify/sync";

/**
 * GET /api/export?format=json|csv
 *
 * Exports all saved weather searches from the database.
 * Supported formats: json, csv
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() ?? "json";

  if (!["json", "csv"].includes(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use 'json' or 'csv'." },
      { status: 400 }
    );
  }

  try {
    const searches = await prisma.weatherSearch.findMany({
      orderBy: { createdAt: "desc" },
    });

    // ── JSON export ──────────────────────────────
    if (format === "json") {
      const json = JSON.stringify(searches, null, 2);
      return new NextResponse(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="weather-searches-${Date.now()}.json"`,
        },
      });
    }

    // ── CSV export ───────────────────────────────
    const rows = searches.map((s) => {
      // Flatten the nested weatherData JSON into readable columns
      const weather = s.weatherData as Record<string, unknown> | null;
      const main = weather?.main as Record<string, unknown> | undefined;
      const wind = weather?.wind as Record<string, unknown> | undefined;
      const weatherArr = weather?.weather as Array<Record<string, unknown>> | undefined;

      return {
        id: s.id,
        location_input: s.locationInput,
        resolved_location: s.resolvedLocation,
        latitude: s.latitude,
        longitude: s.longitude,
        date_range_start: s.dateRangeStart?.toISOString() ?? "",
        date_range_end: s.dateRangeEnd?.toISOString() ?? "",
        temperature_c: main?.temp ?? "",
        feels_like_c: main?.feels_like ?? "",
        temp_min_c: main?.temp_min ?? "",
        temp_max_c: main?.temp_max ?? "",
        humidity_pct: main?.humidity ?? "",
        wind_speed_ms: wind?.speed ?? "",
        weather_description: weatherArr?.[0]?.description ?? "",
        created_at: s.createdAt.toISOString(),
        updated_at: s.updatedAt.toISOString(),
      };
    });

    const csv = stringify(rows, { header: true });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="weather-searches-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data." },
      { status: 500 }
    );
  }
}
