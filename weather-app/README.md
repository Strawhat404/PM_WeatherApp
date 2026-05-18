# WeatherApp — PM Accelerator Full Stack Technical Assessment

A full-stack weather application built with Next.js 14, PostgreSQL, and Docker.
Covers both Tech Assessment #1 (Frontend) and Tech Assessment #2 (Backend).

Built by **Your Name**

Product Manager Accelerator is the world's first AI-powered product management career accelerator. We help aspiring and experienced PMs land top product roles through structured mentorship, real-world projects, and a global community of product leaders.
[LinkedIn](https://www.linkedin.com/company/product-manager-accelerator)

---

## Assessments Completed

- Tech Assessment #1 — Frontend (Next.js, responsive design, geolocation, API integration)
- Tech Assessment #2 — Backend (CRUD, RESTful API, PostgreSQL, data export)

---

## Features

### Frontend
- Search by city name, zip code, GPS coordinates, or landmark
- Current weather: temperature in Celsius and Fahrenheit, feels like, humidity, wind speed, pressure, visibility
- 5-day forecast with daily summaries
- Geolocation support — detect current location via browser
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

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- An [OpenWeatherMap API key](https://openweathermap.org/api) — free tier, sign up takes 2 minutes
- A [YouTube Data API v3 key](https://console.cloud.google.com/) — free tier, optional

---

## Quick Start (Docker — Recommended)

This is the easiest way to run the project. No need to install Node.js, PostgreSQL, or any other dependencies locally.

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd weather-app

# 2. Set up environment variables
cp .env.example .env
```

Open `.env` and fill in your API keys:

```
OPENWEATHER_API_KEY=your_openweathermap_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

```bash
# 3. Build and start everything
docker compose up --build
```

The app will be available at **http://localhost:3000**

Docker Compose starts three services in order:
1. PostgreSQL database
2. Prisma migration runner (applies the schema automatically)
3. Next.js application

To stop the app:
```bash
docker compose down
```

To stop and remove all stored data:
```bash
docker compose down -v
```

---

## Local Development (Without Docker)

Requires Node.js 20 or higher and a running PostgreSQL instance.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL to your local PostgreSQL connection string

# 3. Generate Prisma client and push the schema
npm run db:generate
npm run db:push

# 4. Start the development server
npm run dev
```

App runs at **http://localhost:3000**

---

## Environment Variables

| Variable                | Required | Description                                                                 |
|-------------------------|----------|-----------------------------------------------------------------------------|
| `DATABASE_URL`          | Yes      | PostgreSQL connection string                                                |
| `OPENWEATHER_API_KEY`   | Yes      | OpenWeatherMap free tier key — [get one here](https://openweathermap.org/api) |
| `YOUTUBE_API_KEY`       | Optional | YouTube Data API v3 key — videos panel is hidden if not set                |
| `NEXT_PUBLIC_APP_URL`   | Optional | Public URL of the app (defaults to http://localhost:3000)                  |

---

## API Reference

| Method | Endpoint                                        | Description                                      |
|--------|-------------------------------------------------|--------------------------------------------------|
| GET    | `/api/weather?location=`                        | Current weather, 5-day forecast, and AQI         |
| GET    | `/api/weather/range?location=&start=&end=`      | Daily temperatures for a date range              |
| GET    | `/api/searches`                                 | List all saved searches                          |
| POST   | `/api/searches`                                 | Save a new search to the database                |
| GET    | `/api/searches/:id`                             | Get a single saved search by ID                  |
| PUT    | `/api/searches/:id`                             | Update a saved search                            |
| DELETE | `/api/searches/:id`                             | Delete a saved search                            |
| GET    | `/api/youtube?location=`                        | YouTube videos for a location                    |
| GET    | `/api/export?format=json` or `format=csv`       | Export all saved searches as JSON or CSV         |
| GET    | `/api/enrichment?lat=&lon=`                     | UV index, pollen levels, enriched air quality    |
| GET    | `/api/health`                                   | Health check — verifies app and database status  |

---

## Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home page
│   │   ├── history/page.tsx          # Search history page
│   │   └── api/                      # API routes
│   │       ├── weather/              # Current weather + date range
│   │       ├── searches/             # CRUD operations
│   │       ├── youtube/              # YouTube video search
│   │       ├── export/               # JSON and CSV export
│   │       ├── enrichment/           # UV, pollen, enriched AQI
│   │       └── health/               # Health check endpoint
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

## npm Scripts

| Script              | Description                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Start development server with hot reload         |
| `npm run build`     | Build the application for production             |
| `npm run start`     | Start the production server                      |
| `npm run lint`      | Run ESLint                                       |
| `npm run db:generate` | Generate Prisma client from schema             |
| `npm run db:migrate`  | Run pending database migrations                |
| `npm run db:push`     | Push schema changes to database (dev only)     |
| `npm run db:studio`   | Open Prisma Studio — visual database browser   |

---

## Libraries and Packages

A full list of installed packages is in `package.json`. Key dependencies:

```
npm install
```

All packages will be installed automatically. No additional setup required beyond filling in the `.env` file.
