"use client";

import { isPdfFile } from "@/lib/pdfBytes";
import { usePageMeta } from "@/hooks/usePageMeta";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import ToolGrid from "@/components/ToolGrid";
import ToolSearch from "@/components/ToolSearch";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { setPipelineDocument } from "@/lib/pdfPipeline";
import SavingsCalculator from "@/components/SavingsCalculator";
import { FREE_TOOL_COUNT, PREMIUM_TOOL_COUNT, TOOL_CATALOG } from "@/lib/toolCatalog";
import { PRICING_CONFIG, ANNUAL_SAVINGS } from "@/lib/pricing";

const LiveStats = dynamic(() => import("@/components/LiveStats"));
const EmailSubscribe = dynamic(() => import("@/components/EmailSubscribe"));
const FeedbackSection = dynamic(() => import("@/components/FeedbackSection"));
const RecentTools = dynamic(() => import("@/components/RecentTools"));

function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const { premium } = usePremiumStatus();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  usePageMeta(
    "PDFTools - Free Online PDF Editor | 51 Client-Side PDF Tools",
    "38 core PDF tools free and unlimited with local browser processing, plus 13 professional tools — including the PDF Studio pipeline — for legal, bulk, and security workflows."
  );

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !isPdfFile(f)) return;
    setUploading(true);
    const ab = await f.arrayBuffer();
    await setPipelineDocument(new Uint8Array(ab), f.name);
    router.push("/studio");
  }, [router]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !isPdfFile(f)) return;
    setUploading(true);
    const ab = await f.arrayBuffer();
    await setPipelineDocument(new Uint8Array(ab), f.name);
    router.push("/studio");
  }, [router]);

  const popularTools = [
    {
      name: "Compress PDF",
      desc: "Reduce file size while keeping text and images sharp.",
      href: "/compress",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      ),
      tag: "Popular",
    },
    {
      name: "Merge PDF",
      desc: "Combine multiple PDF files into one clean document.",
      href: "/merge",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="8" y="2" width="13" height="13" rx="2"/><path d="M5 8v11a2 2 0 0 0 2 2h11"/>
        </svg>
      ),
      tag: "Popular",
    },
    {
      name: "Split PDF",
      desc: "Extract specific page ranges or split each page into a separate file.",
      href: "/split",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      ),
      tag: "Popular",
    },
    {
      name: "Edit PDF",
      desc: "Add text overlays, dates, watermarks, notes, and visual markup.",
      href: "/edit-pdf",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      tag: "Essential",
    },
    {
      name: "Sign PDF",
      desc: "Draw, type, or stamp your signature onto any page.",
      href: "/sign",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 4.5l-2-2a2 2 0 0 0-2.8 0L3 15.2V21h5.8L20.5 7.3a2 2 0 0 0 0-2.8z"/><path d="M14.5 7.5l2 2"/>
        </svg>
      ),
      tag: "Essential",
    },
    {
      name: "PDF to Word",
      desc: "Extract text and tables from PDF directly into an editable Word document.",
      href: "/pdf-to-word",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      tag: "Convert",
    },
  ];

  return (
    <div>
      {/* 1. HERO SECTION: Concise headline + verified privacy */}
      <section className="pt-12 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Privacy Verification Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-xs text-[var(--muted)] mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[var(--foreground)]">Client-Side Privacy</span>
            <span>·</span>
            <span>Core tools run 100% in your browser</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-4 leading-tight">
            Every PDF tool you need, <br className="hidden sm:inline" />
            <span className="text-[var(--accent)]">processed locally in your browser</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
            {FREE_TOOL_COUNT} core tools free and unlimited with zero server file uploads. Plus {PREMIUM_TOOL_COUNT} advanced tools for professional workflows. No account or installation required.
          </p>

          {/* 2. PROMINENT ENTRY POINT: Top 6 Most Important Tools */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8 text-left">
            {popularTools.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                className="p-3.5 sm:p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-2.5 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                    {t.icon}
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-1">
                    {t.name}
                  </h2>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[var(--card-border)]/60 flex items-center justify-between text-[10px] font-semibold text-[var(--accent)]">
                  <span>Open Tool</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick-Drop PDF Studio Launcher */}
          <div className="max-w-xl mx-auto">
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer bg-[var(--card)] ${
                isDragging
                  ? "border-[var(--accent)] bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-[var(--card-border)] hover:border-[var(--accent)]"
              }`}
            >
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="flex items-center justify-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {uploading ? "⏳" : "⚡"}
                </span>
                <div className="text-left text-xs">
                  <span className="font-bold text-[var(--foreground)]">
                    {uploading ? "Loading into Studio..." : "Drop PDF here to open the Studio Pipeline"}
                  </span>
                  <span className="ml-2 align-middle text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white">PRO</span>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Multi-step editing in one continuous workspace without repeated file downloads.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* 3. SEARCHABLE TOOL DIRECTORY: ToolSearch */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <ToolSearch />
      </section>

      {/* 4. ORGANIZED TOOL DIRECTORY: ToolGrid by supported categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <ToolGrid />
      </section>

      {/* 5. CONCISE PDF STUDIO WORKSPACE SPOTLIGHT */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-sm">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <span>⚡ PDF Studio Pipeline</span>
                  <span>·</span>
                  <span>Included with Premium</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Stop downloading and re-uploading for every small edit
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  PDF Studio chains all your editing steps into a single browser session. Load your document once, then reorder pages, delete sections, apply e-signatures, stamp watermarks, and compress before exporting the final file.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Reorder Pages", "Delete & Rotate", "e-Signatures", "Watermarking", "AES-256 Encryption", "Compression"].map((step) => (
                    <span key={step} className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--card-border)]/50 text-[var(--foreground)]">
                      ✓ {step}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-5 bg-[var(--background)] p-5 rounded-xl border border-[var(--card-border)] text-center space-y-3">
                <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                  Continuous Workspace
                </div>
                <p className="text-xs text-[var(--foreground)] font-medium">
                  100% in-browser processing. Up to 100MB documents supported for Premium members.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/studio"
                    className="w-full py-2.5 bg-[var(--accent)] text-white font-bold text-xs rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                  >
                    Launch PDF Studio →
                  </Link>
                  <Link
                    href="/premium"
                    className="w-full py-2.5 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] text-[var(--foreground)] font-bold text-xs rounded-lg transition-colors"
                  >
                    View All Premium Tools &amp; Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 6. CLEAR FREE VS PREMIUM COMPARISON */}
      <SectionReveal>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-2">
              Simple, Transparent Plans
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Core PDF tools are genuinely free and unlimited. Upgrade when you need advanced legal, bulk, and studio workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Free Plan Card */}
            <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-[var(--card-border)] text-[var(--foreground)]">
                    Free Plan
                  </span>
                  <span className="text-lg font-extrabold text-[var(--foreground)]">$0 / forever</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  38 Unlimited Core Tools
                </h3>
                <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
                  Ideal for students, personal use, and day-to-day PDF tasks with full privacy.
                </p>
                <ul className="space-y-2 text-xs text-[var(--foreground)]">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>38 core tools: Compress, Merge, Split, e-Sign, Rotate, etc.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>No daily caps, monthly quotas, or account requirement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>100% client-side browser processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Files up to 10MB per task</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--muted)]">ℹ</span>
                    <span className="text-[var(--muted)]">Monetag vignette ads support free maintenance</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                <Link
                  href="/tools"
                  className="block text-center py-2.5 rounded-lg border border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
                >
                  Use Free Tools Now
                </Link>
              </div>
            </div>

            {/* Premium Plan Card */}
            <div className="p-6 rounded-2xl border-2 border-amber-500 bg-[var(--card)] shadow-sm flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
                Save 58% Yearly
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-amber-500 text-white">
                    Premium Member
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-[var(--foreground)]">{PRICING_CONFIG.yearly.priceFormatted}</span>
                    <span className="text-xs text-[var(--muted)]"> / year</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  PDF Studio &amp; 13 Professional Tools
                </h3>
                <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
                  For legal professionals, businesses, and power users who need advanced workflows.
                </p>
                <ul className="space-y-2 text-xs text-[var(--foreground)]">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span><strong>PDF Studio workspace:</strong> multi-step pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span><strong>13 advanced tools:</strong> Bates numbering, PDF Diff, PII Redaction, Booklets, Bulk Rename, etc.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>Large files up to 100MB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>100% Ad-Free experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>Monthly option available at {PRICING_CONFIG.monthly.priceFormatted}/month</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                {premium ? (
                  <Link
                    href="/dashboard"
                    className="block text-center py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    ✓ Premium Active — Open Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/premium"
                    className="block text-center py-2.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Upgrade to Premium →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* 7. AUDIENCE WORKFLOWS & TUTORIALS */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-2">
              Engineered for Every Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Tailored solutions and workflows for students, lawyers, teachers, and small businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "For Students", href: "/pdf-tools-for-students", desc: "Compress thesis papers, merge research citations, extract notes, and convert images.", icon: "🎓" },
              { title: "For Legal Teams", href: "/pdf-tools-for-lawyers", desc: "Sequential Bates numbering, contract Diff comparisons, client PII redaction, and e-signatures.", icon: "⚖️" },
              { title: "For Educators", href: "/pdf-tools-for-teachers", desc: "Bulk certificate generation from CSV rosters, split student tests, and organize classroom materials.", icon: "📚" },
              { title: "For Businesses", href: "/pdf-tools-for-business", desc: "Extract tabular financial reports to CSV/Excel, batch rename receipts, and sanitize metadata.", icon: "💼" },
            ].map((cluster) => (
              <Link
                key={cluster.title}
                href={cluster.href}
                className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="text-2xl mb-3">{cluster.icon}</div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1.5">
                    {cluster.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {cluster.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--card-border)]/60 text-xs font-semibold text-[var(--accent)] flex items-center justify-between">
                  <span>Explore Workflow</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* 8. SECONDARY SECTIONS: Savings Calculator */}
      <SectionReveal>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <SavingsCalculator />
        </section>
      </SectionReveal>

      {/* Community Processing Stats & Feedback */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <LiveStats />
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <FeedbackSection />
        </section>
      </SectionReveal>

      {/* Recent Tools History */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <RecentTools />
        </section>
      </SectionReveal>

      {/* Newsletter */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <EmailSubscribe />
        </section>
      </SectionReveal>

      {/* SEO FAQs */}
      <FaqPageJsonLd
        questions={[
          { question: "Is PDFTools truly free?", answer: "Yes! All 38 core tools (Compress, Merge, Split, e-Sign, Watermark, Delete Pages, Rotate, and 30+ more) are 100% free and unlimited — no daily or monthly caps. Selected professional tools share a one-time 5-file lifetime trial. PDF Studio is included with Premium." },
          { question: "Are my PDF files uploaded to your servers?", answer: "Core PDF tools and PDF Studio process documents locally in your browser without uploading your PDFs. Optional AI chat sends extracted text, and AI OCR sends page images, to an AI service." },
          { question: "What is the PDF Studio Pipeline?", answer: "PDF Studio chains edits on one document without downloading and re-uploading between steps. PDF Studio is included with Premium and stays unlocked forever." },
          { question: "What is the PII Guardian?", answer: "PII Guardian detects common sensitive-data patterns locally. Free users can preview first-page matches; Premium can scan and securely raster-redact complete documents after review." },
        ]}
      />
    </div>
  );
}