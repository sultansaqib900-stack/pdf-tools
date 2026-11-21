import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { seoPages, type SeoPage } from "@/lib/programmatic-seo";
import Breadcrumbs from "@/components/Breadcrumbs";
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
  return seoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    ...buildMetadata({
      path: `/for/${slug}`,
      title: page.title,
      description: page.description,
    }),
    // The audience/tool matrix is indexable: every page carries a distinct
    // profession profile, a tool-specific workflow, realistic document
    // examples, tailored tips and its own FAQs (enforced by
    // src/__tests__/programmaticSeo.test.ts), so these are not doorway pages.
  };
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const toolUrl = page.toolSlug ? `/${page.toolSlug}` : null;
  const relatedByTool = tools.filter((t: any) => t.href && t.href !== toolUrl).slice(0, 6);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: page.h1, item: `https://allaboutpdfediting.xyz/for/${slug}` },
        ]}
      />
      <FaqPageJsonLd questions={page.faqs} />

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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 text-lg"
            >
              Try {page.toolName} Free →
            </Link>
          )}
        </section>

        {/* Profession-specific situation */}
        <section className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
            <div className="text-2xl mb-2" aria-hidden="true">😫</div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">The situation in practice</h2>
            <p className="text-sm text-[var(--muted)]">{page.painPoint}</p>
          </div>
          <div className="p-6 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10">
            <div className="text-2xl mb-2" aria-hidden="true">✅</div>
            <h2 className="font-semibold text-[var(--foreground)] mb-2">What this tool returns</h2>
            <p className="text-sm text-[var(--muted)]">{page.benefit}</p>
          </div>
        </section>

        {/* Step-by-step workflow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            {page.toolName} workflow {page.audience}
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">{page.workflow}</p>
          <ol className="space-y-3">
            {page.steps.map((step, index) => (
              <li key={step} className="flex gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="text-sm text-[var(--muted)] leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Realistic document examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Document examples {page.audience}
          </h2>
          <ul className="grid sm:grid-cols-3 gap-3">
            {page.painPoints.map((doc) => (
              <li key={doc} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-sm text-[var(--muted)] leading-relaxed">
                <span className="block text-indigo-500 font-bold mb-2">Document</span>
                {doc.charAt(0).toUpperCase() + doc.slice(1)}.
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2">
            {page.examples.map((example) => (
              <li key={example} className="text-sm text-[var(--muted)] leading-relaxed flex gap-2">
                <span aria-hidden="true" className="text-indigo-500 shrink-0">▸</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Practical tips + caveat */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Practical tips for {page.audience.replace("for ", "")}
          </h2>
          <ul className="space-y-3 mb-5">
            {page.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-sm text-[var(--muted)] leading-relaxed">
                <span className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 p-4">
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              <strong className="text-[var(--foreground)]">Watch out:</strong> {page.caveat}
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {page.faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm transition-all">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[var(--foreground)] hover:text-indigo-600 transition-colors">
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
          const others = seoPages.filter((p) => p.toolSlug === page.toolSlug && p.slug !== slug);
          if (others.length === 0) return null;
          return (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">More Ways to Use {page.toolName}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/for/${p.slug}`}
                    className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-xs font-medium text-[var(--muted)] hover:text-indigo-500 hover:border-indigo-400/30 transition text-center"
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
            {relatedByTool.map((t: any) => (
              <Link
                key={t.href}
                href={t.href || `/for/${slug}`}
                className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-400/30 hover:shadow transition text-center"
              >
                <div className="text-2xl mb-1">{t.icon || t.emoji || "📄"}</div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t.name || t.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
