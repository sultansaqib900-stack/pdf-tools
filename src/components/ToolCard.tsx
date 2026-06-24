import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category?: string;
}

const badgeColors: Record<string, string> = {
  Edit: "bg-blue-500",
  Convert: "bg-amber-500",
  Security: "bg-violet-500",
  Organize: "bg-fuchsia-500",
  Extract: "bg-teal-500",
};

export default function ToolCard({
  title,
  description,
  icon,
  href,
  gradient,
  category,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all relative"
    >
      {category && (
        <span
          className={`absolute top-3 right-3 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full ${badgeColors[category] || "bg-indigo-500"}`}
        >
          {category}
        </span>
      )}
      <div
        className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center text-3xl mb-4 shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-indigo-500 transition">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
