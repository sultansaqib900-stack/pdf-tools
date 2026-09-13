import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Adobe Acrobat Pro vs PDFTools - The Private, Free Alternative",
  description: "Compare Adobe Acrobat Pro ($240/yr) vs PDFTools. 100% in-browser privacy, zero cloud document uploads, multi-step Studio, and PII auto-redaction.",
};

export default function VsAdobePage() {
  const comparisonRows = [
    { feature: "Annual Cost per User", adobe: "$240 - $360 / year", pdfTools: "$0 / Lifetime Free", winner: "pdfTools" },
    { feature: "Document Privacy & Security", adobe: "Uploaded to Adobe Cloud servers", pdfTools: "100% Local Browser RAM (0 KB Uploaded)", winner: "pdfTools" },
    { feature: "HIPAA & GDPR Compliance", adobe: "Requires enterprise BAA contract", pdfTools: "Air-Gapped Zero-Server Guarantee", winner: "pdfTools" },
    { feature: "1-Click PII Auto-Redaction", adobe: "Manual blackout drawing only", pdfTools: "Automated Regex & Pattern Detection", winner: "pdfTools" },
    { feature: "Macro Workflow Automation", adobe: "Complex Action Wizard", pdfTools: "1-Click PDF Recipes (The Zapier for PDFs)", winner: "pdfTools" },
    { feature: "Multi-Step Chained Workspace", adobe: "Bulky multi-window desktop app", pdfTools: "Lightweight In-Browser Studio", winner: "pdfTools" },
    { feature: "Installation & System Load", adobe: "Large desktop installation", pdfTools: "Browser app with optional install shortcut", winner: "pdfTools" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <SoftwareAppJsonLd
        name="PDFTools - Adobe Acrobat Alternative"
        description="Free, private in-browser alternative to Adobe Acrobat Pro."
        url="https://allaboutpdfediting.xyz/vs/adobe-acrobat"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "Compare", item: "https://allaboutpdfediting.xyz/vs" },
          { name: "Adobe Acrobat Alternative", item: "https://allaboutpdfediting.xyz/vs/adobe-acrobat" },
        ]}
      />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          ⚔️ Head-to-Head Comparison
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          Adobe Acrobat Pro vs. PDFTools
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Why pay $240/year per person when you can edit, sign, auto-redact, and compress documents with complete air-gapped privacy for free?
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/studio"
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 text-sm transition"
          >
            ⚡ Open Free PDF Studio
          </Link>
          <Link
            href="/pii-guardian"
            className="px-6 py-3.5 bg-[var(--card)] border border-[var(--card-border)] hover:border-indigo-500 text-[var(--foreground)] font-bold rounded-2xl text-sm transition"
          >
            🛡️ Try PII Guardian
          </Link>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <h2 className="text-xl font-extrabold text-[var(--foreground)] mb-6 text-center sm:text-left">
          Side-by-Side Feature Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--muted)] uppercase text-[10px] sm:text-xs">
                <th className="py-3 px-4 font-extrabold">Capability</th>
                <th className="py-3 px-4 font-extrabold text-red-400">Adobe Acrobat Pro</th>
                <th className="py-3 px-4 font-extrabold text-emerald-400">PDFTools Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--background)]/50 transition">
                  <td className="py-4 px-4 font-bold text-[var(--foreground)]">{row.feature}</td>
                  <td className="py-4 px-4 text-[var(--muted)] font-medium">{row.adobe}</td>
                  <td className="py-4 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span> {row.pdfTools}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Calculator */}
      <SavingsCalculator />
    </div>
  );
}
