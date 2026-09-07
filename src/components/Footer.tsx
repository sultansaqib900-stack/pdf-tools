import Link from "next/link";
import Icon from "@/components/ui/Icon";

const COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: "Popular tools",
    links: [
      { label: "Compress PDF", href: "/compress" },
      { label: "Merge PDF", href: "/merge" },
      { label: "Split PDF", href: "/split" },
      { label: "Image to PDF", href: "/image-to-pdf" },
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "Sign PDF", href: "/sign" },
      { label: "Protect PDF", href: "/protect" },
      { label: "Unlock PDF", href: "/unlock" },
    ],
  },
  {
    heading: "More tools",
    links: [
      { label: "Edit PDF", href: "/edit-pdf" },
      { label: "Annotate PDF", href: "/annotate" },
      { label: "Organise pages", href: "/organize" },
      { label: "Rotate PDF", href: "/rotate" },
      { label: "Crop PDF", href: "/crop" },
      { label: "Watermark PDF", href: "/watermark" },
      { label: "Chat with PDF", href: "/chat-pdf" },
      { label: "All 49 tools", href: "/tools" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Ultimate guide", href: "/ultimate-guide-to-pdf-editing" },
      { label: "Questions & answers", href: "/qa" },
      { label: "Offline mode", href: "/offline" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Premium", href: "/premium" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface-subtle)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--r-md)] bg-[var(--accent)] text-[var(--accent-fg)]">
                <Icon name="fileText" size={16} strokeWidth={2} />
              </span>
              <span className="text-[0.9375rem] font-semibold tracking-tight text-[var(--foreground)]">
                PDFTools
              </span>
            </Link>
            <p className="text-[0.8125rem] leading-relaxed text-[var(--muted)] max-w-[24ch]">
              Free PDF tools that run entirely in your browser. Nothing is ever uploaded.
            </p>
            <span className="badge mt-4">
              <Icon name="shield" size={11} />
              Private by design
            </span>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h4 className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.8125rem] text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.8125rem] text-[var(--muted)]">
            &copy; {new Date().getFullYear()} PDFTools. All processing happens locally in your browser.
          </p>
          <a
            href="mailto:saqibbostan83@gmail.com?subject=Advertising"
            className="text-[0.8125rem] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Advertise with us
          </a>
        </div>
      </div>
    </footer>
  );
}
