"use client";

import { useState } from "react";
import type { YouTubeVideo } from "@/types/weather";
import YouTubeModal from "./YouTubeModal";

interface YouTubePanelProps {
  videos: YouTubeVideo[];
  location: string;
  loading: boolean;
}

export default function YouTubePanel({ videos, location, loading }: YouTubePanelProps) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Explore {location}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  const [featured, ...rest] = videos;

  return (
    <>
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Explore {location}
          </h3>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            YouTube
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Featured card — spans 2 columns on large screens */}
          <button
            onClick={() => setActiveVideo(featured)}
            className="group relative col-span-1 overflow-hidden rounded-xl sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            aria-label={`Watch: ${featured.title}`}
          >
            <div className="relative aspect-video overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/40">
                  <svg className="ml-1 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="line-clamp-2 text-left text-sm font-semibold text-white">
                  {featured.title}
                </p>
                <p className="mt-1 text-left text-xs text-slate-300">{featured.channelTitle}</p>
              </div>
            </div>
          </button>

          {/* Remaining 3 cards */}
          {rest.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              aria-label={`Watch: ${video.title}`}
            >
              <div className="relative aspect-video overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/40">
                    <svg className="ml-0.5 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="line-clamp-2 text-left text-xs font-medium text-white">
                    {video.title}
                  </p>
                  <p className="mt-0.5 truncate text-left text-xs text-slate-400">
                    {video.channelTitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <YouTubeModal
          videoId={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
