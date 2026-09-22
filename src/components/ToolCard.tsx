import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category?: string;
  badge?: string;
  hasFreePreview?: boolean;
}

const badgeStyles: Record<string, string> = {
  Edit: "bg-blue-50 text-blue-700 border-blue-200",
  Convert: "bg-amber-50 text-amber-700 border-amber-200",
  Security: "bg-violet-50 text-violet-700 border-violet-200",
  Organize: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Studio & AI": "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold",
  Premium: "bg-amber-500 text-white border-amber-500 font-bold",
};

export default function ToolCard({ title, description, icon, href, gradient, category, badge, hasFreePreview }: ToolCardProps) {
  const isPremium = category === "Premium";

  return (
    <Link
      href={href}
      className={`group flex flex-col p-5 rounded-xl border bg-[var(--card)] transition-colors duration-150 hover:border-[var(--card-hover-border)] ${
        isPremium ? "border-amber-300" : "border-[var(--card-border)]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-lg ${gradient} flex items-center justify-center text-2xl`}>
          {icon}
        </div>

        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
              {badge}
            </span>
          )}
          {category && (!badge || isPremium) && (
            <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${badgeStyles[category] || "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
              {isPremium ? "Premium" : category}
            </span>
          )}
          {hasFreePreview && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
              Free preview
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-150">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
        {description}
      </p>
    </Link>
  );
}
