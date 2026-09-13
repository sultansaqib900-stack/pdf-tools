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
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold mb-6 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>⚡ Next-Gen 100% Client-Side PDF Engine · Zero Uploads</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--foreground)] mb-6 leading-[1.1]">
          Edit, Convert &amp; Pipeline <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Any PDF in Seconds
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Compress, merge, split, annotate, e-sign, and chain operations in one continuous session. Your documents never leave your browser.
        </p>

        {/* Interactive Quick-Drop Studio Launcher */}
        <div className="max-w-xl mx-auto mb-10">
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer bg-[var(--card)]/80 backdrop-blur-xl ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20 scale-102"
                : "border-[var(--card-border)] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
            }`}
          >
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 animate-pulse">
                {uploading ? "⏳" : "⚡"}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {uploading ? "Loading PDF into Studio..." : "Drop PDF here to launch Studio Pipeline"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  or click to browse from device · Delete pages, sign, watermark &amp; compress in 1 go
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/studio"
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold text-sm rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
          >
            <span>⚡ Open Unified PDF Studio</span>
            <span>→</span>
          </Link>
          <Link
            href="/recipes"
            className="px-6 py-4 bg-purple-600/15 border border-purple-500/30 text-purple-400 hover:text-purple-300 font-extrabold text-sm rounded-2xl transition-all"
          >
            ⚡ 1-Click Recipes
          </Link>
          <Link
            href="/pii-guardian"
            className="px-6 py-4 bg-red-600/15 border border-red-500/30 text-red-400 hover:text-red-300 font-extrabold text-sm rounded-2xl transition-all"
          >
            🛡️ PII Auto-Redact
          </Link>
          <Link
            href="/vs/adobe-acrobat"
            className="px-6 py-4 border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500 text-[var(--foreground)] font-bold text-sm rounded-2xl transition-all"
          >
            ⚔️ vs Adobe Pro
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--muted)]">
          {[
            { icon: "🔒", label: "100% Client-Side Privacy" },
            { icon: "⚡", label: "WebAssembly Acceleration" },
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
    "PDFTools - Free Online PDF Editor | Compress, Merge, Split, Convert & Premium PDF Tools",
    "40+ free online PDF tools including premium features: document comparison, certificate generation, PDF-to-audio, booklet creation, QR codes, and more. 100% free, no uploads, all processing happens in your browser."
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
              className="p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-[var(--card)] to-purple-950/30 hover:border-indigo-500 hover:scale-[1.02] transition-all shadow-xl group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Flagship Pipeline
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-indigo-400 transition">
                PDF Studio Workspace
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Reorder, delete pages, sign, watermark, and compress in one smooth continuous flow without re-uploading.
              </p>
            </Link>

            {/* Spotlight 2: PII Guardian */}
            <Link
              href="/pii-guardian"
              className="p-6 rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-[var(--card)] to-rose-950/30 hover:border-red-500 hover:scale-[1.02] transition-all shadow-xl group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Killer Feature
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-red-400 transition">
                PII Guardian Auto-Redact
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                1-Click scanner for Social Security Numbers, credit cards, emails, and phone numbers with 100% browser privacy.
              </p>
            </Link>

            {/* Spotlight 3: PDF Recipes */}
            <Link
              href="/recipes"
              className="p-6 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-[var(--card)] to-blue-950/30 hover:border-purple-500 hover:scale-[1.02] transition-all shadow-xl group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Zapier for PDFs
              </span>
              <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-2 mb-1 group-hover:text-purple-400 transition">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-3 inline-block">
                Continuous Operations Engine
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
                Stop Re-Uploading Your PDF For Every Small Edit
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Traditional PDF websites make you download, re-upload, and wait for every single action. With PDFTools, your PDF moves through an instant pipeline in real-time.
              </p>
            </div>

            {/* Workflow Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* The Old Way */}
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/10 text-xs space-y-3">
                <p className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✕</span> Traditional PDF Websites (Slow &amp; Tedious)
                </p>
                <div className="space-y-2 opacity-75 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">1. Upload PDF to server &amp; wait for slow queue</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">2. Delete pages &amp; download result to hard drive</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">3. Re-upload same file to add a visible e-signature</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">4. Download again, re-upload for compression</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">5. 10 minutes wasted + files stored on random servers</div>
                </div>
              </div>

              {/* PDFTools Studio Way */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 text-xs space-y-3 shadow-lg shadow-emerald-500/5">
                <p className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span> PDFTools Studio Pipeline (Instant &amp; Private)
                </p>
                <div className="space-y-2 text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">1. Drop PDF once — loaded into local browser memory</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">2. Delete &amp; rotate pages with visual thumbnails</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">3. Stamp your e-signature on page 1 without reloading</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">4. Add watermark &amp; compress in the exact same workspace</div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-center">
                    Done in 15 seconds · 100% Private
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
              >
                Try the PDF Studio Pipeline Free →
              </Link>
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
                  <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition mb-2">
                    {cluster.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {cluster.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--card-border)]/50 text-xs font-semibold text-indigo-400 flex items-center justify-between">
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
          { question: "Is PDFTools truly free?", answer: "Yes! All core tools (Compress, Merge, Split, e-Sign, Watermark, Delete Pages, Rotate) are 100% free with generous daily limits. Premium plans are available for heavy batch operations." },
          { question: "Are my PDF files uploaded to your servers?", answer: "No! All PDF processing, page reordering, OCR, and compression happens locally inside your web browser using WebAssembly. Your files never leave your computer." },
          { question: "What is the PDF Studio Pipeline?", answer: "PDF Studio is our flagship workspace that lets you perform multi-step edits (delete pages -> rotate -> sign -> watermark -> compress) on a single document without downloading and re-uploading at each step." },
          { question: "What is the PII Guardian?", answer: "PII Guardian is a 1-click in-browser privacy scanner that automatically detects and burns blackout redactions for Social Security Numbers, credit cards, emails, and phone numbers before sharing." },
        ]}
      />
    </div>
  );
}
