"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { isPremium } from "@/lib/premium";

interface PremiumGateProps {
  title: string;
  description: string;
  icon?: string;
  children: ReactNode;
}

export default function PremiumGate({
  title,
  description,
  icon = "⭐",
  children,
}: PremiumGateProps) {
  const [mounted, setMounted] = useState(false);
  const [premiumUser, setPremiumUser] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPremiumUser(isPremium());
  }, []);

  // During SSR and initial mount, render a smooth skeleton shell to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-[var(--card-border)]/50 rounded-xl w-64 mb-4"></div>
        <div className="h-4 bg-[var(--card-border)]/30 rounded-lg w-96 mb-8"></div>
        <div className="h-64 bg-[var(--card-border)]/20 rounded-2xl"></div>
      </div>
    );
  }

  if (!premiumUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/25 animate-bounce">
            {icon}
          </div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500 text-white mb-4">
            Exclusive Premium Feature
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-3">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-lg mx-auto mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/premium"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Unlock Premium Access →
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-3.5 border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-semibold rounded-2xl transition-all"
            >
              View Free Tools
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-center text-xs text-[var(--muted)]">
            <div>✓ Instant Activation</div>
            <div>✓ 100MB File Limit</div>
            <div>✓ 13 Exclusive Tools</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
