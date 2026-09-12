"use client";

import { useState } from "react";
import Link from "next/link";

export default function SavingsCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [competitor, setCompetitor] = useState<"adobe" | "ilovepdf" | "smallpdf">("adobe");

  const competitorPrices = {
    adobe: { name: "Adobe Acrobat Pro", annualPerSeat: 240, monthlyPerSeat: 20 },
    ilovepdf: { name: "iLovePDF Premium", annualPerSeat: 84, monthlyPerSeat: 7 },
    smallpdf: { name: "SmallPDF Pro", annualPerSeat: 108, monthlyPerSeat: 9 },
  };

  const selected = competitorPrices[competitor];
  const competitorAnnualTotal = teamSize * selected.annualPerSeat;
  const pdfToolsCost = 0; // Free / Lifetime flat
  const annualSavings = competitorAnnualTotal - pdfToolsCost;

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
          Compare total subscription costs against our 100% private, browser-based PDF suite.
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
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[var(--foreground)] uppercase">
                Team Size / Number of Seats:
              </label>
              <span className="text-base font-extrabold text-indigo-400 font-mono">
                {teamSize} {teamSize === 1 ? "User" : "Users"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
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
              ${annualSavings.toLocaleString()}/yr
            </div>
            <p className="text-xs text-emerald-400/90 mt-1 font-semibold">
              🎉 100% pure budget saved for your organization
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--card-border)] text-xs text-[var(--muted)] space-y-1.5">
            <div className="flex justify-between">
              <span>{selected.name} Total:</span>
              <span className="line-through text-red-400 font-mono">${competitorAnnualTotal.toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--foreground)]">
              <span>PDFTools Local Suite:</span>
              <span className="text-emerald-400 font-mono">$0 (Free &amp; Unlimited)</span>
            </div>
          </div>

          <Link
            href="/studio"
            className="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-2xl hover:opacity-95 transition-all text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.99]"
          >
            ⚡ Start Using Free PDF Studio Now
          </Link>
        </div>
      </div>
    </div>
  );
}
