"use client";

import { useState } from "react";
import { LS_CONFIG, buildCheckoutUrl } from "@/lib/lemonsqueezy";
import { getClientId } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";

interface LemonSqueezyCheckoutProps {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  planKey?: "monthly" | "yearly";
}

export default function LemonSqueezyCheckout({
  label,
  variant = "primary",
  disabled = false,
  planKey,
}: LemonSqueezyCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleCheckout = async () => {
    if (!LS_CONFIG.enabled) {
      alert(
        "Payments are not configured yet.\n\n" +
        "To enable:\n" +
        "1. Sign up at https://lemonsqueezy.com\n" +
        "2. Create a store and product\n" +
        "3. Update src/lib/lemonsqueezy.ts with your IDs\n" +
        "4. Set enabled: true"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clientId = getClientId();
      if (!planKey || !clientId) throw new Error("Checkout is not configured for this plan.");

      const res = await fetch("/api/premium/init-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ clientId, plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.nonce) {
        throw new Error(data.error || "Checkout could not be initialized.");
      }

      const url = buildCheckoutUrl(
        planKey,
        data.nonce,
        clientId,
        typeof data.email === "string" ? data.email : undefined,
      );
      window.location.assign(url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be opened.");
      setLoading(false);
    }
  };

  const baseClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
      : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-[var(--card-border)]";

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`w-full py-2.5 rounded-xl font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${baseClass}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Opening secure checkout...
          </span>
        ) : (
          label
        )}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
