import type { Metadata } from "next";
import Link from "next/link";
import {
  FREE_TOOL_COUNT,
  PREMIUM_TOOL_COUNT,
  TOOL_CATALOG,
  type ToolCategory,
} from "@/lib/toolCatalog";

export const metadata: Metadata = {
  title: "All PDF Tools - 52 Online PDF Tools | PDFTools",
  description: `Browse ${FREE_TOOL_COUNT} free core PDF tools and ${PREMIUM_TOOL_COUNT} professional Premium workflows. Files stay in your browser except clearly labeled AI features.`,
  openGraph: {
    title: "All PDF Tools - Free Core Tools & Professional Workflows",
    description: "Browse PDF editing, conversion, security, organization, AI, and professional workflow tools.",
  },
};

const categoryOrder: ToolCategory[] = [
  "Popular",
  "Studio & AI",
  "Edit",
  "Convert",
  "Security",
  "Organize",
  "Premium",
];

const categoryLabels: Record<ToolCategory, string> = {
  Popular: "Popular Free Tools",
  "Studio & AI": "Studio, OCR & Accessibility",
  Edit: "Edit & Mark Up",
  Convert: "Convert & Extract",
  Security: "Security & Signatures",
  Organize: "Organize Pages",
  Premium: `Professional Premium Tools (${PREMIUM_TOOL_COUNT})`,
};

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">All PDF Tools</h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
          {FREE_TOOL_COUNT} core tools are free and unlimited — no daily or monthly caps. {PREMIUM_TOOL_COUNT} professional Premium tools add automation, bulk workflows, and AI with a shared 5-file lifetime trial (Premium removes the limit).
        </p>
      </div>

      {categoryOrder.map((category) => {
        const tools = TOOL_CATALOG.filter((tool) => tool.category === category);
        if (tools.length === 0) return null;
        const premium = category === "Premium";

        return (
          <section key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[var(--card-border)]">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{categoryLabels[category]}</h2>
              {premium && (
                <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`block p-4 rounded-xl border bg-[var(--card)] hover:shadow-lg transition ${
                    premium
                      ? "border-amber-500/25 hover:border-amber-400/60 hover:shadow-amber-500/5"
                      : "border-[var(--card-border)] hover:border-indigo-500/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span aria-hidden="true">{tool.icon}</span>
                    <h3 className="font-semibold text-[var(--foreground)] text-sm">{tool.title}</h3>
                    {premium && <span className="text-[10px] font-bold text-amber-500">⭐ Premium</span>}
                    {tool.hasFreePreview && <span className="text-[10px] font-bold text-emerald-500">Free preview</span>}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="text-center mt-8 pt-8 border-t border-[var(--card-border)]">
        <p className="text-sm text-[var(--muted)] mb-4">Can&apos;t find what you need?</p>
        <Link href="/blog" className="text-indigo-500 hover:underline font-medium text-sm">Check our guides &rarr;</Link>
      </div>
    </div>
  );
}
