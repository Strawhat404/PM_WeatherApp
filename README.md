# WeatherApp — PM Accelerator Full Stack Technical Assessment

A full-stack weather application built with Next.js 14, PostgreSQL, and Docker.
Covers both Tech Assessment #1 (Frontend) and Tech Assessment #2 (Backend).

Built by **Yoseph Tesfaye** · [PM Accelerator](https://www.linkedin.com/company/product-manager-accelerator)

---

## Assessments Completed

- Tech Assessment #1 — Frontend (Next.js, responsive design, geolocation, API integration)
- Tech Assessment #2 — Backend (CRUD, RESTful API, PostgreSQL, data export)

---

## Features

### Frontend
- Search by city name, zip code, GPS coordinates, or landmark
- Current weather: temperature in Celsius and Fahrenheit, feels like, humidity, wind, pressure, visibility
- 5-day forecast with daily summaries
- Geolocation — detect current location via browser
- Interactive map powered by Leaflet and OpenStreetMap (no API key required)
- YouTube video panel with in-page embed modal
- Non-obvious weather insights: wind chill, heat index, UV index, pollen levels, air quality alerts
- Responsive layout — works on desktop, tablet, and mobile
- Graceful error handling with user-friendly messages

### Backend
- RESTful API built with Next.js API routes
- Full CRUD on saved weather searches stored in PostgreSQL
- Date range temperature queries with input validation
- Data export to JSON and CSV
- Input sanitization on all endpoints

### Enrichment (Bonus)
- UV index and pollen data via Open-Meteo API (free, no API key required)
- Enriched air quality: European AQI, US AQI, PM2.5, PM10, NO2, O3
- Severity-ranked insights panel (info, warning, danger)

---

## Tech Stack

| Layer              | Technology                        |
|--------------------|-----------------------------------|
| Frontend + Backend | Next.js 14 (App Router)           |
| Database           | PostgreSQL 16                     |
| ORM                | Prisma 5                          |
| Styling            | Tailwind CSS 3                    |
| Map                | Leaflet + OpenStreetMap           |
| Weather API        | OpenWeatherMap (free tier)        |
| Enrichment API     | Open-Meteo (free, no key needed)  |
| Video API          | YouTube Data API v3 (free tier)   |
| HTTP Client        | Axios                             |
| Export             | csv-stringify                     |
| Containerization   | Docker + Docker Compose           |

---

## Prerequisites

The only requirement is **Docker** and **Docker Compose**. Everything else (Node.js, PostgreSQL, dependencies) is handled automatically inside the containers.

- [Install Docker](https://docs.docker.com/get-docker/)

You will also need two free API keys:

| Key | Where to get it | Free tier |
|-----|----------------|-----------|
| `OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) — sign up, key is instant | 1,000 calls/day |
| `YOUTUBE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) — enable YouTube Data API v3, create API key | 10,000 units/day |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd weather-app

# 2. Set up environment variables
cp .env.example .env
```

Open `weather-app/.env` and fill in your API keys:

```env
OPENWEATHER_API_KEY=your_openweathermap_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

```bash
# 3. Build and start everything — one command
docker compose up --build
```

The app will be available at **http://localhost:3000**

Docker Compose automatically:
1. Pulls and starts PostgreSQL
2. Runs Prisma database migrations
3. Builds and starts the Next.js application

No manual database setup, no `npm install`, no Node.js required on the host machine.

---

## Stopping the App

```bash
# Stop containers
docker compose down

# Stop and remove all data (database included)
docker compose down -v
```

---

## Environment Variables

All variables are documented in `.env.example`. Copy it to `.env` and fill in your values.

| Variable              | Required | Description |
|-----------------------|----------|-------------|
| `DATABASE_URL`        | Yes      | Set automatically by Docker Compose — do not change |
| `OPENWEATHER_API_KEY` | Yes      | Free key from openweathermap.org |
| `YOUTUBE_API_KEY`     | Yes      | Free key from Google Cloud Console (YouTube Data API v3) |
| `NEXT_PUBLIC_APP_URL` | Optional | Defaults to http://localhost:3000 |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?location=` | Current weather, 5-day forecast, and AQI |
| GET | `/api/weather/range?location=&start=&end=` | Daily temperatures for a date range |
| GET | `/api/searches` | List all saved searches |
| POST | `/api/searches` | Save a new search to the database |
| GET | `/api/searches/:id` | Get a single saved search by ID |
| PUT | `/api/searches/:id` | Update a saved search |
| DELETE | `/api/searches/:id` | Delete a saved search |
| GET | `/api/youtube?location=` | YouTube videos for a location |
| GET | `/api/export?format=json\|csv` | Export all saved searches |
| GET | `/api/enrichment?lat=&lon=` | UV index, pollen, enriched AQI |
| GET | `/api/health` | Health check endpoint |

---

## Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home page
│   │   ├── history/page.tsx          # Search history page
│   │   └── api/                      # All API routes
│   ├── components/                   # Reusable React components
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # API clients and utilities
│   └── types/                        # TypeScript type definitions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # SQL migration files
├── Dockerfile                        # Multi-stage production build
├── docker-compose.yml                # Full stack orchestration
├── .env.example                      # Environment variable template
└── README.md
```

---

## npm Scripts (for local development without Docker)

Requires Node.js 20+ and a running PostgreSQL instance.

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database (dev only) |
| `npm run db:studio` | Open Prisma Studio — visual database browser |
