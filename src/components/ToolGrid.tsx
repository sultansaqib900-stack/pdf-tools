"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { STUDIO_TRIAL_CTA } from "@/lib/studioTrial";
import { PREMIUM_TOOL_COUNT, TOOL_CATALOG, type ToolCategory } from "@/lib/toolCatalog";

type Category = "All" | ToolCategory;

const allTools = TOOL_CATALOG;

const categories: { key: Category; label: string; icon: string }[] = [
  { key: "All", label: `All Tools (${TOOL_CATALOG.length})`, icon: "✨" },
  { key: "Popular", label: "Most Popular", icon: "🔥" },
  { key: "Studio & AI", label: "Studio & AI", icon: "⚡" },
  { key: "Edit", label: "Edit & Markup", icon: "✏️" },
  { key: "Convert", label: "Convert", icon: "🔄" },
  { key: "Security", label: "Security & Sign", icon: "🔒" },
  { key: "Organize", label: "Organize Pages", icon: "📑" },
  { key: "Premium", label: `Premium (${PREMIUM_TOOL_COUNT})`, icon: "👑" },
];

export default function ToolGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    let tools = allTools;
    if (category !== "All") {
      if (category === "Popular") {
        tools = tools.filter((t) => t.category === "Popular" || t.category === "Studio & AI");
      } else {
        tools = tools.filter((t) => t.category === category);
      }
    }
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.href.replace("/", "").replace(/-/g, " ").includes(q)
    );
  }, [query, category]);

  return (
    <div>
      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              category === c.key
                ? c.key === "Premium"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 scale-105"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)] hover:border-indigo-500/50 hover:text-[var(--foreground)]"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Flagship Studio Teaser Card (shown when category is All or Studio) */}
      {(category === "All" || category === "Studio & AI") && !query && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PDF STUDIO · THREE-DAY FREE TRIAL
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                PDF Studio: One-Stop Multi-Operation Pipeline
              </h3>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Why upload 5 times to do 5 things? Delete pages, rotate orientation, add your visible e-signature, stamp watermarks, and compress all in one unified interactive workspace.
              </p>
            </div>

            <Link
              href="/studio"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-sm rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 shrink-0 group-hover:scale-105"
            >
              <span>{STUDIO_TRIAL_CTA}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tool Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-8">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg font-bold text-[var(--foreground)]">No matching PDF tools found</p>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">Try different search keywords or clear your active category filter.</p>
          <button
            onClick={() => { setQuery(""); setCategory("All"); }}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tool) => (
            <ToolCard key={tool.href} {...tool} category={tool.category} />
          ))}
        </div>
      )}
    </div>
  );
}
