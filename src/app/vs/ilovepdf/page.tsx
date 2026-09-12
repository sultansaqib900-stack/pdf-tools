import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "iLovePDF vs PDFTools - Why Local Zero-Knowledge Processing Wins",
  description: "Compare iLovePDF vs PDFTools. Eliminate cloud upload risks, avoid 4-step re-upload loops, and automate multi-step workflows in 1 click.",
};

export default function VsIlovepdfPage() {
  const comparisonRows = [
    { feature: "Privacy & Cloud Uploads", competitor: "Files sent to remote cloud servers", pdfTools: "100% Client-Side (0 KB Uploaded)", win: true },
    { feature: "Multi-Step Chaining", competitor: "Must download & re-upload 4 separate files", pdfTools: "Continuous In-Memory Studio Pipeline", win: true },
    { feature: "Automated Macro Recipes", competitor: "None (Siloed individual tools)", pdfTools: "1-Click PDF Recipes (Zapier for PDFs)", win: true },
    { feature: "PII Auto-Detection", competitor: "Manual search only", pdfTools: "1-Click Regex PII Guardian", win: true },
    { feature: "Daily Free Usage Limit", competitor: "Rate limits & ads", pdfTools: "High Limits + Zero Ads", win: true },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <SoftwareAppJsonLd
        name="PDFTools - iLovePDF Alternative"
        description="Zero-knowledge private alternative to iLovePDF."
        url="https://allaboutpdfediting.xyz/vs/ilovepdf"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "Compare", item: "https://allaboutpdfediting.xyz/vs" },
          { name: "iLovePDF Alternative", item: "https://allaboutpdfediting.xyz/vs/ilovepdf" },
        ]}
      />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          ⚔️ iLovePDF Alternative
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          iLovePDF vs. PDFTools
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Stop downloading and re-uploading the same file four times. Process everything continuously in your browser with zero server uploads.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/studio"
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 text-sm transition"
          >
            ⚡ Open PDF Studio
          </Link>
          <Link
            href="/recipes"
            className="px-6 py-3.5 bg-[var(--card)] border border-[var(--card-border)] hover:border-indigo-500 text-[var(--foreground)] font-bold rounded-2xl text-sm transition"
          >
            ⚡ Try 1-Click Recipes
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <h2 className="text-xl font-extrabold text-[var(--foreground)] mb-6 text-center sm:text-left">
          Core Differences
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--muted)] uppercase text-[10px] sm:text-xs">
                <th className="py-3 px-4 font-extrabold">Feature</th>
                <th className="py-3 px-4 font-extrabold text-amber-500">iLovePDF</th>
                <th className="py-3 px-4 font-extrabold text-emerald-400">PDFTools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--background)]/50 transition">
                  <td className="py-4 px-4 font-bold text-[var(--foreground)]">{row.feature}</td>
                  <td className="py-4 px-4 text-[var(--muted)] font-medium">{row.competitor}</td>
                  <td className="py-4 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span> {row.pdfTools}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings */}
      <SavingsCalculator />
    </div>
  );
}
