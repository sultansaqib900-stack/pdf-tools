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
  Premium: "bg-gradient-to-r from-amber-500 to-orange-600",
};

const hoverBorderColors: Record<string, string> = {
  Edit: "hover:border-blue-500/30 group-hover:shadow-blue-500/10",
  Convert: "hover:border-amber-500/30 group-hover:shadow-amber-500/10",
  Security: "hover:border-violet-500/30 group-hover:shadow-violet-500/10",
  Organize: "hover:border-fuchsia-500/30 group-hover:shadow-fuchsia-500/10",
  Extract: "hover:border-teal-500/30 group-hover:shadow-teal-500/10",
  Premium: "hover:border-amber-500/30 group-hover:shadow-amber-500/10",
};

const hoverTextColors: Record<string, string> = {
  Edit: "group-hover:text-blue-500",
  Convert: "group-hover:text-amber-500",
  Security: "group-hover:text-violet-500",
  Organize: "group-hover:text-fuchsia-500",
  Extract: "group-hover:text-teal-500",
  Premium: "group-hover:text-amber-500",
};

export default function ToolCard({ title, description, icon, href, gradient, category }: ToolCardProps) {
  const borderColor = hoverBorderColors[category || ""] || "hover:border-indigo-500/30 group-hover:shadow-indigo-500/10";
  const textColor = hoverTextColors[category || ""] || "group-hover:text-indigo-500";

  return (
    <Link
      href={href}
      className={`group block p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all duration-300 hover:shadow-xl ${borderColor} hover:-translate-y-1`}
    >
      {category && (
        <span className={`absolute top-3 right-3 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full ${badgeColors[category] || "bg-indigo-500"}`}>
          {category === "Premium" ? "⭐ Premium" : category}
        </span>
      )}
      <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold text-[var(--foreground)] ${textColor} transition-colors duration-200`}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
