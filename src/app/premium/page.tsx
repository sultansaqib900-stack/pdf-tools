"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LemonSqueezyCheckout from "@/components/LemonSqueezyCheckout";
import { LS_CONFIG } from "@/lib/lemonsqueezy";
import { confirmPremium, claimPremium } from "@/lib/premium";
import Link from "next/link";
import ProductJsonLd from "@/components/ProductJsonLd";
import { useAuth } from "@/components/AuthProvider";
import { PREMIUM_TOOLS, PREMIUM_TOOL_COUNT } from "@/lib/toolCatalog";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["All basic tools — unlimited use", "Professional tools: 5 lifetime trial files (shared)", "Max 10MB files", "No account required", "AI chat preview: 3 questions/day"],
    highlighted: false,
    checkoutUrl: null,
    planKey: null as string | null,
  },
  {
    name: "Premium Monthly",
    price: "$12",
    period: "/month",
    features: ["Unlimited basic AND professional tools — no trial limit", "Max 100MB files", "Batch processing up to 20 files", "Unlimited AI questions", `${PREMIUM_TOOL_COUNT} professional premium tools`, "Priority email support", "Future premium tools"],
    highlighted: true,
    checkoutUrl: LS_CONFIG.checkoutBaseUrls.premiumMonthly,
    planKey: "monthly",
  },
  {
    name: "Premium Yearly",
    price: "$8.33",
    period: "/month",
    features: ["Everything in Monthly", "2 months free", "Priority support", "Best value — save $44/year"],
    highlighted: false,
    checkoutUrl: LS_CONFIG.checkoutBaseUrls.premiumYearly,
    planKey: "yearly",
  },
];

const featureRows = [
  { feature: "Basic tools (Compress, Merge, Split, Sign, …)", free: "Unlimited", monthly: "Unlimited", yearly: "Unlimited" },
  { feature: "Professional tools trial", free: "5 files — lifetime, shared", monthly: "Unlimited", yearly: "Unlimited" },
  { feature: "File size limit", free: "10MB", monthly: "100MB", yearly: "100MB" },
  { feature: "Batch processing", free: "—", monthly: "20 files", yearly: "20 files" },
  { feature: "AI chat questions", free: "3/day preview", monthly: "Unlimited", yearly: "Unlimited" },
  { feature: "Priority support", free: "—", monthly: "Email", yearly: "Priority email" },
  { feature: "Future tools", free: "—", monthly: "✓", yearly: "✓" },
];

const premiumTools = PREMIUM_TOOLS.map((tool) => ({
  icon: tool.icon,
  name: tool.title,
  desc: tool.description,
  href: tool.href,
  hasFreePreview: tool.hasFreePreview,
}));

