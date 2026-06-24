"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500 mb-4">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Something went wrong</h1>
      <p className="text-sm text-[var(--muted)] mb-6 max-w-md">
        An unexpected error occurred. This is usually temporary — try refreshing.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--card)] transition text-sm"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
