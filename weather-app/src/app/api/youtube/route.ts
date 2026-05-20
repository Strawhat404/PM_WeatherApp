import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { validateLocation } from "@/lib/validation";
import type { YouTubeVideo } from "@/types/weather";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * GET /api/youtube?location=<string>
 *
 * Returns up to 4 YouTube videos related to the location.
 * Uses YouTube Data API v3 (free tier: 10,000 units/day).
 * Each search costs 100 units → ~100 searches/day free.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  const locationError = validateLocation(location);
  if (locationError) {
    return NextResponse.json({ error: locationError }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API is not configured.", videos: [] },
      { status: 503 }
    );
  }

  try {
    const res = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: {
        part: "snippet",
        q: `"${location}" travel explore city`,
        type: "video",
        maxResults: 4,
        relevanceLanguage: "en",
        safeSearch: "strict",
        key: YOUTUBE_API_KEY,
      },
    });

    const videos: YouTubeVideo[] = (res.data.items ?? []).map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          publishedAt: string;
          thumbnails: { medium: { url: string } };
        };
      }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })
    );

    return NextResponse.json({ videos });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch YouTube videos";

    // Quota exceeded
    if (message.includes("quota")) {
      return NextResponse.json(
        { error: "YouTube quota exceeded. Try again tomorrow.", videos: [] },
        { status: 429 }
      );
    }

    console.error("[/api/youtube] Error:", message);
    // Non-critical — return empty array so UI degrades gracefully
    return NextResponse.json({ videos: [] });
  }
}
