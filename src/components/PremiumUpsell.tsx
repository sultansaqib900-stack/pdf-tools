"use client";

import { useState, useCallback } from "react";

type UpsellMode = "file-size" | "daily-limit" | "batch" | "premium-only";

interface UpsellState {
  show: boolean;
  mode: UpsellMode;
  message: string;
}

const defaults: Record<UpsellMode, { title: string; message: string }> = {
  "file-size": {
    title: "File Too Large",
    message: "Free users are limited to 10MB files. Upgrade to Premium for up to 100MB file support.",
  },
  "daily-limit": {
    title: "Daily Limit Reached",
    message: "You've used all 5 free daily file processes. Upgrade to Premium for unlimited usage.",
  },
  batch: {
    title: "Batch Processing",
    message: "Processing multiple files at once is a Premium feature.",
  },
  "premium-only": {
    title: "Premium Feature",
    message: "This feature requires a Premium subscription.",
  },
};

export function usePremiumUpsell() {
  const [state, setState] = useState<UpsellState>({ show: false, mode: "daily-limit", message: "" });

  const showUpsell = useCallback((mode: UpsellMode, customMessage?: string) => {
    setState({
      show: true,
      mode,
      message: customMessage || defaults[mode].message,
    });
  }, []);

  const hideUpsell = useCallback(() => {
    setState((prev) => ({ ...prev, show: false }));
  }, []);

  return { state, showUpsell, hideUpsell };
}

export default function PremiumUpsell({
  show,
  mode,
  message,
  onClose,
}: {
  show: boolean;
  mode: UpsellMode;
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;

  const icons: Record<UpsellMode, string> = {
    "file-size": "📦",
    "daily-limit": "⏰",
    batch: "⚙️",
    "premium-only": "⭐",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <div className="text-center">
          <div className="text-5xl mb-4">{icons[mode]}</div>
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
            {mode === "file-size" ? "File Too Large" :
             mode === "daily-limit" ? "Daily Limit Reached" :
             mode === "batch" ? "Batch Processing" : "Premium Feature"}
          </h3>
          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href="/premium"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition text-center"
            >
              Upgrade to Premium
            </a>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[var(--background)] text-[var(--foreground)] font-medium rounded-xl text-sm border border-[var(--card-border)] hover:bg-[var(--card)] transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
}
