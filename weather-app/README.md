# 🌤️ WeatherApp — PM Accelerator Full Stack Assessment

A full-stack weather application built with **Next.js 14**, **PostgreSQL**, and **Docker**.  
Covers both Tech Assessment #1 (Frontend) and Tech Assessment #2 (Backend).

Built by **Your Name** · [PM Accelerator](https://www.linkedin.com/company/product-manager-accelerator)

---

## Features

### Frontend (Assessment #1)
- Search by city, zip code, GPS coordinates, or landmark
- Current weather with temperature (°C / °F), humidity, wind, pressure, visibility
- 5-day forecast with daily summaries
- Geolocation — detect current location via browser
- Interactive Leaflet map (OpenStreetMap, no API key needed)
- YouTube video panel with in-page embed modal
- Responsive design — works on desktop, tablet, and mobile
- Graceful error handling with user-friendly messages

### Backend (Assessment #2)
- RESTful API built with Next.js API routes
- Full CRUD on saved searches (PostgreSQL via Prisma)
- Date range temperature queries with validation
- Data export to **JSON** and **CSV**
- Input validation and sanitization on all endpoints

### Enrichment (Bonus)
- UV index, pollen levels, and enriched air quality via **Open-Meteo** (free, no key)
- Non-obvious weather insights: wind chill, heat index, AQI alerts, pollen warnings, golden hour
- Severity-ranked insights panel (info / warning / danger)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Styling | Tailwind CSS 3 |
| Map | Leaflet + OpenStreetMap |
| Weather API | OpenWeatherMap (free tier) |
| Enrichment API | Open-Meteo (free, no key) |
| Video API | YouTube Data API v3 (free tier) |
| HTTP client | Axios |
| Export | csv-stringify |
| Containerization | Docker + Docker Compose |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- An [OpenWeatherMap API key](https://openweathermap.org/api) (free tier)
- A [YouTube Data API v3 key](https://console.cloud.google.com/) (free tier, optional)

---

## Quick Start (Docker — Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd weather-app

# 2. Set up environment variables
cp .env.example .env
# Edit .env and fill in your API keys:
#   OPENWEATHER_API_KEY=your_key_here
#   YOUTUBE_API_KEY=your_key_here  (optional)

# 3. Start everything
docker compose up --build

# App is now running at http://localhost:3000
```

That's it. Docker Compose starts PostgreSQL, runs Prisma migrations automatically, then starts the Next.js app.

To stop:
```bash
docker compose down
```

To stop and remove all data:
```bash
docker compose down -v
```

---

## Local Development (Without Docker)

Requires Node.js 20+ and a running PostgreSQL instance.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL connection string

# 3. Generate Prisma client and run migrations
npm run db:generate
npm run db:push

# 4. Start the development server
npm run dev
```

App runs at `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `OPENWEATHER_API_KEY` | ✅ | [OpenWeatherMap](https://openweathermap.org/api) free tier key |
| `YOUTUBE_API_KEY` | ⚠️ Optional | [YouTube Data API v3](https://console.cloud.google.com/) key. Videos panel hidden if not set. |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Public URL of the app (default: `http://localhost:3000`) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather?location=` | Current weather + 5-day forecast + AQI |
| GET | `/api/weather/range?location=&start=&end=` | Daily temperatures for a date range |
| GET | `/api/searches` | List all saved searches |
| POST | `/api/searches` | Save a new search to the database |
| GET | `/api/searches/:id` | Get a single saved search |
| PUT | `/api/searches/:id` | Update a saved search |
| DELETE | `/api/searches/:id` | Delete a saved search |
| GET | `/api/youtube?location=` | YouTube videos for a location |
| GET | `/api/export?format=json\|csv` | Export all saved searches |
| GET | `/api/enrichment?lat=&lon=` | UV index, pollen, enriched AQI |
| GET | `/api/health` | Health check (used by Docker) |

---

## Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── history/page.tsx      # Search history page
│   │   └── api/                  # API routes
│   │       ├── weather/          # Current weather + range
│   │       ├── searches/         # CRUD operations
│   │       ├── youtube/          # YouTube videos
│   │       ├── export/           # JSON + CSV export
│   │       ├── enrichment/       # UV, pollen, AQI
│   │       └── health/           # Health check
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # API clients + utilities
│   └── types/                    # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # SQL migrations
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Full stack orchestration
└── .env.example                  # Environment variable template
```

---

## npm Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema to DB (dev only)
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## Assessments Completed

- ✅ **Tech Assessment #1** — Frontend (React/Next.js, responsive design, API integration)
- ✅ **Tech Assessment #2** — Backend (CRUD, RESTful API, PostgreSQL, data export)
