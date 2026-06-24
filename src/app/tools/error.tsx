"use client";

export default function ToolError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500 mb-3">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Tool Error</h2>
      <p className="text-sm text-[var(--muted)] mb-4">This tool encountered an issue. Please try again.</p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm">Try Again</button>
        <a href="/" className="px-4 py-2 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--card)] transition text-sm">Go Home</a>
      </div>
    </div>
  );
}
