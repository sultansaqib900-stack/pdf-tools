"use client";

import { useState } from "react";

interface ErrorBannerProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({
  message,
  details,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500 text-xs font-bold">!</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{message}</p>
          {details && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{details}</p>
          )}
          <div className="flex gap-3 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => { setDismissed(true); onDismiss?.(); }}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
