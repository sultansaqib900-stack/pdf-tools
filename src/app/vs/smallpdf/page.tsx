import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "SmallPDF vs PDFTools - Free Unlimited Browser PDF Editor",
  description: "Compare SmallPDF ($108/yr) vs PDFTools. No daily 2-file limit, no 60-minute wait queues, and 100% private in-browser document processing.",
};

export default function VsSmallpdfPage() {
  const comparisonRows = [
    { feature: "Free Daily Limit", competitor: "Only 2 documents / day", pdfTools: "High Daily Allowance", win: true },
    { feature: "Wait Queue / Timers", competitor: "Forced 60-minute wait timers", pdfTools: "Instant Client Processing", win: true },
    { feature: "Privacy & Cloud Storage", competitor: "Documents stored in remote cloud", pdfTools: "100% In-Browser RAM (Zero Uploads)", win: true },
    { feature: "Chained Operations", competitor: "Siloed tool pages", pdfTools: "PDF Studio Multi-Step Pipeline", win: true },
    { feature: "Annual Price", competitor: "$108 / year per user", pdfTools: "$0 / Lifetime Free", win: true },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <SoftwareAppJsonLd
        name="PDFTools - SmallPDF Alternative"
        description="Private in-browser alternative to SmallPDF without wait limits."
        url="https://allaboutpdfediting.xyz/vs/smallpdf"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "Compare", item: "https://allaboutpdfediting.xyz/vs" },
          { name: "SmallPDF Alternative", item: "https://allaboutpdfediting.xyz/vs/smallpdf" },
        ]}
      />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
          ⚔️ SmallPDF Alternative
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          SmallPDF vs. PDFTools
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Never hit a &quot;Daily limit reached, wait 60 minutes&quot; screen again. Unlimited in-browser speed and complete air-gapped document privacy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/studio"
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 text-sm transition"
          >
            ⚡ Open Free PDF Studio
          </Link>
          <Link
            href="/compress"
            className="px-6 py-3.5 bg-[var(--card)] border border-[var(--card-border)] hover:border-indigo-500 text-[var(--foreground)] font-bold rounded-2xl text-sm transition"
          >
            📦 Instant Compress
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <h2 className="text-xl font-extrabold text-[var(--foreground)] mb-6 text-center sm:text-left">
          SmallPDF vs PDFTools Feature Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--muted)] uppercase text-[10px] sm:text-xs">
                <th className="py-3 px-4 font-extrabold">Feature</th>
                <th className="py-3 px-4 font-extrabold text-pink-400">SmallPDF</th>
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

      <SavingsCalculator />
    </div>
  );
}
