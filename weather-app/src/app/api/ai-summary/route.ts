import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CurrentWeather, AirQualityData } from "@/types/weather";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai-summary
 *
 * Sends current weather + AQI data to Gemini 1.5 Flash and returns
 * a natural language weather summary with practical insights.
 *
 * Body: { weather: CurrentWeather, airQuality: AirQualityData | null, location: string }
 */
export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API is not configured.", summary: null },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { weather, airQuality, location } = body as {
    weather: CurrentWeather;
    airQuality: AirQualityData | null;
    location: string;
  };

  if (!weather || !location) {
    return NextResponse.json(
      { error: "weather and location are required." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build a structured prompt with all available weather data
    const tempC = Math.round(weather.main.temp);
    const feelsC = Math.round(weather.main.feels_like);
    const description = weather.weather[0]?.description ?? "unknown";
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const visibility = weather.visibility;
    const cloudCover = weather.clouds.all;

    // Time context
    const now = Math.floor(Date.now() / 1000);
    const isDay = now > weather.sys.sunrise && now < weather.sys.sunset;
    const minutesToSunset = Math.round((weather.sys.sunset - now) / 60);
    const minutesToSunrise = Math.round((weather.sys.sunrise - now) / 60);

    const aqiLabels: Record<number, string> = {
      1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"
    };
    const aqiLabel = airQuality ? aqiLabels[airQuality.aqi] ?? "Unknown" : null;

    const prompt = `You are a helpful weather assistant. Based on the following real-time weather data for ${location}, write a concise, friendly, and practical weather summary in 3-4 sentences. 

Focus on:
1. What the weather actually feels like right now (not just the numbers)
2. One or two non-obvious things the person should consider (health, safety, activity, travel)
3. A brief mention of what to expect for the rest of the day

Weather data:
- Location: ${location}
- Condition: ${description}
- Temperature: ${tempC}°C (feels like ${feelsC}°C)
- Humidity: ${humidity}%
- Wind speed: ${windSpeed} m/s
- Visibility: ${visibility >= 1000 ? `${(visibility / 1000).toFixed(1)} km` : `${visibility} m`}
- Cloud cover: ${cloudCover}%
- Time of day: ${isDay ? "daytime" : "nighttime"}
${isDay && minutesToSunset > 0 && minutesToSunset < 120 ? `- Sunset in ${minutesToSunset} minutes` : ""}
${!isDay && minutesToSunrise > 0 && minutesToSunrise < 120 ? `- Sunrise in ${minutesToSunrise} minutes` : ""}
${aqiLabel ? `- Air quality: ${aqiLabel}${airQuality ? ` (PM2.5: ${airQuality.components.pm2_5.toFixed(1)} µg/m³)` : ""}` : ""}

Write in a warm, conversational tone. Do not use bullet points or headers — write in flowing prose. Keep it under 100 words.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate summary";

    // Rate limit
    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "AI summary quota exceeded. Try again later.", summary: null },
        { status: 429 }
      );
    }

    console.error("[/api/ai-summary] Error:", message);
    return NextResponse.json({ summary: null });
  }
}
