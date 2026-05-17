import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  geocodeLocation,
  formatLocation,
  getCurrentWeather,
  getForecast,
  getAirQuality,
} from "@/lib/openweather";
import { validateLocation, validateDateRange } from "@/lib/validation";

/**
 * GET /api/searches
 * READ — returns all saved weather searches (most recent first)
 */
export async function GET() {
  try {
    const searches = await prisma.weatherSearch.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ searches });
  } catch (error) {
    console.error("[GET /api/searches] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve saved searches." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/searches
 * CREATE — geocode + fetch weather for a location (+ optional date range),
 * then persist to the database.
 *
 * Body: { location: string, dateRangeStart?: string, dateRangeEnd?: string }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { location, dateRangeStart, dateRangeEnd } = body as {
    location?: string;
    dateRangeStart?: string;
    dateRangeEnd?: string;
  };

  // Validate location
  const locationError = validateLocation(location);
  if (locationError) {
    return NextResponse.json({ error: locationError }, { status: 400 });
  }

  // Validate date range if provided
  if (dateRangeStart || dateRangeEnd) {
    const dateError = validateDateRange(dateRangeStart, dateRangeEnd);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }
  }

  try {
    // Geocode + fetch weather in parallel
    const geo = await geocodeLocation(location!);
    const resolvedLocation = formatLocation(geo);

    const [current, forecast, airQuality] = await Promise.all([
      getCurrentWeather(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon),
      getAirQuality(geo.lat, geo.lon),
    ]);

    // Persist to database
    const saved = await prisma.weatherSearch.create({
      data: {
        locationInput: location!.trim(),
        resolvedLocation,
        latitude: geo.lat,
        longitude: geo.lon,
        dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : null,
        dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : null,
        weatherData: JSON.parse(JSON.stringify(current)),
        forecastData: JSON.parse(JSON.stringify(forecast)),
        // Prisma requires JsonNull sentinel for nullable JSON fields
        airQualityData: airQuality
          ? JSON.parse(JSON.stringify(airQuality))
          : undefined,
      },
    });

    return NextResponse.json({ search: saved }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save search";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[POST /api/searches] Error:", message);
    return NextResponse.json(
      { error: "Failed to save search. Please try again." },
      { status: 500 }
    );
  }
}
