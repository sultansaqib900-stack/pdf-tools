"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { useStudioTrial } from "@/hooks/useStudioTrial";
import { STUDIO_TRIAL_CTA } from "@/lib/studioTrial";

const StudioAccessContext = createContext(false);
/** Scoped to Studio; never use this as a site-wide Premium entitlement. */
export const useStudioAccess = () => useContext(StudioAccessContext);

export default function StudioGate({ children }: { children: ReactNode }) {
  const { trial, busy, error, refresh } = useStudioTrial();
  const hasAccess = trial?.status === "active" || trial?.status === "premium";

  if (hasAccess) {
    return (
      <StudioAccessContext.Provider value={true}>
        {trial.status === "active" && (
          <div className="border-b border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-center text-sm" role="status">
            <strong>PDF Studio free trial</strong> · Ends {new Date(trial.expiresAt!).toLocaleString()}.
            {" "}Studio only — other Premium tools are not included.{" "}
            <Link href="/premium" className="font-semibold text-indigo-500 underline">Keep Studio with Premium</Link>
          </div>
        )}
        {children}
      </StudioAccessContext.Provider>
    );
  }

  if (!trial && !error) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center" role="status" aria-busy="true">Checking PDF Studio access…</div>;
  }

  const expired = trial?.status === "expired";
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center border border-indigo-500/30 rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-[var(--card)]">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">PDF Studio · Multi-step workspace</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
          {expired ? "Your PDF Studio free trial has ended" : STUDIO_TRIAL_CTA}
        </h1>
        <p className="text-[var(--muted)] leading-relaxed mb-6">
          Load a PDF once. Organise pages, e-sign, redact, watermark, protect, and compress in one session — without downloading and re-uploading between steps.
        </p>
        <p className="text-sm text-[var(--muted)] mb-8">
          {expired
            ? "Continue using PDF Studio with Premium. Your 38 core tools remain free and unlimited."
            : "Your 72 hours start when you activate the trial, not when you visit this page. No account or card required. Premium is required afterwards; there is no automatic charge."}
        </p>
        {error && <p role="alert" className="text-sm text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {!expired && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void refresh(!error)}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy ? "Checking PDF Studio…" : error ? "Retry access check" : STUDIO_TRIAL_CTA}
            </button>
          )}
          <Link href="/premium" className="px-6 py-3.5 rounded-2xl border border-indigo-500/40 text-indigo-500 font-bold">
            {expired ? "Continue with Premium" : "View Premium plans"}
          </Link>
        </div>
        <p className="mt-6 text-xs text-[var(--muted)]">
          This offer unlocks PDF Studio only, not a site-wide Premium trial. Includes Studio’s PII redaction and recipes, with files up to 100MB. The separate professional tools keep their existing access rules.
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">Trial access is linked to this browser, and to your account if you sign in. Documents are processed locally; only access status is checked with the server.</p>
        <Link href="/tools" className="inline-block mt-6 text-sm font-semibold text-indigo-500 underline">Browse the free core tools</Link>
      </div>
    </section>
  );
}
