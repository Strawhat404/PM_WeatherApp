#!/bin/sh
# ─────────────────────────────────────────────
# WeatherApp — one-time setup script
# Run this once before `docker compose up --build`
# ─────────────────────────────────────────────

set -e

echo ""
echo "WeatherApp Setup"
echo "────────────────────────────────────────"

# Check Docker is installed
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed."
  echo "Install it from https://docs.docker.com/get-docker/ and try again."
  exit 1
fi

# Check Docker Compose is available
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose is not available."
  echo "Make sure you have Docker Desktop or Docker Compose v2 installed."
  exit 1
fi

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
else
  echo ".env already exists — skipping"
fi

echo ""
echo "Next steps:"
echo "  1. Open weather-app/.env and fill in your API keys:"
echo "     - OPENWEATHER_API_KEY  (get free key at openweathermap.org)"
echo "     - YOUTUBE_API_KEY      (get free key at console.cloud.google.com)"
echo ""
echo "  2. Run the app:"
echo "     docker compose up --build"
echo ""
echo "  3. Open http://localhost:3000"
echo ""
