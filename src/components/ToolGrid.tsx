"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";

type Category = "All" | "Edit" | "Convert" | "Security" | "Organize" | "Extract" | "Premium";

interface ToolDef {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category: Category;
}

const allTools: ToolDef[] = [
  { title: "Compress PDF", description: "Reduce file size while keeping quality.", icon: "📦", href: "/compress", gradient: "bg-gradient-to-br from-blue-400 to-blue-600", category: "Edit" },
  { title: "Merge PDF", description: "Combine multiple PDFs into one document.", icon: "🔗", href: "/merge", gradient: "bg-gradient-to-br from-emerald-400 to-emerald-600", category: "Edit" },
  { title: "Chat with PDF", description: "Upload a PDF and ask AI questions about its content.", icon: "🤖", href: "/chat-pdf", gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600", category: "Extract" },
  { title: "Fill PDF Form", description: "Fill form fields and download the completed PDF.", icon: "📋", href: "/fill-form", gradient: "bg-gradient-to-br from-lime-400 to-lime-600", category: "Edit" },
  { title: "Flatten PDF", description: "Merge form fields and layers into page content.", icon: "📄", href: "/flatten-pdf", gradient: "bg-gradient-to-br from-stone-400 to-stone-600", category: "Edit" },
  { title: "Reverse PDF Order", description: "Flip the entire page sequence of any PDF.", icon: "🔄", href: "/reverse-pdf", gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600", category: "Organize" },
  { title: "Split PDF", description: "Extract pages or split into separate files.", icon: "✂️", href: "/split", gradient: "bg-gradient-to-br from-purple-400 to-purple-600", category: "Edit" },
  { title: "Delete Pages", description: "Remove unwanted pages from your PDF.", icon: "🗑️", href: "/delete-pages", gradient: "bg-gradient-to-br from-red-400 to-red-600", category: "Edit" },
  { title: "Organize Pages", description: "Drag and drop to reorder PDF pages.", icon: "📑", href: "/organize", gradient: "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600", category: "Organize" },
  { title: "Crop PDF", description: "Remove unwanted margins from PDF pages.", icon: "🔲", href: "/crop", gradient: "bg-gradient-to-br from-rose-400 to-rose-600", category: "Edit" },
  { title: "Resize PDF", description: "Change page size to A4, Letter, Legal.", icon: "📐", href: "/resize", gradient: "bg-gradient-to-br from-blue-400 to-blue-600", category: "Edit" },
  { title: "Image to PDF", description: "Convert JPG, PNG, and other images to PDF.", icon: "🖼️", href: "/image-to-pdf", gradient: "bg-gradient-to-br from-amber-400 to-amber-600", category: "Convert" },
  { title: "PDF to Images", description: "Extract all pages as high-quality images.", icon: "📸", href: "/pdf-to-images", gradient: "bg-gradient-to-br from-rose-400 to-rose-600", category: "Convert" },
  { title: "PDF to Excel", description: "Extract tables from PDF as CSV using AI.", icon: "📊", href: "/pdf-to-excel", gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700", category: "Convert" },
  { title: "Word Counter", description: "Count words, characters, and pages.", icon: "📝", href: "/word-counter", gradient: "bg-gradient-to-br from-teal-400 to-teal-600", category: "Extract" },
  { title: "Insert Blank Pages", description: "Add empty pages to any PDF.", icon: "📄", href: "/insert-blank", gradient: "bg-gradient-to-br from-sky-500 to-sky-700", category: "Edit" },
  { title: "Annotate PDF", description: "Highlight, underline & strikethrough text.", icon: "🖍️", href: "/annotate", gradient: "bg-gradient-to-br from-amber-400 to-amber-600", category: "Edit" },
  { title: "HTML to PDF", description: "Convert HTML markup to a downloadable PDF.", icon: "🌐", href: "/html-to-pdf", gradient: "bg-gradient-to-br from-sky-400 to-sky-600", category: "Convert" },
  { title: "Redact PDF", description: "Permanently black out sensitive text and areas.", icon: "⬛", href: "/redact", gradient: "bg-gradient-to-br from-slate-600 to-slate-800", category: "Security" },
  { title: "Text to PDF", description: "Convert plain text to a formatted PDF.", icon: "📝", href: "/text-to-pdf", gradient: "bg-gradient-to-br from-green-400 to-green-600", category: "Convert" },
  { title: "Password Protect", description: "Encrypt your PDF with a password.", icon: "🔒", href: "/protect", gradient: "bg-gradient-to-br from-violet-400 to-violet-600", category: "Security" },
  { title: "Unlock PDF", description: "Remove password protection from PDF files.", icon: "🔓", href: "/unlock", gradient: "bg-gradient-to-br from-orange-400 to-orange-600", category: "Security" },
  { title: "e-Sign PDF", description: "Draw your signature and place it on any PDF.", icon: "✍️", href: "/sign", gradient: "bg-gradient-to-br from-pink-400 to-pink-600", category: "Security" },
  { title: "Watermark PDF", description: "Add text watermarks to every page.", icon: "💧", href: "/watermark", gradient: "bg-gradient-to-br from-yellow-400 to-yellow-600", category: "Security" },
  { title: "Extract Text", description: "Extract text content from any PDF.", icon: "📝", href: "/extract-text", gradient: "bg-gradient-to-br from-teal-400 to-teal-600", category: "Extract" },
  { title: "Add Page Numbers", description: "Insert page numbers at any position.", icon: "🔢", href: "/add-page-numbers", gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600", category: "Extract" },
  { title: "Metadata Editor", description: "View and edit PDF title, author, subject.", icon: "📋", href: "/metadata", gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600", category: "Extract" },
  { title: "Rotate PDF", description: "Rotate pages by 90, 180, or 270 degrees.", icon: "🔄", href: "/rotate", gradient: "bg-gradient-to-br from-red-400 to-red-600", category: "Edit" },
  { title: "Batch Process", description: "Process multiple PDFs at once (Premium).", icon: "⚙️", href: "/batch", gradient: "bg-gradient-to-br from-slate-400 to-slate-600", category: "Premium" },
  { title: "PDF Diff", description: "Compare two PDFs side by side — see changes.", icon: "🔍", href: "/pdf-diff", gradient: "bg-gradient-to-br from-teal-400 to-cyan-600", category: "Premium" },
  { title: "Certificate Generator", description: "Bulk-generate personalized PDF certificates.", icon: "🏆", href: "/certificate-generator", gradient: "bg-gradient-to-br from-purple-500 to-indigo-700", category: "Premium" },
  { title: "PDF to Audio", description: "Listen to PDFs with text-to-speech.", icon: "🎧", href: "/pdf-to-audio", gradient: "bg-gradient-to-br from-rose-400 to-pink-600", category: "Premium" },
  { title: "Form Data Extract", description: "Extract PDF form data to CSV.", icon: "📊", href: "/form-data-extract", gradient: "bg-gradient-to-br from-emerald-500 to-teal-700", category: "Premium" },
  { title: "Bulk Rename", description: "Rename PDFs by title, author, or metadata.", icon: "🏷️", href: "/bulk-rename", gradient: "bg-gradient-to-br from-blue-400 to-indigo-600", category: "Premium" },
  { title: "Booklet Creator", description: "Create N-up booklets for printing.", icon: "📖", href: "/booklet", gradient: "bg-gradient-to-br from-orange-400 to-red-600", category: "Premium" },
  { title: "Search & Redact", description: "Auto-redact words across entire document.", icon: "⬛", href: "/search-redact", gradient: "bg-gradient-to-br from-slate-600 to-gray-900", category: "Premium" },
  { title: "Color Inverter", description: "Invert, grayscale, or boost contrast.", icon: "🎨", href: "/pdf-inverter", gradient: "bg-gradient-to-br from-violet-400 to-purple-600", category: "Premium" },
  { title: "PDF Vault", description: "Encrypted browser document storage.", icon: "🔐", href: "/vault", gradient: "bg-gradient-to-br from-cyan-400 to-blue-600", category: "Premium" },
  { title: "QR Code Stamp", description: "Add QR codes to every PDF page.", icon: "📱", href: "/qr-stamp", gradient: "bg-gradient-to-br from-green-500 to-emerald-700", category: "Premium" },
  { title: "Metadata Sanitizer", description: "Strip all hidden metadata from PDFs.", icon: "🧹", href: "/metadata-sanitizer", gradient: "bg-gradient-to-br from-yellow-500 to-orange-700", category: "Premium" },
  { title: "Split by Bookmarks", description: "Extract chapters from PDF outline/bookmarks.", icon: "📑", href: "/split-by-bookmarks", gradient: "bg-gradient-to-br from-fuchsia-400 to-pink-600", category: "Premium" },
  { title: "Bates Numbering", description: "Add sequential page numbers to every page.", icon: "🔢", href: "/bates-numbering", gradient: "bg-gradient-to-br from-amber-400 to-yellow-600", category: "Premium" },
];

const categories: { key: Category; label: string; color: string }[] = [
  { key: "All", label: "All", color: "bg-indigo-500" },
  { key: "Edit", label: "Edit", color: "bg-blue-500" },
  { key: "Convert", label: "Convert", color: "bg-amber-500" },
  { key: "Security", label: "Security", color: "bg-violet-500" },
  { key: "Organize", label: "Organize", color: "bg-fuchsia-500" },
  { key: "Extract", label: "Extract", color: "bg-teal-500" },
  { key: "Premium", label: "Premium ⭐", color: "bg-gradient-to-r from-amber-500 to-orange-600" },
];

export default function ToolGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    let tools = allTools;
    if (category !== "All") {
      tools = tools.filter((t) => t.category === category);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      window.location.href = filtered[0].href;
    }
  };

  return (
    <div>
      <div className="relative w-full max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            &#10005;
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              category === c.key
                ? `${c.color} text-white`
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)] hover:border-[var(--foreground)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <p className="text-lg">No tools found</p>
          <button
            onClick={() => { setQuery(""); setCategory("All"); }}
            className="mt-2 text-sm text-indigo-500 hover:underline"
          >
            Clear filters
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
