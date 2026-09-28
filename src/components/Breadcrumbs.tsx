import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

interface Item {
  name: string;
  item: string;
}

interface Props {
  items: Item[];
}

/**
 * Visible breadcrumbs + matching BreadcrumbList JSON-LD, rendered from the SAME
 * items array so the structured data can never drift from what users see.
 * Usage: `<Breadcrumbs items={[{ name: "Home", item: "https://…" }, …]} />`
 * (the last item is the current page and is not linked).
 */
export default function Breadcrumbs({ items }: Props) {
  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-4 pt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
          {items.map((it, i) => {
            const last = i === items.length - 1;
            return (
              <li key={it.item + i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">›</span>}
                {last ? (
                  <span className="font-medium text-[var(--foreground)]">{it.name}</span>
                ) : (
                  <Link href={it.item.replace(/^https?:\/\/[^/]+/, "") || "/"} className="hover:text-indigo-500 transition-colors">
                    {it.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
