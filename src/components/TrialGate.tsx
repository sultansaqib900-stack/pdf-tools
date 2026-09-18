"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useUsage } from "@/hooks/useUsage";
import { PREMIUM_TOOL_COUNT } from "@/lib/toolCatalog";
import { TRIAL_FILE_LIMIT } from "@/lib/premium";

interface TrialGateProps {
  title: string;
  description: string;
  icon?: string;
  /** Page slug used to classify the tool tier, e.g. "pdf-diff". */
  tool: string;
  children: ReactNode;
}

/**
 * Access gate for professional tools.
 *
 * - Premium members: full access, no limits.
 * - Free visitors: can open the tool and process files against the shared
 *   one-time lifetime trial (TRIAL_FILE_LIMIT files across ALL professional
 *   tools). The page itself reserves each file via useUsage before processing.
 * - Once the lifetime trial is used up, an upgrade panel is shown instead.
 */
export default function TrialGate({
  title,
  description,
  icon = "⭐",
  tool,
  children,
}: TrialGateProps) {
  const { premium: premiumUser, ready } = usePremiumStatus();
  const usage = useUsage(tool);

  // Keep the tool hidden until the server has verified this device or account.
  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse" aria-busy="true" aria-label="Loading">
        <div className="h-8 bg-[var(--card-border)]/50 rounded-xl w-64 mb-4"></div>
        <div className="h-4 bg-[var(--card-border)]/30 rounded-lg w-96 mb-8"></div>
        <div className="h-64 bg-[var(--card-border)]/20 rounded-2xl"></div>
      </div>
    );
  }

  if (!premiumUser && usage.trialLoaded && usage.remaining !== null && usage.remaining <= 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/25">
            {icon}
          </div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500 text-white mb-4">
            Free trial used up
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-3">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-lg mx-auto mb-4 leading-relaxed">
            {description}
          </p>
          <p className="text-sm text-[var(--muted)] max-w-lg mx-auto mb-8">
            You have used all {TRIAL_FILE_LIMIT} lifetime free trial files shared across professional
            tools. Basic tools remain free and unlimited — Premium removes the trial limit and
            unlocks all {PREMIUM_TOOL_COUNT} professional tools with no file cap.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/premium"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Unlock Unlimited Access →
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-3.5 border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-semibold rounded-2xl transition-all"
            >
              Use Unlimited Basic Tools
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-center text-xs text-[var(--muted)]">
            <div>✓ Unlimited basic tools</div>
            <div>✓ 100MB file limit</div>
            <div>✓ {PREMIUM_TOOL_COUNT} professional tools</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!premiumUser && usage.remaining !== null && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs sm:text-sm"
            role="status"
          >
            <span className="text-amber-700 dark:text-amber-300 font-semibold">
              ⭐ Free trial: {usage.remaining} of {TRIAL_FILE_LIMIT} lifetime files left — shared
              across all professional tools.
            </span>
            <Link href="/premium" className="font-bold text-amber-600 dark:text-amber-300 hover:underline shrink-0">
              Go unlimited with Premium →
            </Link>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
