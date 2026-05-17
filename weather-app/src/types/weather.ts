// ─────────────────────────────────────────────
// OpenWeatherMap API response types
// ─────────────────────────────────────────────

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  sys: { country: string; sunrise: number; sunset: number };
  name: string;
  dt: number;
  timezone: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number; deg: number };
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
    timezone: number;
  };
}

// ─────────────────────────────────────────────
// Air Quality types
// ─────────────────────────────────────────────

export interface AirQualityData {
  aqi: number; // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
  components: {
    co: number;
    no2: number;
    o3: number;
    pm2_5: number;
    pm10: number;
  };
}

// ─────────────────────────────────────────────
// App-level combined weather response
// ─────────────────────────────────────────────

export interface WeatherSearchResult {
  current: CurrentWeather;
  forecast: ForecastResponse;
  airQuality: AirQualityData | null;
  resolvedLocation: string;
  latitude: number;
  longitude: number;
}

// ─────────────────────────────────────────────
// Database record type (from Prisma)
// ─────────────────────────────────────────────

export interface SavedSearch {
  id: string;
  locationInput: string;
  resolvedLocation: string;
  latitude: number;
  longitude: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  weatherData: CurrentWeather;
  forecastData: ForecastResponse | null;
  airQualityData: AirQualityData | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// YouTube video type
// ─────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

// ─────────────────────────────────────────────
// API error response
// ─────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: string;
}
