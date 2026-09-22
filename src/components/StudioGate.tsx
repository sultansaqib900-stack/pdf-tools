"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

const StudioAccessContext = createContext(false);
/** Scoped to Studio; never use this as a site-wide Premium entitlement. */
export const useStudioAccess = () => useContext(StudioAccessContext);

/**
 * PDF Studio is included with Premium — forever. The former three-day trial
 * was removed; Premium members (server-verified) mount the workspace, and
 * everyone else sees a straightforward upgrade page.
 */
export default function StudioGate({ children }: { children: ReactNode }) {
  const { premium, ready } = usePremiumStatus();

  if (premium) {
    return (
      <StudioAccessContext.Provider value={true}>
        {children}
      </StudioAccessContext.Provider>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" role="status" aria-busy="true">
        Checking your Premium status…
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center border border-[var(--card-border)] rounded-2xl p-8 sm:p-12 bg-[var(--card)]">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-4">
          PDF Studio · Multi-step workspace
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
          PDF Studio is included with Premium
        </h1>
        <p className="text-[var(--muted)] leading-relaxed mb-6 max-w-xl mx-auto">
          Load a PDF once, then organise pages, e-sign, redact, watermark, protect, and compress
          in one session — no downloading and re-uploading between steps. Premium keeps Studio
          unlocked forever, along with the full professional tool suite and files up to 100MB.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/premium"
            className="px-6 py-3.5 rounded-xl bg-[var(--accent)] text-white font-bold hover:bg-[var(--accent-hover)]"
          >
            View Premium plans
          </Link>
          <Link
            href="/tools"
            className="px-6 py-3.5 rounded-xl border border-[var(--card-border)] text-[var(--foreground)] font-bold hover:border-[var(--card-hover-border)]"
          >
            Browse the free core tools
          </Link>
        </div>
        <p className="mt-6 text-xs text-[var(--muted)]">
          Already Premium? Sign in with your account email and Studio unlocks immediately.
          All 38 core tools stay free and unlimited for everyone.
        </p>
      </div>
    </section>
  );
}
