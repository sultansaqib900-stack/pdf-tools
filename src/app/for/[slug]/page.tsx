import type { Metadata } from "next";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seoPages } from "@/lib/programmatic-seo";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";

const tools = [
  { name: "Compress PDF", href: "/compress", icon: "📦" },
  { name: "Merge PDF", href: "/merge", icon: "🔗" },
  { name: "Split PDF", href: "/split", icon: "✂️" },
  { name: "Image to PDF", href: "/image-to-pdf", icon: "🖼️" },
  { name: "Edit PDF", href: "/edit-pdf", icon: "✏️" },
  { name: "Protect PDF", href: "/protect", icon: "🔒" },
  { name: "Unlock PDF", href: "/unlock", icon: "🔓" },
  { name: "Sign PDF", href: "/sign", icon: "✍️" },
  { name: "OCR PDF", href: "/ocr-pdf", icon: "🔍" },
  { name: "PDF to Word", href: "/pdf-to-word", icon: "📄" },
  { name: "Word to PDF", href: "/word-to-pdf", icon: "📝" },
  { name: "Rotate PDF", href: "/rotate", icon: "🔄" },
];

export async function generateStaticParams() {
  // Only pre-render the pages we actually want in the index. The remaining
  // permutations still resolve (so old links/backlinks don't 404) but are
  // rendered on demand and marked noindex.
  return seoPages.filter((p) => p.indexable).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};
  const canonical = page.indexable
    ? `https://allaboutpdfediting.xyz/for/${slug}`
    // Thin permutations point at the real tool page, consolidating any signal
    // they've accumulated instead of competing with it.
    : `https://allaboutpdfediting.xyz/${page.toolSlug ?? ""}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
    },
  };
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const toolUrl = page.toolSlug ? `/${page.toolSlug}` : null;
  const relatedByTool = tools.filter((t) => t.href !== toolUrl).slice(0, 6);

  return (
    <>
      {page.indexable && (
        <>
          <BreadcrumbJsonLd
            items={[
              { name: "Home", item: "https://allaboutpdfediting.xyz" },
              { name: page.h1, item: `https://allaboutpdfediting.xyz/for/${slug}` },
            ]}
          />
          {/* Structured data only on pages we're willing to have indexed —
              FAQ markup on boilerplate pages invites a manual action. */}
          <FaqPageJsonLd questions={page.faqs} />
        </>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            {page.h1}
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            {page.description}
          </p>
          {toolUrl && (
            <Link
              href={toolUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-[var(--r-xl)] hover:bg-[var(--accent-hover)] transition shadow-lg shadow-indigo-600/25 text-lg"
            >
              Try {page.toolName} Free →
            </Link>
          )}
        </section>

        {/* Pain point + benefit */}
        <section className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--danger)]/25/50 border-[var(--danger)]/25/30 bg-[var(--danger-subtle)]">
            <div className="flex justify-center mb-2"><Icon name="close" size={22} className="text-[var(--muted)]" /></div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">The Problem</h2>
            <ul className="text-sm text-[var(--muted)] space-y-1.5 list-disc list-inside">
              {page.painPoints.map((pp) => (
                <li key={pp}>{pp}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--success)]/25/50 dark:border-[var(--success)]/25/30 bg-[var(--success-subtle)]">
            <div className="flex justify-center mb-2"><Icon name="check" size={22} className="text-[var(--muted)]" /></div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">The Solution</h2>
            <p className="text-sm text-[var(--muted)]">{page.benefit}</p>
          </div>
        </section>

        {/* Why this matters for audience */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Why {page.toolName} Matters {page.audience}
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted)] space-y-3">
            <p>
              {page.audience.replace("for ", "")} often face document challenges that interrupt workflow.
              Whether it&apos;s {page.painPoint.toLowerCase()}, having a reliable PDF tool saves time and frustration.
            </p>
            <p>
              {page.toolName} from PDFTools is designed specifically for this use case. It works entirely in your
              browser — no uploads, no servers, no privacy concerns. You get professional results without
              expensive software or subscriptions.
            </p>
          </div>
        </section>

        {/* Tool features */}
        <section className="mb-12 p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Key Features</h2>
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
              <span className="text-sm text-[var(--muted)]">Fast processing — results in seconds, not minutes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--success)] mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-[var(--muted)]">No account required — just upload and go</span>
            </li>
          </ul>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {page.faqs.map((faq, i) => (
              <details key={i} className="group rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] open:shadow-sm transition-all">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">
                  {faq.question}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Other use cases for this tool */}
        {page.toolSlug && (() => {
          // Only link out to indexable siblings, and cap the count — a wall of
          // 15 near-identical internal links is a classic doorway-page signal.
          const others = seoPages
            .filter((p) => p.toolSlug === page.toolSlug && p.slug !== slug && p.indexable)
            .slice(0, 5);
          if (others.length === 0) return null;
          return (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">More Ways to Use {page.toolName}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/for/${p.slug}`}
                    className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)]/30 transition text-center"
                  >
                    {p.audience.replace("for ", "")}
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Related tools */}
        <section>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">More Free PDF Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedByTool.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="block p-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)]/30 hover:shadow transition text-center"
              >
                <div className="text-2xl mb-1">{t.icon}</div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t.name}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
