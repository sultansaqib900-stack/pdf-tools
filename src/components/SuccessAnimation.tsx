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
    <div className="mt-6 p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl animate-successBounce">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-successScale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" className="animate-drawCheck" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-sm">{message}</p>
          {details && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{details}</p>
          )}
          <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">Download started automatically.</p>
          {onRestore && (
            <button
              onClick={onRestore}
              className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Restore Original
            </button>
          )}
        </div>
        <svg className="w-8 h-8 text-emerald-200 dark:text-emerald-700 animate-successSparkle" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>
  );
}
