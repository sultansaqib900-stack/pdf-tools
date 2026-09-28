"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface PremiumStateCtaProps {
  /** Upgrade CTA shown to free users (e.g. "Go Premium", "Unlock All …"). */
  upgradeLabel?: ReactNode;
  upgradeHref?: string;
  /** Classes for the upgrade CTA. */
  className?: string;
  /** Shown once the server has verified Premium (e.g. "✓ Premium Active"). */
  activeLabel?: ReactNode;
  activeHref?: string;
  activeClassName?: string;
}

/**
 * Premium-aware CTA slot.
 *
 * Free users see the usual upgrade call-to-action ("Go Premium" / "Unlock … with
 * Premium" / "Upgrade to Premium"). Once Premium is activated and verified by the
 * server (`usePremiumStatus`), the same slot flips to an **active Premium state**
 * ("✓ Premium Active") instead of pushing an upgrade the user already has.
 *
 * Rendered from server parents as a client island, or inside client components.
 * SSR and the first client render both show the upgrade CTA (matching HTML), then
 * the badge flips after `/api/premium/verify` responds — same pattern as the
 * header badge.
 */
export default function PremiumStateCta({
  upgradeLabel = "Go Premium",
  upgradeHref = "/premium",
  className,
  activeLabel = "✓ Premium Active",
  activeHref = "/dashboard",
  activeClassName,
}: PremiumStateCtaProps) {
  const { premium } = usePremiumStatus();

  if (premium) {
    return (
      <Link
        href={activeHref}
        className={
          activeClassName ??
          "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
        }
      >
        {activeLabel}
      </Link>
    );
  }

  return (
    <Link href={upgradeHref} className={className}>
      {upgradeLabel}
    </Link>
  );
}
