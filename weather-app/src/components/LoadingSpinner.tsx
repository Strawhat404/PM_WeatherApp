"use client";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading…",
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-12"
      role="status"
      aria-label={message}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
