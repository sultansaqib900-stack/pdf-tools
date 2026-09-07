import Link from "next/link";
import Icon from "@/components/ui/Icon";

export interface GuideStep {
  title: string;
  body: React.ReactNode;
}

export interface GuideSection {
  heading: string;
  body: React.ReactNode;
}

interface Props {
  /** Short answer to the page's primary query — the passage most likely to be quoted in a snippet. */
  summary: React.ReactNode;
  steps?: GuideStep[];
  sections: GuideSection[];
}

/**
 * Long-form editorial block for a tool page. Sits below the tool itself so it
 * never delays interaction, but gives the page enough substance to rank for
 * the informational queries around the tool.
 */
export default function ToolGuide({ summary, steps, sections }: Props) {
  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)] space-y-9">
      <section>
        <div className="surface-card p-5 flex gap-3">
          <Icon name="info" size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <div className="space-y-2 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">{summary}</div>
        </div>
      </section>

      {steps && steps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Step by step</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[0.75rem] font-semibold text-[var(--accent)]">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-[0.875rem] font-medium text-[var(--foreground)]">{s.title}</h3>
                  <div className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted-strong)]">{s.body}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {sections.map((s) => (
        <section key={s.heading}>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{s.heading}</h2>
          <div className="space-y-3 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">{s.body}</div>
        </section>
      ))}

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Privacy</h2>
        <p className="text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">
          This tool runs entirely in your browser — your file is never uploaded to a server. You can
          confirm that by opening your browser&apos;s developer tools with F12, selecting the Network
          tab and watching while you process a document: no request carries the file. Disconnecting
          from the internet after the page loads makes the same point, since the tool keeps working.
          See{" "}
          <Link href="/privacy" className="text-[var(--accent)] hover:underline">the privacy policy</Link>{" "}
          for what the site itself collects.
        </p>
      </section>
    </div>
  );
}
