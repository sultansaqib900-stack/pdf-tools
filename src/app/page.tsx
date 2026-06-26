"use client";

import { usePageMeta } from "@/hooks/usePageMeta";
import ToolGrid from "@/components/ToolGrid";
import LiveStats from "@/components/LiveStats";
import EmailSubscribe from "@/components/EmailSubscribe";
import FeedbackSection from "@/components/FeedbackSection";
import RecentTools from "@/components/RecentTools";
import PremiumFeatureShowcase from "@/components/PremiumFeatureShowcase";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import { useEffect, useRef, useState } from "react";

function AnimatedHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        });
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section ref={heroRef} className="bg-gradient-hero text-white py-20 px-4 relative overflow-hidden">
      {/* Animated floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-floatSlow" style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s", transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s", transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -8}px)` }} />
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-cyan-300/10 rounded-full blur-3xl animate-floatSlow" style={{ animationDelay: "1s", transform: `translate(${mousePos.x * 8}px, ${mousePos.y * -12}px)` }} />
      </div>

      {/* Animated grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Floating decorative particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-float"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          100% Free — No Signup Needed
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-scaleIn">
          Free Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-200 to-white">PDF Tools</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 animate-slideUp">
          Compress, merge, split, convert, and edit PDFs instantly in your browser.
          No uploads — everything stays on your device. 100% private.
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-sm animate-fadeIn animate-delay-200">
          {["🔒 No Uploads Ever", "⚡ Instant Processing", "🌐 No Install", "💯 Free", "🖥️ 40+ Tools"].map(
            (tag, i) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {tag}
              </span>
            )
          )}
        </div>

        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-sm font-medium animate-scaleIn animate-delay-300 hover:bg-emerald-500/30 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Your files never leave your device. 100% private, always.
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

      <section className="max-w-6xl mx-auto px-4 -mt-6 mb-12">
        <ToolGrid />
      </section>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <PremiumFeatureShowcase />
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Popular PDF Tools</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                <div key={tool.name} className="flex flex-col card-hover rounded-lg">
                  <a href={tool.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition font-medium">
                    <span className="text-base">{tool.icon}</span>
                    {tool.name}
                  </a>
                  <a href={tool.blog} className="text-xs text-indigo-500 hover:underline mt-1 ml-1 transition hover:translate-x-0.5">
                    Read guide &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Latest from Our Blog</h2>
            <p className="text-sm text-[var(--muted)] mb-6">Tips and guides to get the most out of PDFTools.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "How to Compress PDF Without Losing Quality", slug: "compress-pdf-without-losing-quality" },
                { title: "How to Merge Multiple PDFs Into One", slug: "merge-multiple-pdfs-into-one" },
                { title: "How to Split PDF Pages Online Free", slug: "split-pdf-pages-online" },
                { title: "How to Sign a PDF Without Printing", slug: "sign-pdf-without-printing" },
                { title: "How to Password Protect a PDF", slug: "protect-pdf-with-password" },
                { title: "How to Remove Password from PDF", slug: "remove-password-from-pdf" },
              ].map((post, i) => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="block p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/30 hover:shadow-md transition card-hover" style={{ animationDelay: `${i * 80}ms` }}>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{post.title}</h3>
                </a>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a href="/blog" className="text-sm text-indigo-500 hover:underline font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">View all articles <span>&rarr;</span></a>
            </div>
          </div>
        </section>
      </SectionReveal>

      <RecentTools />

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
              Why <span className="text-gradient">PDFTools</span>?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "100% Free", desc: "No hidden fees or credit card required. All basic tools are completely free.", icon: "🎯" },
                { title: "Private & Secure", desc: "Files process in your browser. Never uploaded to any server. Zero data leaves your device.", icon: "🔒" },
                { title: "Fast Processing", desc: "Powered by WebAssembly. Large files process in seconds, not minutes.", icon: "⚡" },
                { title: "Works Everywhere", desc: "Compatible with Chrome, Firefox, Safari, and Edge on desktop and mobile.", icon: "🌍" },
              ].map((item) => (
                <div key={item.title} className="card-hover p-4 rounded-xl hover:bg-[var(--background)] transition">
                  <div className="text-3xl mb-3 animate-float" style={{ animationDuration: "3s" }}>{item.icon}</div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="border border-[var(--card-border)] rounded-xl p-8 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Privacy Matters</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">How It Works</h3>
                <ol className="space-y-3 text-sm text-[var(--muted)]">
                  {["Select your PDF file from your device", "Processing happens instantly in your browser using WebAssembly &mdash; no server involved", "Download the result. Your original file is never stored or transmitted"].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 card-hover rounded-lg p-2 -ml-2">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 text-xs">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{ __html: step }} />
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Why Trust Us</h3>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {["No file uploads &mdash; everything runs client-side", "No account or signup required", "Files never leave your device", "No data collection or tracking of your documents", "Open-source libraries with audited security", "No cookies required for PDF processing"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 hover:translate-x-1 transition"><span className="text-emerald-500">&#10003;</span> <span dangerouslySetInnerHTML={{ __html: item }} /></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="border border-[var(--card-border)] rounded-xl p-8 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10 dark:to-transparent card-hover">
            <LiveStats />
          </div>
        </section>
      </SectionReveal>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <FeedbackSection />
      </section>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                { q: "Are my files uploaded to a server?", a: "No. All PDF processing happens entirely in your browser using WebAssembly. Your files never leave your device. We cannot access, store, or see your documents." },
                { q: "Do I need to create an account?", a: "No account or signup required. All tools are free and work instantly without registration." },
                { q: "What is the maximum file size?", a: "Free users can process files up to 10MB. Premium users get up to 100MB file support with faster processing." },
                { q: "Is there a limit on how many files I can process?", a: "Free users can process one file at a time. Premium subscribers get batch processing with up to 20 files simultaneously." },
                { q: "What premium features are available?", a: "Premium includes PDF comparison, certificate generation, PDF-to-audio, form data extraction, bulk rename, booklet creator, search & redact, color inverter, secure vault, QR code stamp, and metadata sanitizer." },
                { q: "Which browsers are supported?", a: "PDFTools works on Chrome, Firefox, Safari, and Edge on both desktop and mobile devices." },
                { q: "How is PDFTools free?", a: "We display non-intrusive ads to cover costs. Premium subscriptions remove ads and unlock advanced features for users who want an ad-free experience." },
              ].map((faq) => (
                <details key={faq.q} className="group border border-[var(--card-border)] rounded-xl overflow-hidden transition-all duration-200 hover:border-indigo-500/20 open:border-indigo-500/30 open:shadow-md">
                  <summary className="px-5 py-3.5 font-medium text-sm text-[var(--foreground)] cursor-pointer hover:bg-[var(--background)] transition list-none flex items-center justify-between">
                    {faq.q}
                    <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--card-border)] pt-3 animate-slideUp">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <EmailSubscribe />
      </section>
      <FaqPageJsonLd />
    </div>
  );
}
