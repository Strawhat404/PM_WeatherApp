"use client";

import { useState } from "react";
import type { YouTubeVideo } from "@/types/weather";
import YouTubeModal from "./YouTubeModal";

interface YouTubePanelProps {
  videos: YouTubeVideo[];
  location: string;
  loading: boolean;
}

export default function YouTubePanel({
  videos,
  location,
  loading,
}: YouTubePanelProps) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Videos of {location}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <>
      <div className="w-full">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Videos of {location}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              aria-label={`Watch: ${video.title}`}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-24 w-full object-cover transition group-hover:scale-105"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                    ▶
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium text-gray-800 dark:text-gray-100">
                  {video.title}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                  {video.channelTitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Embed modal */}
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
