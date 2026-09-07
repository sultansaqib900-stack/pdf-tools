"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LemonSqueezyCheckout from "@/components/LemonSqueezyCheckout";
import { LS_CONFIG } from "@/lib/lemonsqueezy";
import { setPremium, confirmPremium, claimPremium } from "@/lib/premium";
import Link from "next/link";
import ProductJsonLd from "@/components/ProductJsonLd";
import Icon, { type IconName } from "@/components/ui/Icon";
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
  { feature: "Ad-free experience", free: "—", monthly: "Yes", yearly: "Yes" },
  { feature: "Priority support", free: "—", monthly: "Email", yearly: "Priority email" },
  { feature: "API access", free: "—", monthly: "Yes", yearly: "Yes" },
  { feature: "Future tools", free: "—", monthly: "Yes", yearly: "Yes" },
];

const premiumTools: { icon: IconName; name: string; desc: string; href: string }[] = [
  { icon: "diff", name: "PDF Diff", desc: "Compare two PDFs side by side", href: "/pdf-diff" },
  { icon: "award", name: "Certificate Generator", desc: "Bulk PDF certificates from templates", href: "/certificate-generator" },
  { icon: "headphones", name: "PDF to Audio", desc: "Text-to-speech for any PDF", href: "/pdf-to-audio" },
  { icon: "fileSheet", name: "Form Data Extraction", desc: "Extract form fields to CSV", href: "/form-data-extract" },
  { icon: "tag", name: "Bulk Rename", desc: "Auto-rename by metadata", href: "/bulk-rename" },
  { icon: "book", name: "Booklet Creator", desc: "N-up booklets for printing", href: "/booklet" },
  { icon: "search", name: "Search & Redact", desc: "Auto-redact words across PDF", href: "/search-redact" },
  { icon: "contrast", name: "Color Inverter", desc: "Dark mode, grayscale, contrast", href: "/pdf-inverter" },
  { icon: "vault", name: "PDF Vault", desc: "Encrypted document storage", href: "/vault" },
  { icon: "qr", name: "QR Code Stamp", desc: "Add QR codes to pages", href: "/qr-stamp" },
  { icon: "eraser", name: "Metadata Sanitizer", desc: "Strip hidden PDF data", href: "/metadata-sanitizer" },
  { icon: "bookmark", name: "Split by Bookmarks", desc: "Extract chapters from bookmark outline", href: "/split-by-bookmarks" },
  { icon: "numbers", name: "Bates Numbering", desc: "Sequential page numbers for legal docs", href: "/bates-numbering" },
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
      <div className="mb-8 p-5 rounded-[var(--r-lg)] border text-center animate-fadeIn"
           style={{ background: "var(--success-subtle)", borderColor: "var(--success)" }}>
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full mb-2.5"
              style={{ background: "var(--success)", color: "var(--background)" }}>
          <Icon name="check" size={18} strokeWidth={2.5} />
        </span>
        <p className="font-semibold text-[var(--foreground)]">You&apos;re on Premium</p>
        <p className="mt-0.5 text-[0.875rem] text-[var(--muted)]">Your account has been upgraded. All premium tools are unlocked.</p>
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
    <div className="mt-14 pt-8 border-t border-[var(--border)] max-w-md mx-auto text-center">
      <h3 className="text-base font-semibold text-[var(--foreground)]">Already purchased?</h3>
      <p className="mt-1.5 mb-4 text-[0.875rem] text-[var(--muted)]">
        Enter the email you used at checkout to activate Premium on this device.
      </p>
      <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" required aria-label="Purchase email" className="input flex-1" />
        <button type="submit" disabled={submitting} className="btn btn-primary shrink-0">
          {submitting ? "Checking" : "Activate"}
        </button>
      </form>
      {message && (
        <p className="mt-3 text-[0.875rem]" style={{ color: message.type === "success" ? "var(--success)" : "var(--danger)" }}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default function PremiumPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge badge-premium mb-4">
          <Icon name="star" size={11} strokeWidth={2.5} />
          Premium
        </span>
        <h1 className="text-[2rem] sm:text-[2.5rem] font-semibold leading-tight text-[var(--foreground)]">
          Do more with your PDFs
        </h1>
        <p className="mt-3 text-[0.9375rem] sm:text-base leading-relaxed text-[var(--muted)]">
          Unlimited processing, 100&nbsp;MB files, batch mode, no ads, and 13 tools
          you won&apos;t find anywhere else.
        </p>
        {!LS_CONFIG.enabled && (
          <p className="mt-4 inline-block badge badge-premium">
            Payments coming soon — ads are covering costs in the meantime
          </p>
        )}
      </div>

      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>


      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">13 exclusive tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {premiumTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="card-interactive group flex items-center gap-3 p-3.5">
              <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--r-md)] bg-[var(--premium-subtle)] border border-[var(--premium-border)] text-[var(--premium)]">
                <Icon name={tool.icon} size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">{tool.name}</p>
                <p className="text-[0.75rem] text-[var(--muted)] truncate">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-12 items-start">
        {plans.map((plan) => (
          <div key={plan.name} className={`surface-card p-6 flex flex-col ${plan.highlighted ? "border-[var(--accent)] shadow-[var(--shadow-md)]" : ""}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-[0.9375rem] font-semibold text-[var(--foreground)]">{plan.name}</h3>
              {plan.highlighted && <span className="badge badge-accent">Most popular</span>}
            </div>
            <div className="mb-5 flex items-baseline gap-1">
              <span className="text-[2rem] font-semibold tracking-tight text-[var(--foreground)]">{plan.price}</span>
              <span className="text-[0.875rem] text-[var(--muted)]">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-7 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                  <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--success)]" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.checkoutUrl ? (
              <LemonSqueezyCheckout checkoutUrl={plan.checkoutUrl} label={`Buy ${plan.name}`} variant={plan.highlighted ? "primary" : "secondary"} disabled={!LS_CONFIG.enabled} planKey={plan.planKey as "monthly" | "yearly" | undefined} />
            ) : (
              <button className="btn btn-secondary w-full cursor-default" disabled>Current plan</button>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="surface-card overflow-hidden mb-12">
        <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <h2 className="text-[0.9375rem] font-semibold text-[var(--foreground)]">Feature comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-2.5 text-left font-medium text-[var(--muted)] text-[0.75rem] uppercase tracking-wider">Feature</th>
                <th className="px-5 py-2.5 text-center font-medium text-[var(--muted)] text-[0.75rem] uppercase tracking-wider">Free</th>
                <th className="px-5 py-2.5 text-center font-medium text-[var(--accent)] text-[0.75rem] uppercase tracking-wider">Monthly</th>
                <th className="px-5 py-2.5 text-center font-medium text-[var(--muted)] text-[0.75rem] uppercase tracking-wider">Yearly</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row, i) => (
                <tr key={row.feature} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-5 py-2.5 text-[0.8125rem] text-[var(--foreground)]">{row.feature}</td>
                  <td className="px-5 py-2.5 text-center text-[0.8125rem] text-[var(--muted)]">{row.free}</td>
                  <td className="px-5 py-2.5 text-center text-[0.8125rem] font-medium text-[var(--foreground)]">{row.monthly}</td>
                  <td className="px-5 py-2.5 text-center text-[0.8125rem] text-[var(--foreground)]">{row.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Suspense fallback={null}>
        <ClaimSection />
      </Suspense>

      <ProductJsonLd />
    </div>
  );
}
