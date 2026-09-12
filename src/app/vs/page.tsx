import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "@/components/SavingsCalculator";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Compare PDF Tools - PDFTools vs Adobe, iLovePDF, SmallPDF",
  description: "Compare PDFTools against Adobe Acrobat Pro, iLovePDF, and SmallPDF. 100% client-side privacy, multi-step pipeline studio, and PII auto-redaction.",
};

export default function CompareIndexPage() {
  const competitors = [
    {
      name: "Adobe Acrobat Pro",
      slug: "adobe-acrobat",
      price: "$240/yr",
      tagline: "Expensive & heavy desktop install with cloud upload risks.",
      gradient: "from-red-500/20 to-orange-500/20",
      border: "hover:border-red-500",
    },
    {
      name: "iLovePDF",
      slug: "ilovepdf",
      price: "$84/yr",
      tagline: "Siloed tools requiring repeated file downloads and re-uploads.",
      gradient: "from-amber-500/20 to-yellow-500/20",
      border: "hover:border-amber-500",
    },
    {
      name: "SmallPDF",
      slug: "smallpdf",
      price: "$108/yr",
      tagline: "Strict 2-file daily limits with forced 60-minute wait queues.",
      gradient: "from-pink-500/20 to-rose-500/20",
      border: "hover:border-pink-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <SoftwareAppJsonLd
        name="PDFTools Competitor Comparison"
        description="Compare PDFTools against Adobe Acrobat Pro, iLovePDF, and SmallPDF."
        url="https://allaboutpdfediting.xyz/vs"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "Compare", item: "https://allaboutpdfediting.xyz/vs" },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          ⚔️ Market Comparison
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          How PDFTools Compares
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)]">
          Explore head-to-head comparisons showing how our zero-server architecture saves time, money, and security risks.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {competitors.map((c) => (
          <Link
            key={c.slug}
            href={`/vs/${c.slug}`}
            className={`p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] ${c.border} transition-all hover:scale-105 group shadow-xl flex flex-col justify-between`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-red-400 font-mono">{c.price}</span>
                <span className="text-xs font-extrabold text-emerald-400">PDFTools: $0</span>
              </div>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] group-hover:text-indigo-400 transition mb-2">
                vs. {c.name}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {c.tagline}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[var(--card-border)] text-xs font-bold text-indigo-400 flex items-center justify-between">
              <span>Read Full Breakdown</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      <SavingsCalculator />
    </div>
  );
}
