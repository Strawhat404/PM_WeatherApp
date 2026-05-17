import { NextRequest, NextResponse } from "next/server";
import {
  geocodeLocation,
  formatLocation,
  getTemperatureForDateRange,
} from "@/lib/openweather";
import { validateLocation, validateDateRange } from "@/lib/validation";

/**
 * GET /api/weather/range?location=<string>&start=<ISO date>&end=<ISO date>
 *
 * Returns daily temperature data for a location over a date range.
 * Used by the CRUD "Create" flow to store historical/forecast data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Validate inputs
  const locationError = validateLocation(location);
  if (locationError) {
    return NextResponse.json({ error: locationError }, { status: 400 });
  }

  const dateError = validateDateRange(start, end);
  if (dateError) {
    return NextResponse.json({ error: dateError }, { status: 400 });
  }

  try {
    const geo = await geocodeLocation(location!);
    const resolvedLocation = formatLocation(geo);

    const temperatures = await getTemperatureForDateRange(
      geo.lat,
      geo.lon,
      new Date(start!),
      new Date(end!)
    );

    if (temperatures.length === 0) {
      return NextResponse.json(
        { error: "No temperature data available for the specified date range." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      resolvedLocation,
      latitude: geo.lat,
      longitude: geo.lon,
      dateRangeStart: start,
      dateRangeEnd: end,
      temperatures,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch weather data";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[/api/weather/range] Error:", message);
    return NextResponse.json(
      { error: "Failed to fetch weather data for the date range." },
      { status: 500 }
    );
  }
}
