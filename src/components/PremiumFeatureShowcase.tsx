import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

const premiumFeatures: { icon: IconName; title: string; desc: string; href: string }[] = [
  { icon: "diff", title: "PDF Diff", desc: "Compare two documents side by side and see exactly what changed.", href: "/pdf-diff" },
  { icon: "award", title: "Certificate Generator", desc: "Generate personalised certificates in bulk from a template and a CSV.", href: "/certificate-generator" },
  { icon: "headphones", title: "PDF to Audio", desc: "Convert any PDF to speech and listen while commuting or multitasking.", href: "/pdf-to-audio" },
  { icon: "fileSheet", title: "Form Data Extraction", desc: "Export filled form fields to CSV for surveys and applications.", href: "/form-data-extract" },
  { icon: "tag", title: "Bulk Rename", desc: "Rename dozens of PDFs at once using their embedded metadata.", href: "/bulk-rename" },
  { icon: "book", title: "Booklet Creator", desc: "Build printable booklets, N-up grids and saddle-stitch layouts.", href: "/booklet" },
  { icon: "search", title: "Search & Redact", desc: "Automatically redact words or phrases across an entire document.", href: "/search-redact" },
  { icon: "contrast", title: "Colour Inverter", desc: "Dark-mode reading, grayscale printing or high-contrast accessibility.", href: "/pdf-inverter" },
  { icon: "vault", title: "PDF Vault", desc: "Keep sensitive PDFs in a password-protected browser vault.", href: "/vault" },
  { icon: "qr", title: "QR Code Stamp", desc: "Add QR codes to every page — links, payments or any content.", href: "/qr-stamp" },
  { icon: "eraser", title: "Metadata Sanitizer", desc: "Strip hidden author, timestamp and software metadata.", href: "/metadata-sanitizer" },
  { icon: "bookmark", title: "Split by Bookmarks", desc: "Extract chapters and sections using the PDF's outline.", href: "/split-by-bookmarks" },
  { icon: "numbers", title: "Bates Numbering", desc: "Sequential page numbers and labels — essential for legal work.", href: "/bates-numbering" },
];

export default function PremiumFeatureShowcase() {
  return (
    <section className="surface-card overflow-hidden">
      <div className="px-6 sm:px-8 py-8 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="badge badge-premium mb-3">
              <Icon name="star" size={11} strokeWidth={2.5} />
              Premium
            </span>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              13 tools you won&apos;t find elsewhere
            </h2>
            <p className="mt-1.5 text-[0.875rem] text-[var(--muted)] max-w-lg">
              Advanced workflows for legal, education and business teams — all still
              processed entirely in your browser.
            </p>
          </div>
          <Link href="/premium" className="btn btn-primary shrink-0">
            See pricing
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>

      <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {premiumFeatures.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex items-start gap-3 p-3.5 rounded-[var(--r-md)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--r-md)] bg-[var(--premium-subtle)] border border-[var(--premium-border)] text-[var(--premium)]">
              <Icon name={f.icon} size={17} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[0.875rem] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                {f.title}
              </h3>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                {f.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
