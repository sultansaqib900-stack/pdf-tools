import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

interface ToolCardProps {
  title: string;
  description: string;
  /** Icon name from the shared set. Legacy emoji strings are tolerated. */
  icon: IconName | string;
  href: string;
  category?: string;
  /** Legacy prop — previously a per-tool gradient. Ignored by design. */
  gradient?: string;
}

export default function ToolCard({ title, description, icon, href, category }: ToolCardProps) {
  const isPremium = category === "Premium";

  return (
    // `relative` was missing here: the category badge below is absolutely
    // positioned and was escaping the card to the nearest positioned ancestor.
    <Link
      href={href}
      className="group card-interactive relative flex flex-col p-5 h-full"
    >
      {category && (
        <span className={`badge absolute top-4 right-4 ${isPremium ? "badge-premium" : ""}`}>
          {isPremium && <Icon name="star" size={10} strokeWidth={2.5} />}
          {category}
        </span>
      )}

      {/* Single neutral icon tile. Colour is reserved for the accent and for
          state — using 41 different gradients made the grid read as noise. */}
      <span
        className={`inline-flex items-center justify-center w-10 h-10 rounded-[var(--r-md)] mb-3.5 border transition-colors duration-150 ${
          isPremium
            ? "bg-[var(--premium-subtle)] border-[var(--premium-border)] text-[var(--premium)]"
            : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--muted-strong)] group-hover:bg-[var(--accent-subtle)] group-hover:border-[var(--accent-border)] group-hover:text-[var(--accent)]"
        }`}
      >
        <Icon name={icon as IconName} size={19} />
      </span>

      <h3 className="text-[0.9375rem] font-semibold text-[var(--foreground)] leading-snug pr-16">
        {title}
      </h3>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </Link>
  );
}
