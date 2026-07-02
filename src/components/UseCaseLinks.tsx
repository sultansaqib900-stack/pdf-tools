import Link from "next/link";
import { seoPages } from "@/lib/programmatic-seo";

interface Props {
  toolSlug: string;
}

export default function UseCaseLinks({ toolSlug }: Props) {
  const relevant = seoPages.filter((p) => p.toolSlug === toolSlug);

  if (relevant.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Popular Use Cases</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {relevant.map((p) => (
          <Link
            key={p.slug}
            href={`/for/${p.slug}`}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-xs font-medium text-[var(--muted)] hover:text-indigo-500 hover:border-indigo-400/30 transition text-center"
          >
            {p.audience.replace("for ", "")}
          </Link>
        ))}
      </div>
    </div>
  );
}
