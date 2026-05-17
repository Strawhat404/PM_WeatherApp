"use client";

import { useEffect } from "react";

interface YouTubeModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export default function YouTubeModal({
  videoId,
  title,
  onClose,
}: YouTubeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white focus:outline-none"
          aria-label="Close video"
        >
          ✕ Close
        </button>

        {/* 16:9 responsive embed */}
        <div className="relative w-full overflow-hidden rounded-xl pb-[56.25%] shadow-2xl">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className="mt-3 text-center text-sm text-white/80">{title}</p>
      </div>
    </div>
  );
}
