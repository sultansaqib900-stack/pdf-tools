import Link from "next/link";
import { seoPages } from "@/lib/programmatic-seo";

interface Props {
  toolSlug: string;
}

export default function UseCaseLinks({ toolSlug }: Props) {
  const relevant = seoPages.filter((p) => p.toolSlug === toolSlug);

  if (relevant.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto my-12 pt-6 border-t border-[var(--card-border)]/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-[var(--foreground)] flex items-center gap-2">
          <span>👥</span> Popular Workflows by Profession
        </h3>
        <span className="text-[11px] text-[var(--muted)]">Customized Guides</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {relevant.slice(0, 12).map((p) => (
          <Link
            key={p.slug}
            href={`/for/${p.slug}`}
            className="p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-xs font-semibold text-[var(--muted)] hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition text-left group"
          >
            <span className="text-[10px] uppercase font-bold text-indigo-400/80 block mb-0.5">Workflow</span>
            <span className="group-hover:text-[var(--foreground)] transition">{p.audience.replace("for ", "For ")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
