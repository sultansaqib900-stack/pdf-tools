"use client";

import { usePageMeta } from "@/hooks/usePageMeta";
import ToolGrid from "@/components/ToolGrid";
import ToolSearch from "@/components/ToolSearch";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { setPipelineDocument } from "@/lib/pdfPipeline";

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
    if (!f || f.type !== "application/pdf") return;
    setUploading(true);
    const ab = await f.arrayBuffer();
    await setPipelineDocument(new Uint8Array(ab), f.name);
    router.push("/studio");
  }, [router]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") return;
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
          Edit, Convert & Pipeline <br className="hidden sm:inline" />
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
                  or click to browse from device · Delete pages, sign, watermark & compress in 1 go
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
            href="/tools"
            className="px-8 py-4 border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--card-border)]/50 text-[var(--foreground)] font-bold text-sm rounded-2xl transition-all active:scale-95"
          >
            Explore All 40+ Tools
          </Link>
          <Link
            href="/premium"
            className="px-6 py-4 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-500 hover:text-amber-400 font-extrabold text-sm rounded-2xl transition-all"
          >
            ⭐ View Premium Tools
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
                  <span>✕</span> Traditional PDF Websites (Slow & Tedious)
                </p>
                <div className="space-y-2 opacity-75 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">1. Upload PDF to server & wait for slow queue</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">2. Delete pages & download result to hard drive</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">3. Re-upload same file to add digital signature</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">4. Download again, re-upload for compression</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-red-500/10">5. 10 minutes wasted + files stored on random servers</div>
                </div>
              </div>

              {/* PDFTools Studio Way */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 text-xs space-y-3 shadow-lg shadow-emerald-500/5">
                <p className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span> PDFTools Studio Pipeline (Instant & Private)
                </p>
                <div className="space-y-2 text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">1. Drop PDF once — loaded into local browser memory</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">2. Delete & rotate pages with visual thumbnails</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">3. Stamp your e-signature on page 1 without reloading</div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 font-medium">4. Add watermark & compress in the exact same workspace</div>
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

      {/* Premium Feature Showcase */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <PremiumFeatureShowcase />
        </section>
      </SectionReveal>

      {/* Popular Tools & Guides Hub (Internal Linking Engine) */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 sm:p-10 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-2">
              Popular Tools & How-To Guides
            </h2>
            <p className="text-sm text-[var(--muted)] mb-8">
              Step-by-step guides and instant utilities for every document task.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "Compress PDF", href: "/compress", blog: "/blog/compress-pdf-without-losing-quality", icon: "📦" },
                { name: "Merge PDF", href: "/merge", blog: "/blog/merge-multiple-pdfs-into-one", icon: "🔗" },
                { name: "Split PDF", href: "/split", blog: "/blog/split-pdf-pages-online", icon: "✂️" },
                { name: "Image to PDF", href: "/image-to-pdf", blog: "/blog/convert-image-to-pdf", icon: "🖼️" },
                { name: "PDF to Excel", href: "/pdf-to-excel", blog: "/blog/convert-pdf-to-excel", icon: "📊" },
                { name: "PDF to Images", href: "/pdf-to-images", blog: "/blog/convert-pdf-to-images", icon: "📸" },
                { name: "Extract Text", href: "/extract-text", blog: "/blog/extract-text-from-pdf", icon: "📝" },
                { name: "Sign PDF", href: "/sign", blog: "/blog/sign-pdf-without-printing", icon: "✍️" },
                { name: "Protect PDF", href: "/protect", blog: "/blog/protect-pdf-with-password", icon: "🔒" },
                { name: "Unlock PDF", href: "/unlock", blog: "/blog/remove-password-from-pdf", icon: "🔓" },
                { name: "Rotate PDF", href: "/rotate", blog: "/blog/rotate-pdf-pages-online", icon: "🔄" },
                { name: "Organize PDF", href: "/organize", blog: "/blog/organize-pdf-pages", icon: "📑" },
              ].map((tool) => (
                <div key={tool.name} className="flex flex-col p-4 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/40 transition-all group">
                  <Link href={tool.href} className="flex items-center gap-2.5 text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition mb-2">
                    <span className="text-xl">{tool.icon}</span>
                    <span>{tool.name}</span>
                  </Link>
                  <Link href={tool.blog} className="text-xs text-indigo-400 hover:underline mt-auto flex items-center gap-1 font-medium">
                    <span>Read tutorial</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Target Audiences & Use Cases (Deep Internal Linking) */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 sm:p-10 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-2">
              PDF Solutions Built for Your Workflow
            </h2>
            <p className="text-sm text-[var(--muted)] mb-8">
              Tailored document processing configurations for students, legal teams, businesses, and educators.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "PDF Tools for College Students", href: "/pdf-tools-for-students", icon: "🎓", desc: "Compress thesis & merge research notes" },
                { name: "PDF Tools for Lawyers & Legal", href: "/pdf-tools-for-lawyers", icon: "⚖️", desc: "Bates numbering, search redact & diff" },
                { name: "PDF Tools for Teachers", href: "/pdf-tools-for-teachers", icon: "🍎", desc: "Generate certificates & split chapters" },
                { name: "PDF Tools for Small Business", href: "/pdf-tools-for-small-business", icon: "🏪", desc: "e-Sign contracts & scan receipts" },
              ].map((uc) => (
                <Link
                  key={uc.href}
                  href={uc.href}
                  className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/40 hover:shadow-lg transition-all group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{uc.icon}</div>
                  <h3 className="font-bold text-sm text-[var(--foreground)] group-hover:text-indigo-400 transition mb-1">{uc.name}</h3>
                  <p className="text-xs text-[var(--muted)]">{uc.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Recent Tools Used (if available) */}
      <RecentTools />

      {/* Live Global Processing Statistics */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="border border-[var(--card-border)] rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-emerald-500/10 via-[var(--card)] to-teal-500/10 shadow-xl">
            <LiveStats />
          </div>
        </section>
      </SectionReveal>

      {/* Verified User Reviews & Testimonials */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <FeedbackSection />
      </section>

      {/* Structured Interactive FAQs */}
      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8 sm:p-10 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: "How does the Unified PDF Studio pipeline work?", a: "PDF Studio allows you to load your PDF once and chain multiple operations (e.g. deleting pages, rotating orientation, adding an electronic signature, watermarking, and compressing) all in one session without re-uploading between every step." },
                { q: "Are my PDF files uploaded to any servers?", a: "No. All PDF processing is executed 100% locally inside your web browser using WebAssembly and JavaScript. Your documents and sensitive data never leave your device." },
                { q: "Is PDFTools really free to use?", a: "Yes! All basic tools including Merge, Split, Compress, Sign, and Edit are completely free without requiring an account or credit card." },
                { q: "What is included with PDFTools Premium?", a: "Premium gives you 13 exclusive tools (Side-by-side PDF Diff, Legal Bates Numbering, Bulk Certificate Generator, PDF-to-Audio TTS, AcroForm data extraction, Search & Redact, Encrypted Vault, and Bookmark Splitting) with up to 100MB file limits and zero ads." },
                { q: "Can I use PDFTools on my mobile phone or tablet?", a: "Yes, PDFTools is fully responsive and works natively in Safari, Chrome, and Firefox on iOS, Android, macOS, Windows, and Linux." },
              ].map((faq) => (
                <details key={faq.q} className="group border border-[var(--card-border)] rounded-2xl overflow-hidden transition-all duration-200 hover:border-indigo-500/30 open:border-indigo-500/40">
                  <summary className="px-6 py-4 font-bold text-sm text-[var(--foreground)] cursor-pointer hover:bg-[var(--card-border)]/30 transition list-none flex items-center justify-between">
                    <span>{faq.q}</span>
                    <svg className="w-4 h-4 text-indigo-400 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--card-border)]/50 pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Newsletter Subscription */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <EmailSubscribe />
      </section>

      <FaqPageJsonLd />
    </div>
  );
}
