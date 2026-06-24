"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  processing: boolean;
  fileSize?: number;
  label?: string;
  onComplete?: () => void;
}

export default function ProgressBar({
  processing,
  fileSize,
  label = "Processing...",
  onComplete,
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!processing) {
      if (progress === 100) {
        setDone(true);
        const t = setTimeout(() => { setDone(false); setProgress(0); }, 1500);
        return () => clearTimeout(t);
      }
      setProgress(0);
      setDone(false);
      return;
    }

    setProgress(0);
    setDone(false);

    const estimatedMs = fileSize ? Math.min(Math.round(fileSize / 50000) * 1000, 30000) : 8000;
    const interval = 100;
    const step = 100 / (estimatedMs / interval);
    let p = 0;

    const t = setInterval(() => {
      p += step;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        onComplete?.();
      }
      setProgress(Math.min(p, 95));
    }, interval);

    return () => clearInterval(t);
  }, [processing, fileSize, onComplete, progress]);

  if (!processing && !done) return null;

  return (
    <div className="w-full my-4">
      {done ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-fadeIn">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" className="animate-drawCheck" />
          </svg>
          Complete!
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
