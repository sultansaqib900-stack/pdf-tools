import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export interface Workflow {
  /** The concrete situation, phrased the way the reader would describe it. */
  title: string;
  body: React.ReactNode;
}

export interface AudienceTool {
  href: string;
  label: string;
  desc: string;
  icon: IconName;
}

export interface AudienceFaq {
  question: string;
  answer: string;
}

interface Props {
  audience: string;
  slug: string;
  h1: string;
  intro: React.ReactNode;
  /** Grouped tool lists: [group heading, tools]. */
  groups: { heading: string; tools: AudienceTool[] }[];
  workflows: Workflow[];
  faqs: AudienceFaq[];
  closing: React.ReactNode;
}

const BASE = "https://allaboutpdfediting.xyz";

export default function AudiencePage({
  audience,
  slug,
  h1,
  intro,
  groups,
  workflows,
  faqs,
  closing,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: `${BASE}/` },
          { name: "Tools", item: `${BASE}/tools` },
          { name: audience, item: `${BASE}/${slug}` },
        ]}
      />
      <FaqPageJsonLd questions={faqs} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-[0.75rem] text-[var(--muted)]">
          <li><Link href="/" className="hover:text-[var(--accent)]">Home</Link></li>
          <li aria-hidden="true"><Icon name="chevronRight" size={12} /></li>
          <li><Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link></li>
          <li aria-hidden="true"><Icon name="chevronRight" size={12} /></li>
          <li className="text-[var(--foreground)]">{audience}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="text-[2rem] font-semibold leading-tight text-[var(--foreground)]">{h1}</h1>
        <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-[var(--muted-strong)]">{intro}</div>
      </header>

      <div className="space-y-10 mb-10">
        {workflows.map((w) => (
          <section key={w.title}>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{w.title}</h2>
            <div className="space-y-3 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">{w.body}</div>
          </section>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g.heading} className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{g.heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {g.tools.map((t) => (
              <Link key={t.href} href={t.href} className="card-interactive group flex items-start gap-3 p-3.5">
                <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--r-md)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--muted-strong)] group-hover:bg-[var(--accent-subtle)] group-hover:border-[var(--accent-border)] group-hover:text-[var(--accent)] transition-colors">
                  <Icon name={t.icon} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {t.label}
                  </span>
                  <span className="block mt-0.5 text-[0.75rem] leading-relaxed text-[var(--muted)]">{t.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

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

      <section className="surface-card p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Before you upload anything, anywhere</h2>
        <div className="space-y-3 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">{closing}</div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/tools" className="btn btn-primary">Browse all tools</Link>
          <Link href="/privacy" className="btn btn-secondary">How your data is handled</Link>
        </div>
      </section>
    </div>
  );
}
