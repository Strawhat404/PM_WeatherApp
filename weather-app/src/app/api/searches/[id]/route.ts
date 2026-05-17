import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodeLocation, formatLocation } from "@/lib/openweather";
import { validateId, validateLocation, validateDateRange } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/searches/[id]
 * READ — returns a single saved search by ID
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const idError = validateId(id);
  if (idError) {
    return NextResponse.json({ error: idError }, { status: 400 });
  }

  try {
    const search = await prisma.weatherSearch.findUnique({ where: { id } });
    if (!search) {
      return NextResponse.json({ error: "Search not found." }, { status: 404 });
    }
    return NextResponse.json({ search });
  } catch (error) {
    console.error("[GET /api/searches/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve search." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/searches/[id]
 * UPDATE — allows updating the location input and/or date range.
 * Re-geocodes if location changes. Weather data is refreshed on update.
 *
 * Body: { location?: string, dateRangeStart?: string, dateRangeEnd?: string }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const idError = validateId(id);
  if (idError) {
    return NextResponse.json({ error: idError }, { status: 400 });
  }

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

  // At least one field must be provided
  if (!location && !dateRangeStart && !dateRangeEnd) {
    return NextResponse.json(
      { error: "Provide at least one field to update: location, dateRangeStart, or dateRangeEnd." },
      { status: 400 }
    );
  }

  // Validate location if provided
  if (location) {
    const locationError = validateLocation(location);
    if (locationError) {
      return NextResponse.json({ error: locationError }, { status: 400 });
    }
  }

  // Validate date range if provided
  if (dateRangeStart || dateRangeEnd) {
    const dateError = validateDateRange(dateRangeStart, dateRangeEnd);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }
  }

  try {
    // Check record exists
    const existing = await prisma.weatherSearch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Search not found." }, { status: 404 });
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};

    if (location) {
      const geo = await geocodeLocation(location);
      updateData.locationInput = location.trim();
      updateData.resolvedLocation = formatLocation(geo);
      updateData.latitude = geo.lat;
      updateData.longitude = geo.lon;
    }

    if (dateRangeStart !== undefined) {
      updateData.dateRangeStart = dateRangeStart ? new Date(dateRangeStart) : null;
    }
    if (dateRangeEnd !== undefined) {
      updateData.dateRangeEnd = dateRangeEnd ? new Date(dateRangeEnd) : null;
    }

    const updated = await prisma.weatherSearch.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ search: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update search";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[PUT /api/searches/[id]] Error:", message);
    return NextResponse.json(
      { error: "Failed to update search. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/searches/[id]
 * DELETE — removes a saved search from the database
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const idError = validateId(id);
  if (idError) {
    return NextResponse.json({ error: idError }, { status: 400 });
  }

  try {
    const existing = await prisma.weatherSearch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Search not found." }, { status: 404 });
    }

    await prisma.weatherSearch.delete({ where: { id } });
    return NextResponse.json({ message: "Search deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/searches/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete search." },
      { status: 500 }
    );
  }
}
