"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { TOOL_CATALOG, type ToolDefinition } from "@/lib/toolCatalog";

type CategoryKey =
  | "All"
  | "Popular"
  | "Convert"
  | "Edit"
  | "Organize"
  | "Protect"
  | "OCR & AI"
  | "Professional";

interface CategoryTab {
  key: CategoryKey;
  label: string;
  icon: string;
  matches: (tool: ToolDefinition) => boolean;
}

const CATEGORIES: CategoryTab[] = [
  {
    key: "All",
    label: "All Tools",
    icon: "✨",
    matches: () => true,
  },
  {
    key: "Popular",
    label: "Most Popular",
    icon: "🔥",
    matches: (t) =>
      ["/compress", "/merge", "/split", "/edit-pdf", "/sign", "/pdf-to-word", "/ocr-pdf", "/studio"].includes(t.href),
  },
  {
    key: "Convert",
    label: "Convert",
    icon: "🔄",
    matches: (t) =>
      [
        "/image-to-pdf",
        "/pdf-to-word",
        "/word-to-pdf",
        "/pdf-to-excel",
        "/pdf-to-images",
        "/scan-to-pdf",
        "/html-to-pdf",
        "/text-to-pdf",
        "/pdf-to-pdfa",
      ].includes(t.href),
  },
  {
    key: "Edit",
    label: "Edit & Markup",
    icon: "✏️",
    matches: (t) =>
      [
        "/edit-pdf",
        "/annotate",
        "/fill-form",
        "/crop",
        "/resize",
        "/pdf-inverter",
        "/word-counter",
        "/metadata",
        "/repair-pdf",
      ].includes(t.href),
  },
  {
    key: "Organize",
    label: "Organize",
    icon: "📑",
    matches: (t) =>
      [
        "/merge",
        "/split",
        "/delete-pages",
        "/organize",
        "/rotate",
        "/add-page-numbers",
        "/insert-blank",
        "/reverse-pdf",
      ].includes(t.href),
  },
  {
    key: "Protect",
    label: "Protect & Sign",
    icon: "🔒",
    matches: (t) =>
      [
        "/protect",
        "/unlock",
        "/sign",
        "/redact",
        "/watermark",
        "/flatten-pdf",
        "/vault",
        "/qr-stamp",
      ].includes(t.href),
  },
  {
    key: "OCR & AI",
    label: "OCR & AI",
    icon: "🤖",
    matches: (t) =>
      ["/ocr-pdf", "/chat-pdf", "/pdf-to-audio", "/pii-guardian"].includes(t.href),
  },
  {
    key: "Professional",
    label: "Professional",
    icon: "⭐",
    matches: (t) => t.category === "Premium",
  },
];

export default function ToolGrid() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("All");

  const activeTab = useMemo(
    () => CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0],
    [activeCategory]
  );

  const filtered = useMemo(() => {
    return TOOL_CATALOG.filter(activeTab.matches);
  }, [activeTab]);

  return (
    <div id="tools-section">
      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist" aria-label="Tool categories">
        {CATEGORIES.map((tab) => {
          const isSelected = activeCategory === tab.key;
          const count = TOOL_CATALOG.filter(tab.matches).length;

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? tab.key === "Professional"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-indigo-600 text-white shadow-sm"
                  : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)] hover:border-[var(--card-hover-border)] hover:text-[var(--foreground)]"
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-[var(--background)] text-[var(--muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Flagship Studio Teaser Banner (shown on All or Professional) */}
      {(activeCategory === "All" || activeCategory === "Professional") && (
        <div className="mb-8 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-2.5 border border-indigo-100">
              ⚡ FLAGSHIP MULTI-STEP WORKSPACE
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1.5">
              PDF Studio: Multi-Step Document Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Included with Premium. Reorder pages, delete pages, rotate, add e-signatures, watermarks, protect, and compress in one unified session — without re-uploading between steps.
            </p>
          </div>

          <Link
            href="/studio"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm"
          >
            Open PDF Studio →
          </Link>
        </div>
      )}

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tool) => (
          <ToolCard
            key={tool.href}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            href={tool.href}
            gradient={tool.gradient}
            category={tool.category}
            badge={tool.badge}
            hasFreePreview={tool.hasFreePreview}
          />
        ))}
      </div>
    </div>
  );
}
