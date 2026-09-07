"use client";

import { usePageMeta } from "@/hooks/usePageMeta";
import ToolGrid from "@/components/ToolGrid";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import dynamic from "next/dynamic";

const LiveStats = dynamic(() => import("@/components/LiveStats"));
const EmailSubscribe = dynamic(() => import("@/components/EmailSubscribe"));
const FeedbackSection = dynamic(() => import("@/components/FeedbackSection"));
const RecentTools = dynamic(() => import("@/components/RecentTools"));
const PremiumFeatureShowcase = dynamic(() => import("@/components/PremiumFeatureShowcase"));

/**
 * Calm, confident hero.
 *
 * Replaces the previous version, which ran mouse-tracking parallax, four
 * blurred gradient blobs, six floating particles, an infinitely shifting
 * gradient, a grid overlay and two pulsing badges. The job of this section is
 * to say what the product is and get the user into a tool.
 */
function Hero() {
  return (
    <section className="relative border-b border-[var(--border)] bg-[var(--surface-subtle)] overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
        <span className="badge mb-5">
          <Icon name="shield" size={11} />
          Files never leave your browser
        </span>

        <h1 className="text-[2rem] sm:text-[2.75rem] font-semibold leading-[1.1] text-[var(--foreground)]">
          Every PDF tool you need,
          <br className="hidden sm:block" />{" "}
          <span className="text-[var(--muted)]">free and private</span>
        </h1>

        <p className="mt-4 text-[0.9375rem] sm:text-base leading-relaxed text-[var(--muted-strong)] max-w-xl mx-auto">
          Compress, merge, split, convert, edit and sign PDFs in seconds.
          Everything runs on your device — no uploads, no signup.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/tools" className="btn btn-primary btn-lg">
            Browse all tools
            <Icon name="arrowRight" size={15} />
          </Link>
          <Link href="/compress" className="btn btn-secondary btn-lg">
            Compress a PDF
          </Link>
        </div>

        <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.8125rem]">
          {[
            { k: "49", v: "free tools" },
            { k: "0", v: "files uploaded" },
            { k: "No", v: "signup needed" },
          ].map((s) => (
            <div key={s.v} className="flex items-baseline gap-1.5">
              <dt className="font-semibold text-[var(--foreground)]">{s.k}</dt>
              <dd className="text-[var(--muted)]">{s.v}</dd>
            </div>
          ))}
        </dl>
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

/** Consistent section shell: heading, optional lead, and a bordered surface. */
function Section({
  title, lead, children, className = "",
}: { title: string; lead?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`max-w-6xl mx-auto px-4 pb-14 ${className}`}>
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
      {lead && <p className="mt-1.5 text-[0.875rem] text-[var(--muted)]">{lead}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    "PDFTools - Free Online PDF Editor | Compress, Merge, Split, Convert & Premium PDF Tools",
    "40+ free online PDF tools including premium features: document comparison, certificate generation, PDF-to-audio, booklet creation, QR codes, and more. 100% free, no uploads, all processing happens in your browser."
  );

  return (
    <div>
      <Hero />

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16">
        <ToolGrid />
      </section>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <PremiumFeatureShowcase />
        </section>
      </SectionReveal>

      <SectionReveal>
        <Section title="Popular PDF tools" lead="The tools people reach for most, each with a step-by-step guide.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { name: "Compress PDF", href: "/compress", blog: "/blog/compress-pdf-without-losing-quality", icon: "compress" },
              { name: "Merge PDF", href: "/merge", blog: "/blog/merge-multiple-pdfs-into-one", icon: "merge" },
              { name: "Split PDF", href: "/split", blog: "/blog/split-pdf-pages-online", icon: "split" },
              { name: "Image to PDF", href: "/image-to-pdf", blog: "/blog/convert-image-to-pdf", icon: "image" },
              { name: "PDF to Excel", href: "/pdf-to-excel", blog: "/blog/convert-pdf-to-excel", icon: "fileSheet" },
              { name: "PDF to Images", href: "/pdf-to-images", blog: "/blog/convert-pdf-to-images", icon: "image" },
              { name: "Extract Text", href: "/extract-text", blog: "/blog/extract-text-from-pdf", icon: "fileText" },
              { name: "Sign PDF", href: "/sign", blog: "/blog/sign-pdf-without-printing", icon: "signature" },
              { name: "Protect PDF", href: "/protect", blog: "/blog/protect-pdf-with-password", icon: "lock" },
            ].map((tool) => (
              <div key={tool.name} className="card-interactive p-3.5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-[var(--r-md)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--muted-strong)]">
                  <Icon name={tool.icon as never} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={tool.href} className="block text-[0.875rem] font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors truncate">
                    {tool.name}
                  </Link>
                  <Link href={tool.blog} className="text-[0.75rem] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                    Read the guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <Section title="Popular use cases" lead="Guides written for how specific people actually work.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { name: "Compress PDF for students", href: "/for/compress-pdf-college-students" },
              { name: "Merge PDF for office workers", href: "/for/merge-pdf-office-workers" },
              { name: "Protect PDF for lawyers", href: "/for/protect-pdf-lawyers" },
              { name: "Split PDF for freelancers", href: "/for/split-pdf-freelancers" },
              { name: "Compress PDF for small business", href: "/for/compress-pdf-small-business-owners" },
              { name: "Merge PDF for lawyers", href: "/for/merge-pdf-lawyers" },
            ].map((uc) => (
              <Link key={uc.href} href={uc.href} className="card-interactive group flex items-center justify-between gap-3 px-3.5 py-3 text-[0.875rem] text-[var(--foreground)]">
                <span className="truncate">{uc.name}</span>
                <Icon name="chevronRight" size={14} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
            ))}
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <Section title="From the blog" lead="Tips and walkthroughs for getting more out of your PDFs.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { title: "Compress a PDF without losing quality", slug: "compress-pdf-without-losing-quality" },
              { title: "Merge multiple PDFs into one", slug: "merge-multiple-pdfs-into-one" },
              { title: "Split PDF pages online free", slug: "split-pdf-pages-online" },
              { title: "Sign a PDF without printing", slug: "sign-pdf-without-printing" },
              { title: "Password protect a PDF", slug: "protect-pdf-with-password" },
              { title: "Remove a password from a PDF", slug: "remove-password-from-pdf" },
            ].map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card-interactive group p-4">
                <h3 className="text-[0.875rem] font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.75rem] text-[var(--muted)]">
                  Read article
                  <Icon name="arrowRight" size={12} />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--accent)] hover:underline">
              View all articles
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </Section>
      </SectionReveal>

      <RecentTools />

      <SectionReveal>
        <Section title="Why PDFTools" lead="Built to be fast, private and genuinely free.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { title: "Completely free", desc: "No credit card, no trial period. Every core tool is free to use.", icon: "check" },
              { title: "Private by design", desc: "Files are processed in your browser and never uploaded to a server.", icon: "shield" },
              { title: "Fast", desc: "WebAssembly means large documents process in seconds, not minutes.", icon: "zap" },
              { title: "Works everywhere", desc: "Chrome, Firefox, Safari and Edge — on desktop and mobile.", icon: "globe" },
            ].map((item) => (
              <div key={item.title} className="surface-card p-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--r-md)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] mb-3">
                  <Icon name={item.icon as never} size={16} />
                </span>
                <h3 className="text-[0.875rem] font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <Section title="How your files stay private">
          <div className="grid md:grid-cols-2 gap-2.5">
            <div className="surface-card p-6">
              <h3 className="text-[0.875rem] font-semibold text-[var(--foreground)] mb-4">How it works</h3>
              <ol className="space-y-3.5">
                {[
                  "Choose a PDF from your device.",
                  "It is processed instantly in your browser using WebAssembly — no server is involved.",
                  "Download the result. The original is never stored or transmitted.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                    <span className="flex items-center justify-center w-5 h-5 shrink-0 mt-px rounded-full bg-[var(--surface-sunken)] border border-[var(--border)] text-[0.6875rem] font-semibold text-[var(--muted-strong)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="surface-card p-6">
              <h3 className="text-[0.875rem] font-semibold text-[var(--foreground)] mb-4">What that means</h3>
              <ul className="space-y-2.5">
                {[
                  "No file uploads — everything runs client-side",
                  "No account or signup required",
                  "Files never leave your device",
                  "No tracking of your document contents",
                  "Audited open-source libraries",
                  "No cookies required for processing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                    <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--success)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <section className="max-w-6xl mx-auto px-4 pb-14">
          <div className="surface-card p-6">
            <LiveStats />
          </div>
        </section>
      </SectionReveal>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <FeedbackSection />
      </section>

      <SectionReveal>
        <Section title="Frequently asked questions" className="max-w-3xl">
          <div className="space-y-1.5">
            {[
              { q: "Are my files uploaded to a server?", a: "No. All PDF processing happens in your browser using WebAssembly. Your files never leave your device — we cannot access, store or see your documents." },
              { q: "Do I need to create an account?", a: "No. Every core tool works instantly without registration." },
              { q: "What is the maximum file size?", a: "Free users can process files up to 10MB. Premium raises this to 100MB." },
              { q: "Is there a limit on how many files I can process?", a: "Free users process one file at a time. Premium adds batch processing for up to 20 files at once." },
              { q: "What do I get with Premium?", a: "PDF comparison, certificate generation, PDF-to-audio, form data extraction, bulk rename, booklet creator, search and redact, colour inverter, secure vault, QR stamping and metadata sanitising." },
              { q: "Which browsers are supported?", a: "Chrome, Firefox, Safari and Edge, on both desktop and mobile." },
              { q: "How is PDFTools free?", a: "Non-intrusive ads cover our costs. Premium removes ads and unlocks advanced tools." },
            ].map((faq) => (
              <details key={faq.q} className="group surface-card overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none text-[0.875rem] font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
                  {faq.q}
                  <Icon name="chevronDown" size={15} className="shrink-0 text-[var(--muted)] group-open:rotate-180 transition-transform duration-150" />
                </summary>
                <div className="px-4 pb-3.5 pt-0.5 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </Section>
      </SectionReveal>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <EmailSubscribe />
      </section>
      <FaqPageJsonLd />
    </div>
  );
}
