"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
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
        <div className="mb-8 p-6 sm:p-8 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
                PDF STUDIO · INCLUDED WITH PREMIUM
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mb-2">
                PDF Studio: One-Stop Multi-Operation Pipeline
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Why upload 5 times to do 5 things? Delete pages, rotate orientation, add your visible e-signature, stamp watermarks, and compress all in one unified interactive workspace.
              </p>
            </div>

            <Link
              href="/studio"
              className="px-6 py-3.5 bg-[var(--accent)] text-white font-bold text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-colors shrink-0"
            >
              Open PDF Studio
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
