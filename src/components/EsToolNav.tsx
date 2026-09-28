import Link from "next/link";

const ES_ROUTES = [
  { href: "/es", label: "Inicio" },
  { href: "/es/tools", label: "Todas las Herramientas" },
  { href: "/es/compress", label: "Comprimir PDF" },
  { href: "/es/merge", label: "Unir PDF" },
  { href: "/es/split", label: "Dividir PDF" },
  { href: "/es/image-to-pdf", label: "Imagen a PDF" },
  { href: "/es/edit-pdf", label: "Editar PDF" },
];

/**
 * Cross-links between the Spanish pages ("link to each other" — Phase 6).
 * Rendered at the bottom of every /es page.
 */
export default function EsToolNav({ current }: { current: string }) {
  return (
    <nav aria-label="Herramientas en español" className="max-w-3xl mx-auto px-4 pb-10">
      <div className="border-t border-[var(--card-border)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
          Herramientas PDF en español
        </p>
        <ul className="flex flex-wrap gap-2">
          {ES_ROUTES.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                aria-current={r.href === current ? "page" : undefined}
                className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  r.href === current
                    ? "border-indigo-500 text-indigo-500"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:text-indigo-500 hover:border-indigo-500"
                }`}
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
