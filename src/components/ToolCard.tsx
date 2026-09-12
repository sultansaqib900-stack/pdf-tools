import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category?: string;
}

const badgeStyles: Record<string, string> = {
  Edit: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Convert: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Security: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Organize: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  Extract: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  Premium: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400/40 font-bold",
};

export default function ToolCard({ title, description, icon, href, gradient, category }: ToolCardProps) {
  const isPremium = category === "Premium";

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 ${
        isPremium
          ? "border-amber-500/30 bg-gradient-to-br from-amber-950/15 via-[var(--card)] to-orange-950/10 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10"
          : "border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
      } hover:-translate-y-1.5 active:scale-[0.99]`}
    >
      {/* Glow highlight on hover */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center text-3xl shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>

          {category && (
            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${badgeStyles[category] || "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"}`}>
              {isPremium ? "⭐ Premium" : category}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors duration-200 tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[var(--card-border)]/50 flex items-center justify-between text-xs font-semibold text-indigo-400">
        <span className="opacity-80 group-hover:opacity-100 transition-opacity">Launch Tool</span>
        <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
      </div>
    </Link>
  );
}
