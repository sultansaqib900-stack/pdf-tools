"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING_CONFIG } from "@/lib/pricing";

export default function SavingsCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [competitor, setCompetitor] = useState<"adobe" | "ilovepdf" | "smallpdf">("adobe");
  const [pdftoolsPlan, setPdftoolsPlan] = useState<"free" | "premium">("free");

  // Verified public pricing per seat/year (USD)
  const competitorPrices = {
    adobe: { name: "Adobe Acrobat Pro", annualPerSeatUSD: 240, monthlyPerSeatUSD: 20 },
    ilovepdf: { name: "iLovePDF Premium", annualPerSeatUSD: 84, monthlyPerSeatUSD: 7 },
    smallpdf: { name: "SmallPDF Pro", annualPerSeatUSD: 108, monthlyPerSeatUSD: 9 },
  };

  // PDFTools pricing: Free is $0; Premium is Rs 12,500/year (approx. $45 USD at prevailing exchange rate)
  const premiumPerSeatUSD = 45;
  const pdfToolsAnnualPerSeatUSD = pdftoolsPlan === "free" ? 0 : premiumPerSeatUSD;

  const selectedCompetitor = competitorPrices[competitor];
  const competitorAnnualTotal = teamSize * selectedCompetitor.annualPerSeatUSD;
  const pdfToolsAnnualTotal = teamSize * pdfToolsAnnualPerSeatUSD;
  const annualSavingsUSD = Math.max(0, competitorAnnualTotal - pdfToolsAnnualTotal);

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-[var(--card)] to-purple-950/30 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          💰 ROI &amp; Cost Comparison
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mt-3 mb-2">
          Calculate Your Team&apos;s Annual Savings
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          Compare subscription costs against our private, browser-based PDF suite.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Sliders and Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase mb-2">
              Compare Against Competitor:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "adobe", label: "Adobe Pro", sub: "$240/seat" },
                { id: "ilovepdf", label: "iLovePDF", sub: "$84/seat" },
                { id: "smallpdf", label: "SmallPDF", sub: "$108/seat" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCompetitor(c.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    competitor === c.id
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500"
                      : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <p className="text-xs">{c.label}</p>
                  <p className="text-[10px] opacity-75">{c.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase mb-2">
              Choose PDFTools Plan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPdftoolsPlan("free")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  pdftoolsPlan === "free"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <p className="text-xs">Free Core Suite</p>
                <p className="text-[10px] opacity-75">$0 / seat (38 basic tools)</p>
              </button>
              <button
                type="button"
                onClick={() => setPdftoolsPlan("premium")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  pdftoolsPlan === "premium"
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-500"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <p className="text-xs">PDFTools Premium</p>
                <p className="text-[10px] opacity-75">~${premiumPerSeatUSD}/yr ({PRICING_CONFIG.yearly.priceFormatted})</p>
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="team-size-slider" className="text-xs font-bold text-[var(--foreground)] uppercase cursor-pointer">
                Team Size / Number of Seats:
              </label>
              <span className="text-base font-extrabold text-indigo-400 font-mono">
                {teamSize} {teamSize === 1 ? "User" : "Users"}
              </span>
            </div>
            <input
              id="team-size-slider"
              type="range"
              min="1"
              max="100"
              aria-label="Team size in users"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 h-2 bg-[var(--card-border)] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1 font-mono">
              <span>1 user</span>
              <span>25 users</span>
              <span>50 users</span>
              <span>100 users</span>
            </div>
          </div>
        </div>

        {/* Savings Result Card */}
        <div className="bg-[var(--background)]/80 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Estimated Annual Savings
            </p>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mt-2 font-mono">
              ${annualSavingsUSD.toLocaleString()}/yr
            </div>
            <p className="text-xs text-emerald-400/90 mt-1 font-semibold">
              {pdftoolsPlan === "free"
                ? "Using 100% free client-side core tools with zero subscription cost"
                : `Saving vs ${selectedCompetitor.name} with full Premium workspace & pro tools`}
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--card-border)] text-xs text-[var(--muted)] space-y-1.5">
            <div className="flex justify-between">
              <span>{selectedCompetitor.name} Total:</span>
              <span className="line-through text-red-400 font-mono">${competitorAnnualTotal.toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--foreground)]">
              <span>PDFTools ({pdftoolsPlan === "free" ? "Free" : "Premium"}):</span>
              <span className="text-emerald-400 font-mono">
                {pdftoolsPlan === "free" ? "$0" : `$${pdfToolsAnnualTotal.toLocaleString()}/yr (${PRICING_CONFIG.currency} ${(teamSize * PRICING_CONFIG.yearly.amount).toLocaleString()}/yr)`}
              </span>
            </div>
          </div>

          <div className="pt-2">
            {pdftoolsPlan === "free" ? (
              <Link
                href="/tools"
                className="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-2xl hover:opacity-95 transition-all text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.99]"
              >
                Explore 38 Free Core Tools
              </Link>
            ) : (
              <Link
                href="/premium"
                className="block w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold rounded-2xl hover:opacity-95 transition-all text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99]"
              >
                View Premium Plans ({PRICING_CONFIG.yearly.priceFormatted}/yr)
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
