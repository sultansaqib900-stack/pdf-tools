"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Something went wrong</h1>
          <p className="text-[var(--muted)] mb-8">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
