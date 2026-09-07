import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export interface ComparisonRow {
  feature: string;
  them: string;
  us: string;
  /** true = we win, false = they win, undefined = neutral/tie */
  advantage?: boolean;
}

export interface ComparisonSection {
  heading: string;
  body: React.ReactNode;
}

export interface ComparisonFaq {
  question: string;
  answer: string;
}

export interface RelatedTool {
  href: string;
  label: string;
  icon: IconName;
}

interface Props {
  competitor: string;
  slug: string;
  h1: string;
  intro: React.ReactNode;
  /** Honest note on what the competitor genuinely does better. */
  theirStrengths: string[];
  ourStrengths: string[];
  rows: ComparisonRow[];
  sections: ComparisonSection[];
  faqs: ComparisonFaq[];
  tools: RelatedTool[];
  verdict: React.ReactNode;
  /** e.g. "September 2026" — shown next to pricing claims. */
  pricingChecked: string;
}

const BASE = "https://allaboutpdfediting.xyz";

export default function ComparisonPage({
  competitor,
  slug,
  h1,
  intro,
  theirStrengths,
  ourStrengths,
  rows,
  sections,
  faqs,
  tools,
  verdict,
  pricingChecked,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: `${BASE}/` },
          { name: "Comparisons", item: `${BASE}/tools` },
          { name: `${competitor} alternative`, item: `${BASE}/${slug}` },
        ]}
      />
      <FaqPageJsonLd questions={faqs} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-[0.75rem] text-[var(--muted)]">
          <li><Link href="/" className="hover:text-[var(--accent)]">Home</Link></li>
          <li aria-hidden="true"><Icon name="chevronRight" size={12} /></li>
          <li><Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link></li>
          <li aria-hidden="true"><Icon name="chevronRight" size={12} /></li>
          <li className="text-[var(--foreground)]">{competitor} alternative</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-[2rem] font-semibold leading-tight text-[var(--foreground)]">{h1}</h1>
        <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-[var(--muted-strong)]">{intro}</div>
      </header>

      {/* Balanced summary — earns trust and reads as a genuine review, not a sales page */}
      <section className="grid sm:grid-cols-2 gap-3 mb-10">
        <div className="surface-card p-5">
          <h2 className="text-[0.9375rem] font-semibold text-[var(--foreground)] mb-3">
            Where {competitor} is stronger
          </h2>
          <ul className="space-y-2">
            {theirStrengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-5 border-[var(--accent-border)] bg-[var(--accent-subtle)]">
          <h2 className="text-[0.9375rem] font-semibold text-[var(--foreground)] mb-3">
            Where PDFTools is stronger
          </h2>
          <ul className="space-y-2">
            {ourStrengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          {competitor} vs PDFTools at a glance
        </h2>
        <p className="text-[0.75rem] text-[var(--muted)] mb-4">
          Pricing and limits last verified {pricingChecked}. Vendors change plans often — check their site for current terms.
        </p>
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">Feature comparison between {competitor} and PDFTools</caption>
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-medium uppercase tracking-wider text-[var(--muted)]">Feature</th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-medium uppercase tracking-wider text-[var(--muted)]">{competitor}</th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-medium uppercase tracking-wider text-[var(--accent)]">PDFTools</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="px-4 py-2.5 text-[0.8125rem] font-medium text-[var(--foreground)]">{r.feature}</th>
                    <td className="px-4 py-2.5 text-[0.8125rem] text-[var(--muted)]">{r.them}</td>
                    <td className={`px-4 py-2.5 text-[0.8125rem] ${r.advantage ? "font-medium text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {r.us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="space-y-8 mb-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{s.heading}</h2>
            <div className="space-y-3 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">{s.body}</div>
          </section>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">The honest verdict</h2>
        <div className="surface-card p-5 space-y-3 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">
          {verdict}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Try the tools mentioned here</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="card-interactive group flex items-center gap-3 p-3.5">
              <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--r-md)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--muted-strong)] group-hover:bg-[var(--accent-subtle)] group-hover:border-[var(--accent-border)] group-hover:text-[var(--accent)] transition-colors">
                <Icon name={t.icon} size={17} />
              </span>
              <span className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                {t.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Frequently asked questions</h2>
        <div className="space-y-1.5">
          {faqs.map((f) => (
            <details key={f.question} className="group surface-card overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none text-[0.875rem] font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
                {f.question}
                <Icon name="chevronDown" size={15} className="shrink-0 text-[var(--muted)] group-open:rotate-180 transition-transform duration-150" />
              </summary>
              <div className="px-4 pb-3.5 pt-0.5 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="surface-card p-6 text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Try it on your own file</h2>
        <p className="mt-1.5 mb-4 text-[0.875rem] text-[var(--muted)]">
          No signup, no upload. Open a tool and drop a PDF in — you can watch the network tab stay empty.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/compress" className="btn btn-primary">Compress a PDF</Link>
          <Link href="/tools" className="btn btn-secondary">Browse all tools</Link>
        </div>
      </section>
    </div>
  );
}
