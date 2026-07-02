"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdBanner from "@/components/AdBanner";
import LemonSqueezyCheckout from "@/components/LemonSqueezyCheckout";
import { LS_CONFIG } from "@/lib/lemonsqueezy";
import { setPremium, confirmPremium, claimPremium } from "@/lib/premium";
import Link from "next/link";
import ProductJsonLd from "@/components/ProductJsonLd";
import { useAuth } from "@/components/AuthProvider";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Single file processing", "Max 10MB files", "All basic tools", "Ads supported", "1 download at a time"],
    highlighted: false,
    checkoutUrl: null,
    planKey: null as string | null,
  },
  {
    name: "Premium Monthly",
    price: "$12",
    period: "/month",
    features: ["Unlimited file processing", "Max 100MB files", "Batch processing up to 20 files", "No ads", "13 exclusive premium tools", "Priority email support", "API access", "All future tools"],
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
  { feature: "File size limit", free: "10MB", monthly: "100MB", yearly: "100MB" },
  { feature: "Daily processing", free: "Limited", monthly: "Unlimited", yearly: "Unlimited" },
  { feature: "Batch processing", free: "—", monthly: "20 files", yearly: "20 files" },
  { feature: "File types", free: "PDF only", monthly: "All formats", yearly: "All formats" },
  { feature: "Ad-free experience", free: "—", monthly: "✓", yearly: "✓" },
  { feature: "Priority support", free: "—", monthly: "Email", yearly: "Priority email" },
  { feature: "API access", free: "—", monthly: "✓", yearly: "✓" },
  { feature: "Future tools", free: "—", monthly: "✓", yearly: "✓" },
];

const premiumTools = [
  { icon: "🔍", name: "PDF Diff", desc: "Compare two PDFs side by side", href: "/pdf-diff" },
  { icon: "🏆", name: "Certificate Generator", desc: "Bulk PDF certificates from templates", href: "/certificate-generator" },
  { icon: "🎧", name: "PDF to Audio", desc: "Text-to-speech for any PDF", href: "/pdf-to-audio" },
  { icon: "📊", name: "Form Data Extraction", desc: "Extract form fields to CSV", href: "/form-data-extract" },
  { icon: "🏷️", name: "Bulk Rename", desc: "Auto-rename by metadata", href: "/bulk-rename" },
  { icon: "📖", name: "Booklet Creator", desc: "N-up booklets for printing", href: "/booklet" },
  { icon: "⬛", name: "Search & Redact", desc: "Auto-redact words across PDF", href: "/search-redact" },
  { icon: "🎨", name: "Color Inverter", desc: "Dark mode, grayscale, contrast", href: "/pdf-inverter" },
  { icon: "🔐", name: "PDF Vault", desc: "Encrypted document storage", href: "/vault" },
  { icon: "📱", name: "QR Code Stamp", desc: "Add QR codes to pages", href: "/qr-stamp" },
  { icon: "🧹", name: "Metadata Sanitizer", desc: "Strip hidden PDF data", href: "/metadata-sanitizer" },
  { icon: "📑", name: "Split by Bookmarks", desc: "Extract chapters from bookmark outline", href: "/split-by-bookmarks" },
  { icon: "🔢", name: "Bates Numbering", desc: "Sequential page numbers for legal docs", href: "/bates-numbering" },
];

function SuccessMessage() {
  const searchParams = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (searchParams.get("success") === "true" && !confirmed) {
      setConfirmed(true);
      const nonce = searchParams.get("nonce") || undefined;
      confirmPremium(nonce, user?.email).then((ok) => {
        if (ok) setPremium(true);
      });
    }
  }, [searchParams, confirmed, user?.email]);

  if (searchParams.get("success") === "true") {
    return (
      <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center animate-fadeIn">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-emerald-800 dark:text-emerald-300 font-bold text-xl">Welcome to Premium!</p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Your account has been upgraded. Enjoy all premium features.</p>
      </div>
    );
  }
  return null;
}

function ClaimSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setMessage(null);
    const ok = await claimPremium(email);
    if (ok) {
      setMessage({ type: "success", text: "Premium activated! Refresh the page to enjoy all features." });
      setPremium(true);
    } else {
      setMessage({ type: "error", text: "No premium subscription found for this email. Make sure you used this email when purchasing." });
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-16 pt-8 border-t border-[var(--card-border)] max-w-md mx-auto text-center">
      <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Already purchased Premium?</h3>
      <p className="text-sm text-[var(--muted)] mb-4">Enter the email you used at checkout to activate Premium on this device.</p>
      <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
        <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition text-sm">{submitting ? "Checking..." : "Activate"}</button>
      </form>
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
          Unlock unlimited access, batch processing, larger files, zero ads, and <strong>13 exclusive premium tools</strong>.
        </p>
        {!LS_CONFIG.enabled && (
          <p className="mt-3 text-sm text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 inline-block px-4 py-2 rounded-lg">
            Payments coming soon — AdSense ads covering costs in the meantime
          </p>
        )}
      </div>

      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <AdBanner className="mb-12" />

      {/* Premium Tools Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">13 Exclusive Premium Tools</h2>
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
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pricing */}
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
              <LemonSqueezyCheckout checkoutUrl={plan.checkoutUrl} label={`Buy ${plan.name}`} variant={plan.highlighted ? "primary" : "secondary"} disabled={!LS_CONFIG.enabled} planKey={plan.planKey as "monthly" | "yearly" | undefined} />
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

      <Suspense fallback={null}>
        <ClaimSection />
      </Suspense>

      <AdBanner />
      <ProductJsonLd />
    </div>
  );
}
