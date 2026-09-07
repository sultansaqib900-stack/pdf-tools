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
    <div className="mt-4 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--danger-subtle)] flex items-center justify-center text-[var(--danger)] text-xs font-bold">!</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--danger)]">{message}</p>
          {details && (
            <p className="text-xs text-[var(--danger)] dark:text-[var(--danger)] mt-1">{details}</p>
          )}
          <div className="flex gap-3 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium text-[var(--accent)] dark:text-[var(--accent)] hover:underline"
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
