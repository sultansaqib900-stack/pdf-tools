"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdBanner from "@/components/AdBanner";
import LemonSqueezyCheckout from "@/components/LemonSqueezyCheckout";
import { LS_CONFIG } from "@/lib/lemonsqueezy";
import { setPremium, confirmPremium } from "@/lib/premium";

const plans = [
  {
    name: "Free",
    price: "PKR 0",
    period: "forever",
    features: ["Single file processing", "Max 10MB files", "All basic tools", "Ads supported", "1 download at a time"],
    highlighted: false,
    checkoutUrl: null,
  },
  {
    name: "Premium Monthly",
    price: "PKR 2,500",
    period: "/month",
    features: ["Unlimited file processing", "Max 100MB files", "Batch processing", "No ads", "Priority support", "API access", "All future tools"],
    highlighted: true,
    checkoutUrl: LS_CONFIG.checkoutUrls.premiumMonthly,
  },
  {
    name: "Premium Yearly",
    price: "PKR 8,500",
    period: "/year",
    features: ["Everything in Monthly", "2 months free", "Priority support", "Best value"],
    highlighted: false,
    checkoutUrl: LS_CONFIG.checkoutUrls.premiumYearly,
  },
];

function SuccessMessage() {
  const searchParams = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true" && !confirmed) {
      setConfirmed(true);
      confirmPremium().then(() => {
        setPremium(true);
      });
    }
  }, [searchParams, confirmed]);

  if (searchParams.get("success") === "true") {
    return (
      <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
        <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-lg">
          Welcome to Premium! &#10003;
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
          Your account has been upgraded. Enjoy all premium features.
        </p>
      </div>
    );
  }
  return null;
}

export default function PremiumPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Go Premium</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          Unlock unlimited access, batch processing, larger files, and zero ads.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 flex flex-col ${
              plan.highlighted
                ? "border-indigo-500 ring-2 ring-indigo-500 bg-[var(--card)] scale-105 md:scale-105"
                : "border-[var(--card-border)] bg-[var(--card)]"
            }`}
          >
            {plan.highlighted && (
              <span className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wider">Most Popular</span>
            )}
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{plan.name}</h3>
            <div className="mb-5">
              <span className="text-4xl font-bold text-[var(--foreground)]">{plan.price}</span>
              <span className="text-[var(--muted)] text-sm ml-1">/{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <span className="text-emerald-500 shrink-0">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            {plan.checkoutUrl ? (
              <LemonSqueezyCheckout
                checkoutUrl={plan.checkoutUrl}
                label={`Buy ${plan.name}`}
                variant={plan.highlighted ? "primary" : "secondary"}
                disabled={!LS_CONFIG.enabled}
              />
            ) : (
              <button className="w-full py-2.5 rounded-xl font-medium bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)] cursor-default">
                Get Started Free
              </button>
            )}
          </div>
        ))}
      </div>

      <AdBanner />
    </div>
  );
}