function SuccessMessage() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "pending" | "error">("idle");

  const confirming = searchParams.get("payment") === "confirming";
  const nonce = searchParams.get("nonce") || undefined;

  useEffect(() => {
    if (!confirming || !nonce) return;
    let cancelled = false;

    const poll = async () => {
      for (let attempt = 0; attempt < 12 && !cancelled; attempt += 1) {
        const confirmed = await confirmPremium(nonce, token || undefined);
        if (confirmed) {
          if (!cancelled) setStatus("success");
          return;
        }
        if (!cancelled) setStatus("pending");
        await new Promise((resolve) => window.setTimeout(resolve, 2_000));
      }
      if (!cancelled) setStatus("error");
    };

    void poll();
    return () => { cancelled = true; };
  }, [confirming, nonce, token]);

  if (!confirming) return null;

  const displayStatus = !nonce ? "error" : status === "idle" ? "checking" : status;
  const success = displayStatus === "success";
  return (
    <div className={`mb-8 p-6 rounded-2xl text-center animate-fadeIn border ${success ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : displayStatus === "error" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"}`}>
      <div className="text-4xl mb-3">{success ? "🎉" : displayStatus === "error" ? "⚠️" : "⏳"}</div>
      <p className={`font-bold text-xl ${success ? "text-emerald-700 dark:text-emerald-300" : displayStatus === "error" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}>
        {success ? "Premium payment verified" : displayStatus === "error" ? "Payment is not verified yet" : "Verifying your payment…"}
      </p>
      <p className="text-sm text-[var(--muted)] mt-1">
        {success
          ? "Premium is active on this device."
          : displayStatus === "error"
            ? "If payment completed, refresh in a moment. Access is granted only after Lemon Squeezy's signed webhook arrives; a checkout begun while signed in can also be restored through that account."
            : "This can take a few seconds while the signed payment webhook is processed."}
      </p>
    </div>
  );
}

function ClaimSection() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClaim = async () => {
    if (!user) return;
    setSubmitting(true);
    setMessage(null);
    // Authentication is sent by the HttpOnly session cookie.
    const ok = await claimPremium();
    setMessage(ok
      ? { type: "success", text: "Premium is now active on this device." }
      : { type: "error", text: "No active Premium checkout is linked to this account. Account recovery is available when checkout was started while signed in." });
    setSubmitting(false);
  };

  return (
    <div className="mt-16 pt-8 border-t border-[var(--card-border)] max-w-md mx-auto text-center">
      <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Already purchased Premium?</h3>
      {user ? (
        <>
          <p className="text-sm text-[var(--muted)] mb-4">Restore a verified checkout started from the <strong>{user.email}</strong> account on this device.</p>
          <button type="button" onClick={handleClaim} disabled={submitting} className="w-full px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition text-sm">
            {submitting ? "Checking purchase…" : "Activate verified purchase"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)] mb-4">For cross-device recovery, sign in before starting checkout and use that same account here. Anonymous purchases activate on the checkout device after verified payment.</p>
          <Link href="/login" className="inline-block w-full px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition text-sm">Sign in to activate</Link>
        </>
      )}
      {message && <p className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{message.text}</p>}
    </div>
  );
}

export default function PremiumPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold mb-4">
          ⭐ Premium
        </div>
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Go Premium</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          Basic tools are <strong>free and unlimited</strong>. Professional tools include a <strong>5-file lifetime trial</strong> shared across all of them — Premium removes the trial limit and unlocks <strong>{PREMIUM_TOOL_COUNT} professional tools</strong>, larger files, and unlimited AI questions.
        </p>
        {!LS_CONFIG.enabled && (
          <p className="mt-3 text-sm text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 inline-block px-4 py-2 rounded-lg">
            Payments are temporarily unavailable. Please check back soon.
          </p>
        )}
      </div>

      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>


      {/* Premium Tools Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">{PREMIUM_TOOL_COUNT} Professional Premium Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {premiumTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shrink-0">
                {tool.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-amber-600 transition truncate">{tool.name}</p>
                <p className="text-[10px] text-[var(--muted)] truncate">{tool.desc}</p>
                {tool.hasFreePreview && <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Free preview available</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <p className="text-center text-xs text-[var(--muted)] mb-4">
        Tip: <Link href="/login" className="text-indigo-500 font-semibold hover:underline">sign in before checkout</Link> to enable verified cross-device account recovery.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${plan.highlighted ? "border-amber-500 ring-2 ring-amber-500 bg-[var(--card)] scale-105 md:scale-105" : "border-[var(--card-border)] bg-[var(--card)]"}`}>
            {plan.highlighted && (
              <span className="text-xs font-semibold text-amber-500 mb-2 uppercase tracking-wider">Most Popular</span>
            )}
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{plan.name}</h3>
            <div className="mb-5">
              <span className="text-4xl font-bold text-[var(--foreground)]">{plan.price}</span>
              <span className="text-[var(--muted)] text-sm ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <span className="text-emerald-500 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            {plan.checkoutUrl ? (
              <LemonSqueezyCheckout label={`Buy ${plan.name}`} variant={plan.highlighted ? "primary" : "secondary"} disabled={!LS_CONFIG.enabled} planKey={plan.planKey as "monthly" | "yearly" | undefined} />
            ) : (
              <button className="w-full py-2.5 rounded-xl font-medium bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)] cursor-default">Get Started Free</button>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="border border-[var(--card-border)] rounded-xl overflow-hidden mb-12">
        <div className="px-6 py-4 bg-[var(--card)] border-b border-[var(--card-border)]">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background)]">
                <th className="px-6 py-3 text-left font-medium text-[var(--foreground)]">Feature</th>
                <th className="px-6 py-3 text-center font-medium text-[var(--muted)]">Free</th>
                <th className="px-6 py-3 text-center font-medium text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">Premium Monthly</th>
                <th className="px-6 py-3 text-center font-medium text-[var(--foreground)]">Premium Yearly</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row, i) => (
                <tr key={row.feature} className={`border-b border-[var(--card-border)] ${i % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--background)]"}`}>
                  <td className="px-6 py-3 text-[var(--foreground)]">{row.feature}</td>
                  <td className="px-6 py-3 text-center text-[var(--muted)]">{row.free}</td>
                  <td className="px-6 py-3 text-center text-[var(--foreground)] bg-amber-50/50 dark:bg-amber-950/20">{row.monthly}</td>
                  <td className="px-6 py-3 text-center text-[var(--foreground)]">{row.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Tools Detail */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">What You Can Do with Premium</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="block p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-amber-400/30 hover:shadow-lg transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-bold text-[var(--foreground)] group-hover:text-amber-600 transition text-sm">{tool.name}</h3>
                  <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Usage FAQ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">Free vs Premium — How Usage Works</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="font-bold text-emerald-500 mb-2">✓ Basic tools — unlimited</p>
            <p className="text-sm text-[var(--muted)]">Compress, Merge, Split, Sign, Protect, Watermark, Convert, Organize, and every other core tool is free for everyone with no daily or monthly cap.</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="font-bold text-amber-500 mb-2">⭐ Professional tools — 5 lifetime trial files</p>
            <p className="text-sm text-[var(--muted)]">PDF Studio, PDF Diff, Bates Numbering, Certificate Generator, and the rest of the professional suite share a one-time trial of 5 files. It never resets, and failed or invalid files never count.</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="font-bold text-indigo-500 mb-2">🚀 Premium — no limits</p>
            <p className="text-sm text-[var(--muted)]">Premium removes the trial limit: unlimited professional tools, 100MB files, batch processing up to 20 files, and unlimited AI questions.</p>
          </div>
        </div>
        {[
          { q: "Do the 5 trial files reset every month?", a: "No. The trial allowance is 5 files in total, shared across all professional tools for the lifetime of the browser identity or account. It does not reset daily or monthly." },
          { q: "Do failed or invalid files consume the trial?", a: "No. Only files that are accepted and actually begin processing count. If processing fails, the reservation is refunded automatically." },
          { q: "Are basic tools really unlimited on the free plan?", a: "Yes. All core tools never touch the trial allowance — use them as often as you like, subject only to the 10MB free file-size limit." },
          { q: "What does Premium change?", a: "Premium removes the 5-file lifetime trial limit on professional tools and raises the file-size limit to 100MB, enables batch processing, and unlocks unlimited AI questions." },
        ].map((item) => (
          <details key={item.q} className="group border border-[var(--card-border)] rounded-xl bg-[var(--card)] mb-2 px-5 py-4">
            <summary className="font-semibold text-sm text-[var(--foreground)] cursor-pointer list-none flex items-center justify-between">
              {item.q}
              <span className="text-[var(--muted)] group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
            </summary>
            <p className="text-sm text-[var(--muted)] mt-3">{item.a}</p>
          </details>
        ))}
      </div>

      <Suspense fallback={null}>
        <ClaimSection />
      </Suspense>

      <ProductJsonLd />
    </div>
  );
}
