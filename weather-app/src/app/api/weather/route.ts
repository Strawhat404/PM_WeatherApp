import { NextRequest, NextResponse } from "next/server";
import {
  geocodeLocation,
  formatLocation,
  getCurrentWeather,
  getForecast,
  getAirQuality,
} from "@/lib/openweather";
import { validateLocation } from "@/lib/validation";

/**
 * GET /api/weather?location=<string>
 *
 * Returns current weather + 5-day forecast + air quality
 * for any location string (city, zip, coordinates, landmark).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  // Validate input
  const locationError = validateLocation(location);
  if (locationError) {
    return NextResponse.json({ error: locationError }, { status: 400 });
  }

  try {
    // Step 1: Geocode the location
    const geo = await geocodeLocation(location!);
    const resolvedLocation = formatLocation(geo);

    // Step 2: Fetch weather data in parallel
    const [current, forecast, airQuality] = await Promise.all([
      getCurrentWeather(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon),
      getAirQuality(geo.lat, geo.lon),
    ]);

    return NextResponse.json({
      current,
      forecast,
      airQuality,
      resolvedLocation,
      latitude: geo.lat,
      longitude: geo.lon,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch weather data";

    // Distinguish between "not found" and server errors
    if (
      message.includes("not found") ||
      message.includes("Location not found")
    ) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    // OpenWeatherMap API key issues
    if (message.includes("API_KEY")) {
      return NextResponse.json(
        { error: "Weather service is not configured. Please set OPENWEATHER_API_KEY." },
        { status: 503 }
      );
    }

    console.error("[/api/weather] Error:", message);
    return NextResponse.json(
      { error: "Failed to fetch weather data. Please try again." },
      { status: 500 }
    );
  }
}
