"use client";

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  details?: string;
  onRestore?: () => void;
}

export default function SuccessAnimation({
  show,
  message = "Done!",
  details,
  onRestore,
}: SuccessAnimationProps) {
  if (!show) return null;

  return (
    <div className="mt-6 p-6 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] animate-successBounce">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--success-subtle)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--success)] dark:text-[var(--success)] animate-successScale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" className="animate-drawCheck" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[var(--success)] font-semibold text-sm">{message}</p>
          {details && (
            <p className="text-xs text-[var(--success)] dark:text-[var(--success)] mt-1">{details}</p>
          )}
          <p className="text-xs text-[var(--success)] dark:text-[var(--success)] mt-1">Download started automatically.</p>
          {onRestore && (
            <button
              onClick={onRestore}
              className="mt-2 text-xs font-medium text-[var(--accent)] dark:text-[var(--accent)] hover:underline"
            >
              Restore Original
            </button>
          )}
        </div>
        <svg className="w-8 h-8 text-[var(--success)] animate-successSparkle" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>
  );
}
