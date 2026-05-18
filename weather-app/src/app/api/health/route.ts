import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health
 *
 * Health check endpoint used by Docker Compose.
 * Verifies the app is running and the DB is reachable.
 */
export async function GET() {
  try {
    // Lightweight DB ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "unreachable",
      },
      { status: 503 }
    );
  }
}
