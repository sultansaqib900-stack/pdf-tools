"use client";

import { useState } from "react";
import { LS_CONFIG } from "@/lib/lemonsqueezy";

interface LemonSqueezyCheckoutProps {
  checkoutUrl: string;
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function LemonSqueezyCheckout({
  checkoutUrl,
  label,
  variant = "primary",
  disabled = false,
}: LemonSqueezyCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
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
    window.open(checkoutUrl, "_blank");
    setLoading(false);
  };

  const baseClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
      : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-[var(--card-border)]";

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`w-full py-2.5 rounded-xl font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${baseClass}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Opening checkout...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
