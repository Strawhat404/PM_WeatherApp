"use client";

import Image from "next/image";
import type { ForecastResponse, ForecastItem } from "@/types/weather";

interface ForecastStripProps {
  forecast: ForecastResponse;
}

interface DaySummary {
  date: string;
  label: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
}

function getDaySummaries(forecast: ForecastResponse): DaySummary[] {
  const byDate: Record<string, ForecastItem[]> = {};
  for (const item of forecast.list) {
    const date = item.dt_txt.split(" ")[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(item);
  }

  const today = new Date().toISOString().split("T")[0];

  return Object.entries(byDate)
    .filter(([date]) => date !== today)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((i) => i.main.temp);
      const tempMin = Math.round(Math.min(...temps));
      const tempMax = Math.round(Math.max(...temps));
      const midday = items.find((i) => i.dt_txt.includes("12:00")) ?? items[0];
      const d = new Date(date + "T12:00:00Z");
      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      return {
        date,
        label,
        tempMin,
        tempMax,
        icon: midday.weather[0]?.icon ?? "01d",
        description: midday.weather[0]?.description ?? "",
      };
    });
}

export default function ForecastStrip({ forecast }: ForecastStripProps) {
  const days = getDaySummaries(forecast);
  if (days.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center rounded-xl border border-white/5 bg-white/5 p-3"
          >
            <p className="text-xs font-medium text-slate-400">{day.label}</p>
            <Image
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              width={44}
              height={44}
              title={day.description}
            />
            <p className="text-sm font-semibold text-white">
              {day.tempMax}°
              <span className="ml-1 font-normal text-slate-500">{day.tempMin}°</span>
            </p>
            <p className="mt-1 text-center text-xs capitalize text-slate-500">
              {day.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
