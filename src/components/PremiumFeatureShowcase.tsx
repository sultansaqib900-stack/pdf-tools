"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PREMIUM_TOOLS, PREMIUM_TOOL_COUNT, type ToolDefinition } from "@/lib/toolCatalog";

const premiumFeatures = PREMIUM_TOOLS;

function FeatureCard({ feature, index }: { feature: ToolDefinition; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={feature.href}
      className="group block p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-white/80 dark:bg-[var(--card)]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease-out ${index * 50}ms, transform 0.4s ease-out ${index * 50}ms`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
          {feature.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--foreground)] group-hover:text-amber-600 transition text-sm">{feature.title}</h3>
            <span className="text-[10px] font-bold text-amber-500">⭐</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function PremiumFeatureShowcase() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 rounded-3xl" />
      <div className="relative border border-amber-200/50 dark:border-amber-800/30 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-floatSlow" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold mb-4 animate-fadeIn">
            ⭐ Premium Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">
            Supercharge Your PDF Workflow
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            {PREMIUM_TOOL_COUNT} professional tools for AI assistance, secure redaction, automation, legal work, and bulk document processing. Every basic tool stays free and unlimited; selected professional tools share a 5-file lifetime trial. Try PDF Studio free for three days — Studio only, with Premium required afterwards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {premiumFeatures.map((feature, index) => (
            <FeatureCard key={feature.href} feature={feature} index={index} />
          ))}
        </div>

        <div className="text-center mt-8 relative z-10 animate-fadeIn animate-delay-300">
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95"
          >
            Unlock All Premium Features
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <p className="text-xs text-[var(--muted)] mt-3">From $8.33/month · 100MB files · Unlimited usage · Unlimited AI</p>
        </div>
      </div>
    </div>
  );
}
