import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

/**
 * Standard page frame for every tool.
 *
 * Gives all ~80 tool pages one consistent layout: breadcrumb, icon, title,
 * lead, then the working area. Previously each page hand-rolled its own
 * heading block with slightly different sizes and spacing.
 */
export default function ToolShell({
  icon,
  title,
  lead,
  breadcrumb = "Tools",
  breadcrumbHref = "/tools",
  premium = false,
  children,
  footer,
}: {
  icon: IconName;
  title: string;
  lead: string;
  breadcrumb?: string;
  breadcrumbHref?: string;
  premium?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
        <Icon name="chevronRight" size={13} />
        <Link href={breadcrumbHref} className="hover:text-[var(--foreground)] transition-colors">{breadcrumb}</Link>
        <Icon name="chevronRight" size={13} />
        <span className="text-[var(--foreground-soft)]">{title}</span>
      </nav>

      <header className="flex items-start gap-3.5 mb-7">
        <span
          className={`inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-[var(--r-lg)] border ${
            premium
              ? "bg-[var(--premium-subtle)] border-[var(--premium-border)] text-[var(--premium)]"
              : "bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent)]"
          }`}
        >
          <Icon name={icon} size={21} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[1.5rem] sm:text-[1.75rem] font-semibold text-[var(--foreground)] leading-tight">
              {title}
            </h1>
            {premium && (
              <span className="badge badge-premium">
                <Icon name="star" size={10} strokeWidth={2.5} />
                Premium
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--muted)]">{lead}</p>
        </div>
      </header>

      {children}

      {footer}
    </div>
  );
}
