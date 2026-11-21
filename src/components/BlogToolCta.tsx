import Link from "next/link";
import { getBlogToolCta } from "@/lib/blog-tools";

/**
 * Blog → tool conversion card.
 *
 * Rendered near the top of every article (right under the title/intro) and
 * again at the end, so a reader can jump straight into the matching tool.
 * Server component — no client JS, no ad slots.
 */
export interface BlogToolCtaProps {
  /** Blog slug, e.g. "how-to-compress-pdf" — used to look up the tool route. */
  slug: string;
  /** "top" = compact banner under the intro, "bottom" = full closing card. */
  variant?: "top" | "bottom";
}

export default function BlogToolCta({ slug, variant = "bottom" }: BlogToolCtaProps) {
  const config = getBlogToolCta(slug);
  if (!config) return null;
  const { href, toolName, blurb, bullets } = config;

  if (variant === "top") {
    return (
      <aside
        data-blog-cta="top"
        className="not-prose mb-7 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/25 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-2 text-sm text-[var(--foreground)] min-w-0">
          <span aria-hidden="true" className="text-lg shrink-0">⚡</span>
          <p className="leading-snug">
            <strong>Free {toolName}:</strong>{" "}
            <span className="text-[var(--muted)]">{blurb}</span>
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 sm:ml-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Open {toolName} →
        </Link>
      </aside>
    );
  }

  return (
    <aside
      data-blog-cta="bottom"
      className="not-prose mt-10 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
        Ready to try it?
      </p>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
        {toolName} — free, in your browser
      </h2>
      <p className="text-sm text-[var(--muted)] mb-4">{blurb}</p>
      {bullets.length > 0 && (
        <ul className="space-y-1.5 mb-5 text-sm text-[var(--muted)]">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Open {toolName} →
        </Link>
        <Link href="/tools" className="text-sm font-semibold text-indigo-500 hover:underline">
          Browse all 38 core tools
        </Link>
      </div>
    </aside>
  );
}
