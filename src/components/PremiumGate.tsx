"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PREMIUM_TOOL_COUNT } from "@/lib/toolCatalog";

interface PremiumGateProps {
  title: string;
  description: string;
  icon?: string;
  /** Short capability bullets shown inside the upgrade panel. */
  highlights?: string[];
  children: ReactNode;
}

/**
 * Hard access gate for fully Premium tools (currently PDF Studio). Unlike
 * TrialGate, there is no free trial here: free visitors see an upgrade panel
 * that explains exactly what the tool does, and Premium members pass through.
 */
export default function PremiumGate({
  title,
  description,
  icon = "⭐",
  highlights = [],
  children,
}: PremiumGateProps) {
  const { premium: premiumUser, ready } = usePremiumStatus();

  // Keep the gated content hidden until the server has verified this device or account.
  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse" aria-busy="true" aria-label="Loading">
        <div className="h-8 bg-[var(--card-border)]/50 rounded-xl w-64 mb-4"></div>
        <div className="h-4 bg-[var(--card-border)]/30 rounded-lg w-96 mb-8"></div>
        <div className="h-64 bg-[var(--card-border)]/20 rounded-2xl"></div>
      </div>
    );
  }

  if (!premiumUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/25">
            {icon}
          </div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-4">
            Premium — included in every plan
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-3">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-lg mx-auto mb-6 leading-relaxed">
            {description}
          </p>
          {highlights.length > 0 && (
            <ul className="text-sm text-[var(--muted)] max-w-md mx-auto mb-8 space-y-2 text-left bg-[var(--card)]/60 border border-[var(--card-border)] rounded-2xl p-5">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/premium"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              Unlock {title.split("—")[0].trim()} with Premium →
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-3.5 border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-semibold rounded-2xl transition-all"
            >
              Browse Free Tools
            </Link>
          </div>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Every basic tool stays free and unlimited — Premium adds the professional pipeline.
          </p>
          <div className="mt-6 pt-6 border-t border-[var(--card-border)]/60 grid grid-cols-3 gap-2 text-center text-xs text-[var(--muted)]">
            <div>✓ {PREMIUM_TOOL_COUNT} pro tools</div>
            <div>✓ 100MB files</div>
            <div>✓ Batch &amp; AI included</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
