import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { getToolGuide, type ToolGuideData } from "@/lib/tool-guides";

export interface GuideStep {
  title: string;
  body: React.ReactNode;
}

export interface GuideSection {
  heading: string;
  body: React.ReactNode;
}

interface Props {
  /** Pull the guide from src/lib/tool-guides.ts by slug. */
  slug?: string;
  /** Or pass content directly as JSX (used by the earliest pilot pages). */
  summary?: React.ReactNode;
  steps?: GuideStep[];
  sections?: GuideSection[];
}

/**
 * Renders a very small subset of markdown: **bold** and [label](/href).
 * This exists so tool-guides.ts can stay plain data instead of JSX.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)]*)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <Link key={`${keyPrefix}-l${i}`} href={m[2]} className="text-[var(--accent)] hover:underline">
          {m[1]}
        </Link>
      );
    } else if (m[3]) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-medium text-[var(--foreground)]">
          {m[3]}
        </strong>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function fromData(data: ToolGuideData) {
  return {
    summary: <p>{renderInline(data.summary, "sum")}</p>,
    steps: data.steps?.map((s, i) => ({
      title: s.title,
      body: <>{renderInline(s.body, `st${i}`)}</>,
    })),
    sections: data.sections.map((s, i) => ({
      heading: s.heading,
      body: (
        <>
          {s.paras.map((p, j) => (
            <p key={j}>{renderInline(p, `s${i}p${j}`)}</p>
          ))}
        </>
      ),
    })),
  };
}

/**
 * Long-form editorial block for a tool page. Sits below the tool itself so it
 * never delays interaction, but gives the page enough substance to rank for
 * the informational queries around the tool.
 */
export default function ToolGuide({ slug, summary, steps, sections }: Props) {
  let content = { summary, steps, sections: sections ?? [] };

  if (slug) {
    const data = getToolGuide(slug);
    if (!data) return null;
    content = fromData(data);
  }

  if (!content.summary && content.sections.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)] space-y-9">
      {content.summary && (
        <section>
          <div className="surface-card p-5 flex gap-3">
            <Icon name="info" size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div className="space-y-2 text-[0.875rem] leading-[1.7] text-[var(--muted-strong)]">
              {content.summary}
            </div>
          </div>
        </section>
      )}

      {content.steps && content.steps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Step by step</h2>
          <ol className="space-y-3">
            {content.steps.map((s, i) => (
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

      {content.sections.map((s) => (
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
