import Link from "next/link";
import { indexableSeoPages } from "@/lib/programmatic-seo";

interface Props {
  toolSlug: string;
}

export default function UseCaseLinks({ toolSlug }: Props) {
  // Only surface indexable use-case pages. Linking every tool page to 15
  // template permutations created a doorway-style internal link network.
  const relevant = indexableSeoPages.filter((p) => p.toolSlug === toolSlug);

  if (relevant.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Popular Use Cases</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {relevant.map((p) => (
          <Link
            key={p.slug}
            href={`/for/${p.slug}`}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)]/30 transition text-center"
          >
            {p.audience.replace("for ", "")}
          </Link>
        ))}
      </div>
    </div>
  );
}
