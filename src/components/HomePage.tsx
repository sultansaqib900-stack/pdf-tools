"use client";

import { isPdfFile } from "@/lib/pdfBytes";

import { usePageMeta } from "@/hooks/usePageMeta";
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

const LiveStats = dynamic(() => import("@/components/LiveStats"));
const EmailSubscribe = dynamic(() => import("@/components/EmailSubscribe"));
const FeedbackSection = dynamic(() => import("@/components/FeedbackSection"));
const RecentTools = dynamic(() => import("@/components/RecentTools"));
const PremiumFeatureShowcase = dynamic(() => import("@/components/PremiumFeatureShowcase"));

function AnimatedHero() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  return (
    <section className="relative overflow-hidden pt-16 pb-20 px-4">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] text-xs font-bold mb-6">
          <span>{TOOL_CATALOG.length} PDF tools · Everything runs in your browser</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-5 leading-[1.15]">
          Every PDF tool you need, <span className="text-[var(--accent)]">free and in one place</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {FREE_TOOL_COUNT} core tools — merge, split, compress, OCR, e-sign, redact, convert, and organise — free and unlimited with no account. {PREMIUM_TOOL_COUNT} professional tools for legal and bulk work.
        </p>

        {/* Interactive Quick-Drop Studio Launcher */}
        <div className="max-w-xl mx-auto mb-10">
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors cursor-pointer bg-[var(--card)] ${
              isDragging
                ? "border-[var(--accent)] bg-indigo-50"
                : "border-[var(--card-border)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center text-2xl">
                {uploading ? "⏳" : "⚡"}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {uploading ? "Loading PDF into Studio..." : "Drop PDF here to launch the Studio Pipeline"}
                  <span className="ml-2 align-middle text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-white">Premium</span>
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  or click to browse · PDF Studio is included with Premium.
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/studio"
            className="px-7 py-3.5 bg-[var(--accent)] text-white font-bold text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            <span>Open PDF Studio</span>
            <span>→</span>
          </Link>
          <Link
            href="/recipes"
            className="px-5 py-3.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--card-hover-border)] font-bold text-sm rounded-lg transition-colors"
          >
            ⭐ Recipes · Free Preview
          </Link>
          <Link
            href="/pii-guardian"
            className="px-5 py-3.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--card-hover-border)] font-bold text-sm rounded-lg transition-colors"
          >
            ⭐ PII Scan · Free Preview
          </Link>
          <Link
            href="/vs/adobe-acrobat"
            className="px-5 py-3.5 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--card-hover-border)] text-[var(--foreground)] font-bold text-sm rounded-lg transition-colors"
          >
            ⚔️ vs Adobe Pro
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--muted)]">
          {[
            { icon: "🔒", label: "100% Client-Side Privacy" },
            { icon: "⚡", label: "Local Browser Processing" },
            { icon: "🆓", label: "No Signup Required" },
            { icon: "📁", label: "Zero Server Uploads" },
          ].map((badge) => (
            <span
              key={badge.label}
              className="px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center gap-1.5 shadow-sm"
            >
              <span>{badge.icon}</span>
              <span className="font-medium text-[var(--foreground)]">{badge.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {children}
    </div>
  );
}

export default function Home() {
  usePageMeta(
    "PDFTools - Free Online PDF Editor | 52 Online PDF Tools",
    "38 core PDF tools free and unlimited, plus 14 professional tools — led by the PDF Studio pipeline — for AI, automation, redaction, legal, and bulk workflows. Most document processing stays in your browser."
  );

  return (
    <div>
      <AnimatedHero />

      {/* Instant Search Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-4 mb-10">
        <ToolSearch />
      </section>

      {/* Flagship Breakthrough Spotlight Cards */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Spotlight 1: PDF Studio */}
            <Link
              href="/studio"
              className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--card-hover-border)] transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                ⚡
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-white">
                PDF Studio · Premium
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-[var(--accent)] transition">
                PDF Studio Workspace
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Included with Premium: reorder, delete pages, sign, watermark, protect, and compress in one session — yours to keep.
              </p>
            </Link>

            {/* Spotlight 2: PII Guardian */}
            <Link
              href="/pii-guardian"
              className="p-6 rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-[var(--card)] to-rose-950/30 hover:border-red-500 hover:scale-[1.02] transition-all shadow-xl group"
            >
              <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                🛡️
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Premium · Free Scan Preview
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-red-600 transition">
                PII Guardian Auto-Redact
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                1-Click scanner for Social Security Numbers, credit cards, emails, and phone numbers with 100% browser privacy.
              </p>
            </Link>

            {/* Spotlight 3: PDF Recipes */}
            <Link
              href="/recipes"
              className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--card-hover-border)] transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                ⚡
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Premium · 2 Free Recipes
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-purple-600 transition">
                1-Click Workflow Recipes
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Automate Court E-Filing, Executive Signoff, and Grant Review sequences in a single click locally.
              </p>
            </Link>
          </div>
        </section>
      </SectionReveal>

      {/* Interactive Workflow Pipeline Showcase Section */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <div className="p-8 sm:p-12 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500 text-white mb-3 inline-block">
                PDF Studio — included with Premium
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Stop Re-Uploading Your PDF For Every Small Edit
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)]">
                PDF Studio chains every step in one session. Load a document once, then organise, sign, and export — no downloading and re-uploading between steps:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Organize & delete pages", "Rotate", "e-Sign", "Watermark", "Protect (AES-256)", "Compress"].map((step) => (
                  <span key={step} className="text-xs font-semibold px-3 py-1.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Workflow Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* The Old Way */}
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/10 text-xs space-y-3">
                <p className="font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✕</span> Traditional PDF Websites (Slow &amp; Tedious)
                </p>
                <div className="space-y-2 text-[var(--muted)]">
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">1. Upload PDF to server &amp; wait for slow queue</div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">2. Delete pages &amp; download result to hard drive</div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">3. Re-upload same file to add a visible e-signature</div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">4. Download again, re-upload for compression</div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">5. 10 minutes wasted + files stored on random servers</div>
                </div>
              </div>

              {/* PDFTools Studio Way */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 text-xs space-y-3 shadow-lg shadow-emerald-500/5">
                <p className="font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span> PDFTools Studio Pipeline (Instant &amp; Private)
                </p>
                <div className="space-y-2 text-[var(--foreground)]">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 font-medium">1. Drop PDF once — loaded into local browser memory</div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 font-medium">2. Delete &amp; rotate pages with visual thumbnails</div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 font-medium">3. Stamp your e-signature on page 1 without reloading</div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 font-medium">4. Add watermark &amp; compress in the exact same workspace</div>
                  <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-bold text-center">
                    One session · Locally processed
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--accent)] text-white font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Open PDF Studio →
                </Link>
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-amber-500 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  ⭐ Get Premium
                </Link>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Three-day trial for PDF Studio only. Premium required afterwards. The 38 core tools stay free and unlimited.
              </p>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Main Tool Grid (Filtered by Categories) */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <ToolGrid />
      </section>

      {/* ROI & Savings Calculator Section */}
      <SectionReveal>
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <SavingsCalculator />
        </section>
      </SectionReveal>

      {/* Premium Feature Showcase */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <PremiumFeatureShowcase />
        </section>
      </SectionReveal>

      {/* Live Community Processing Stats */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <LiveStats />
        </section>
      </SectionReveal>

      {/* Audience Clusters & Solutions Directory */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-3">
              Engineered For Every Workflow
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Tailored solutions for students, lawyers, teachers, and small businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "For Students", href: "/pdf-tools-for-students", desc: "Compress thesis papers, merge research PDFs, extract study notes, and convert images.", icon: "🎓", gradient: "from-blue-500/20 to-indigo-500/20" },
              { title: "For Legal Teams", href: "/pdf-tools-for-lawyers", desc: "Add Bates numbering, redact sensitive client PII, compare contract versions, and e-sign.", icon: "⚖️", gradient: "from-purple-500/20 to-pink-500/20" },
              { title: "For Educators", href: "/pdf-tools-for-teachers", desc: "Generate bulk certificates from CSV data, split classroom assignments, and grade PDF docs.", icon: "📚", gradient: "from-emerald-500/20 to-teal-500/20" },
              { title: "For Businesses", href: "/pdf-tools-for-business", desc: "Extract financial tables into Excel, batch process receipts, and sanitize hidden metadata.", icon: "💼", gradient: "from-amber-500/20 to-orange-500/20" },
            ].map((cluster) => (
              <Link
                key={cluster.title}
                href={cluster.href}
                className="p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cluster.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {cluster.icon}
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition mb-2">
                    {cluster.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {cluster.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--card-border)] text-xs font-semibold text-[var(--accent)] flex items-center justify-between">
                  <span>Explore Solution</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* User Reviews & Feedback */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <FeedbackSection />
        </section>
      </SectionReveal>

      {/* Recent Tools History */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <RecentTools />
        </section>
      </SectionReveal>

      {/* Email Newsletter Subscription */}
      <SectionReveal>
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <EmailSubscribe />
        </section>
      </SectionReveal>

      {/* SEO FAQs */}
      <FaqPageJsonLd
        questions={[
          { question: "Is PDFTools truly free?", answer: "Yes! All core tools (Compress, Merge, Split, e-Sign, Watermark, Delete Pages, Rotate, and 30+ more) are 100% free and unlimited — no daily or monthly caps. Selected professional tools share a one-time 5-file lifetime trial. PDF Studio is included with Premium." },
          { question: "Are my PDF files uploaded to your servers?", answer: "Core PDF tools and PDF Studio process documents locally in your browser without uploading your PDFs. Optional AI chat sends extracted text, and AI OCR sends page images, to an AI service." },
          { question: "What is the PDF Studio Pipeline?", answer: "PDF Studio chains edits on one document without downloading and re-uploading between steps. PDF Studio is included with Premium and stays unlocked forever." },
          { question: "What is the PII Guardian?", answer: "PII Guardian detects common sensitive-data patterns locally. Free users can preview first-page matches; Premium can scan and securely raster-redact complete documents after review." },
        ]}
      />
    </div>
  );
}
