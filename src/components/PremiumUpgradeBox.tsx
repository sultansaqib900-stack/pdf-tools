"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

/**
 * Blog-page upgrade box that flips to an "active premium" state once
 * premium is server-verified. Non-premium visitors see the upgrade CTA;
 * premium visitors get a direct link to the unlocked tool instead.
 */
export default function PremiumUpgradeBox({
  desc,
  toolHref,
  toolName,
}: {
  desc: string;
  toolHref: string;
  toolName: string;
}) {
  const { premium } = usePremiumStatus();

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mt-6">
      <p className="font-semibold text-[var(--foreground)] mb-1">
        {premium ? "✓ Premium Active" : "Premium Feature"}
      </p>
      <p className="text-sm text-[var(--muted)] mb-3">
        {premium
          ? `${toolName} is included in your active Premium plan — open it now and start working.`
          : desc}
      </p>
      {premium ? (
        <Link
          href={toolHref}
          className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-sm hover:bg-emerald-700 transition"
        >
          Open {toolName} →
        </Link>
      ) : (
        <Link
          href="/premium"
          className="inline-block px-5 py-2.5 bg-amber-600 text-white font-medium rounded-xl text-sm hover:bg-amber-700 transition"
        >
          Upgrade to Premium →
        </Link>
      )}
    </div>
  );
}
