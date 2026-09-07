import type { Metadata } from "next";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErrorPages, getErrorPage } from "@/lib/error-pages";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";

const toolLinks: Record<string, { name: string; icon: string }> = {
  "repair-pdf": { name: "Repair PDF", icon: "🔧" },
  "unlock": { name: "Unlock PDF", icon: "🔓" },
  "compress": { name: "Compress PDF", icon: "📦" },
  "split": { name: "Split PDF", icon: "✂️" },
  "fill-form": { name: "Fill PDF Form", icon: "📋" },
  "ocr-pdf": { name: "OCR PDF", icon: "🔍" },
  "extract-text": { name: "Extract Text", icon: "📃" },
  "metadata-sanitizer": { name: "Metadata Sanitizer", icon: "🧹" },
  "word-to-pdf": { name: "Word to PDF", icon: "📝" },
};

export async function generateStaticParams() {
  return getErrorPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getErrorPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://allaboutpdfediting.xyz/error/${slug}`,
    },
  };
}

export default async function ErrorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getErrorPage(slug);
  if (!page) notFound();

  const toolKey = page.toolSlug as string;
  const toolInfo = toolLinks[toolKey] || { name: page.toolName, icon: "📄" };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: page.errorCode, item: `https://allaboutpdfediting.xyz/error/${slug}` },
        ]}
      />
      <FaqPageJsonLd questions={page.faqs} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[var(--danger-subtle)] border border-[var(--danger)]/25/30 rounded-[var(--r-xl)] p-3 sm:p-4 mb-8 inline-block">
          <span className="text-sm font-bold text-[var(--danger)] dark:text-[var(--danger)] uppercase tracking-wide">
            {page.errorCode}
          </span>
        </div>

        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            {page.h1}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            {page.description}
          </p>
        </section>

        <section className="mb-12 p-8 sm:p-10 rounded-[var(--r-xl)] border-2 border-dashed border-[var(--danger)]/25 dark:border-[var(--danger)]/25/50 bg-white dark:bg-[var(--surface)] text-center">
          <div className="flex justify-center mb-4"><Icon name="settings" size={42} className="text-[var(--muted)]" /></div>
          <p className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {page.prompt}
          </p>
          <p className="text-sm text-[var(--muted)] mb-6">
            No uploads. All processing happens in your browser.
          </p>
          <Link
            href={`/${page.toolSlug}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--danger)] text-white font-bold rounded-[var(--r-xl)] hover:opacity-90 transition shadow-lg shadow-red-600/25 text-lg"
          >
            <span className="text-2xl">{toolInfo.icon}</span>
            Open {page.toolName} →
          </Link>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--premium-border)]/50 border-[var(--premium-border)]/30 bg-[var(--premium-subtle)]">
            <h2 className="font-semibold text-[var(--foreground)] mb-2">Why This Happens</h2>
            <p className="text-sm text-[var(--muted)]">{page.cause}</p>
          </div>
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--success)]/25/50 dark:border-[var(--success)]/25/30 bg-[var(--success-subtle)]">
            <h2 className="font-semibold text-[var(--foreground)] mb-2">How We Fix It</h2>
            <p className="text-sm text-[var(--muted)]">{page.fixSummary}</p>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--danger)]/25/50 border-[var(--danger)]/25/30 bg-[var(--danger-subtle)]">
            <div className="flex justify-center mb-2"><Icon name="close" size={22} className="text-[var(--muted)]" /></div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">The Problem</h2>
            <p className="text-sm text-[var(--muted)]">{page.painPoint}</p>
          </div>
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--success)]/25/50 dark:border-[var(--success)]/25/30 bg-[var(--success-subtle)]">
            <div className="flex justify-center mb-2"><Icon name="check" size={22} className="text-[var(--muted)]" /></div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">The Solution</h2>
            <p className="text-sm text-[var(--muted)]">{page.benefit}</p>
          </div>
        </section>

        <section className="mb-12 p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why This Fix Works</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">100% free — no hidden charges or trial periods</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">Works in your browser — no downloads or installations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">Privacy first — files never leave your device</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">Processing in seconds, not minutes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">No account required — just fix and download</span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {page.faqs.map((faq, i) => (
              <details key={i} className="group rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] open:shadow-sm transition-all">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[var(--foreground)] hover:text-[var(--danger)] transition-colors">
                  {faq.question}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Try the Fix Now</h2>
          <div className="text-center">
            <Link
              href={`/${page.toolSlug}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--danger)] text-white font-semibold rounded-[var(--r-xl)] hover:opacity-90 transition shadow-lg shadow-red-600/25 text-lg"
            >
              {toolInfo.icon} Fix with {page.toolName} →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
