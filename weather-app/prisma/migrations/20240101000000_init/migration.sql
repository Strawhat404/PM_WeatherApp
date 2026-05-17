-- CreateTable
CREATE TABLE "WeatherSearch" (
    "id" TEXT NOT NULL,
    "locationInput" TEXT NOT NULL,
    "resolvedLocation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "dateRangeStart" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3),
    "weatherData" JSONB NOT NULL,
    "forecastData" JSONB,
    "airQualityData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherSearch_locationInput_idx" ON "WeatherSearch"("locationInput");

-- CreateIndex
CREATE INDEX "WeatherSearch_createdAt_idx" ON "WeatherSearch"("createdAt");
