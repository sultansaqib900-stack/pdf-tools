"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";

type Category = "All" | "Popular" | "Studio & AI" | "Edit" | "Convert" | "Security" | "Organize" | "Premium";

interface ToolDef {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category: Category;
  badge?: string;
}

const allTools: ToolDef[] = [
  { title: "PDF Studio Pipeline", description: "Multi-step studio: delete pages, rotate, sign, watermark, & compress without re-uploading.", icon: "⚡", href: "/studio", gradient: "bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500", category: "Studio & AI", badge: "Flagship" },
  { title: "PII Guardian (Auto-Redact)", description: "Locally detect common SSNs, card numbers, emails, IBANs, and phone numbers, then securely raster-redact selected matches.", icon: "🛡️", href: "/pii-guardian", gradient: "bg-gradient-to-br from-red-500 via-rose-600 to-amber-600", category: "Security", badge: "Privacy Tool" },
  { title: "PDF Automation Recipes", description: "Run preset, multi-step PDF workflows such as sanitizing, compressing, watermarking, and flattening forms.", icon: "⚡", href: "/recipes", gradient: "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500", category: "Studio & AI", badge: "1-Click Macro" },
  { title: "Chat with PDF (AI)", description: "Ask questions, generate bullet summaries, translate to Urdu, and extract insights.", icon: "🤖", href: "/chat-pdf", gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600", category: "Studio & AI" },
  { title: "Compress PDF", description: "Choose structure-preserving optimization or stronger raster compression; savings depend on the document.", icon: "📦", href: "/compress", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Popular" },
  { title: "Merge PDF", description: "Combine multiple PDF documents in your chosen order.", icon: "🔗", href: "/merge", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", category: "Popular" },
  { title: "Split PDF", description: "Extract a page range or package every page as an individual PDF in a ZIP archive.", icon: "✂️", href: "/split", gradient: "bg-gradient-to-br from-purple-500 to-pink-600", category: "Popular" },
  { title: "Image to PDF", description: "Combine JPG and PNG images into one PDF, with one page per image.", icon: "🖼️", href: "/image-to-pdf", gradient: "bg-gradient-to-br from-amber-500 to-orange-600", category: "Convert" },
  { title: "e-Sign PDF", description: "Draw a signature and stamp it at the bottom of the PDF's last page.", icon: "✍️", href: "/sign", gradient: "bg-gradient-to-br from-pink-500 to-rose-600", category: "Security" },
  { title: "OCR PDF", description: "Run English OCR on scanned PDF pages, then copy or download the extracted text.", icon: "🔍", href: "/ocr-pdf", gradient: "bg-gradient-to-br from-purple-500 to-indigo-600", category: "Studio & AI" },
  { title: "Delete Pages", description: "Visually select and remove unwanted pages from any PDF document.", icon: "🗑️", href: "/delete-pages", gradient: "bg-gradient-to-br from-red-500 to-rose-600", category: "Organize" },
  { title: "Organize Pages", description: "Reorder PDF pages with drag-and-drop numbered page tiles and export the new sequence.", icon: "📑", href: "/organize", gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-600", category: "Organize" },
  { title: "Edit PDF", description: "Overlay editable text boxes, rectangles, circles, and lines on PDF pages.", icon: "✏️", href: "/edit-pdf", gradient: "bg-gradient-to-br from-orange-500 to-amber-600", category: "Edit" },
  { title: "PDF to Word", description: "Extract text into a simple editable DOCX; original page layout and images are not reproduced.", icon: "📄", href: "/pdf-to-word", gradient: "bg-gradient-to-br from-blue-600 to-blue-800", category: "Convert" },
  { title: "Word to PDF", description: "Convert DOCX text and basic headings, lists, and tables into a simplified PDF layout.", icon: "📝", href: "/word-to-pdf", gradient: "bg-gradient-to-br from-green-500 to-emerald-700", category: "Convert" },
  { title: "PDF to CSV", description: "Heuristically extract positioned PDF text into CSV rows, with optional configured AI fallback.", icon: "📊", href: "/pdf-to-excel", gradient: "bg-gradient-to-br from-emerald-500 to-teal-700", category: "Convert" },
  { title: "Watermark PDF", description: "Stamp customized text or copyright watermarks with opacity and rotation.", icon: "💧", href: "/watermark", gradient: "bg-gradient-to-br from-cyan-500 to-blue-600", category: "Security" },
  { title: "Password Protect", description: "Secure your confidential files with strong AES password encryption.", icon: "🔒", href: "/protect", gradient: "bg-gradient-to-br from-violet-500 to-purple-700", category: "Security" },
  { title: "Unlock PDF", description: "Remove owner restrictions and passwords from your PDF files.", icon: "🔓", href: "/unlock", gradient: "bg-gradient-to-br from-amber-500 to-orange-600", category: "Security" },
  { title: "Rotate PDF", description: "Fix upside down pages by rotating 90°, 180°, or 270° degrees.", icon: "🔄", href: "/rotate", gradient: "bg-gradient-to-br from-red-500 to-orange-600", category: "Organize" },
  { title: "Crop PDF", description: "Set top, bottom, left, and right crop margins in points or millimeters.", icon: "🔲", href: "/crop", gradient: "bg-gradient-to-br from-rose-500 to-pink-600", category: "Edit" },
  { title: "Resize PDF", description: "Change page boundaries to A4, US Letter, Legal, other presets, or custom point dimensions without scaling content.", icon: "📐", href: "/resize", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Edit" },
  { title: "Add Page Numbers", description: "Insert sequential page numbers in one of six top or bottom positions.", icon: "🔢", href: "/add-page-numbers", gradient: "bg-gradient-to-br from-cyan-500 to-teal-600", category: "Organize" },
  { title: "Fill PDF Form", description: "Type into AcroForm fields, check checkboxes, and download completed forms.", icon: "📋", href: "/fill-form", gradient: "bg-gradient-to-br from-lime-500 to-emerald-600", category: "Edit" },
  { title: "Flatten PDF", description: "Render visible page content into non-interactive page images, flattening forms and visible annotations.", icon: "📄", href: "/flatten-pdf", gradient: "bg-gradient-to-br from-stone-500 to-slate-700", category: "Security" },
  { title: "PDF to Images", description: "Render each PDF page as high-resolution PNG or JPG and download individually or as ZIP.", icon: "📸", href: "/pdf-to-images", gradient: "bg-gradient-to-br from-rose-500 to-red-600", category: "Convert" },
  { title: "Scan to PDF", description: "Capture one or more camera photos and combine them into a PDF.", icon: "📷", href: "/scan-to-pdf", gradient: "bg-gradient-to-br from-sky-500 to-blue-600", category: "Convert" },
  { title: "HTML to PDF", description: "Render pasted HTML markup into a rasterized PDF in your browser.", icon: "🌐", href: "/html-to-pdf", gradient: "bg-gradient-to-br from-sky-400 to-indigo-600", category: "Convert" },
  { title: "Text to PDF", description: "Convert entered plain text into clean, automatically paginated PDF pages.", icon: "📝", href: "/text-to-pdf", gradient: "bg-gradient-to-br from-green-500 to-teal-600", category: "Convert" },
  { title: "Re-save PDF", description: "Re-serialize a readable PDF to rebuild its cross-reference structure; severely corrupted files may remain unrecoverable.", icon: "🔧", href: "/repair-pdf", gradient: "bg-gradient-to-br from-stone-500 to-slate-800", category: "Edit" },
  { title: "Redact PDF", description: "Permanently blackout confidential names, numbers, and SSNs.", icon: "⬛", href: "/redact", gradient: "bg-gradient-to-br from-slate-700 to-black", category: "Security" },
  { title: "Word Counter", description: "Count words, characters, reading time, and page metrics in PDF.", icon: "📝", href: "/word-counter", gradient: "bg-gradient-to-br from-teal-500 to-emerald-600", category: "Convert" },
  { title: "Insert Blank Pages", description: "Insert blank pages at any point for notes or double-sided printing.", icon: "📄", href: "/insert-blank", gradient: "bg-gradient-to-br from-sky-500 to-indigo-700", category: "Organize" },
  { title: "Annotate PDF", description: "Burn visual highlights, underlines, and strikethrough lines onto PDF pages.", icon: "🖍️", href: "/annotate", gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", category: "Edit" },
  { title: "Batch Process", description: "Apply one configured action to multiple PDFs, then download each successful result.", icon: "⚙️", href: "/batch", gradient: "bg-gradient-to-br from-slate-500 to-slate-800", category: "Premium" },
  { title: "PDF Diff", description: "Compare rendered pages side by side and review a heuristic extracted-text additions/deletions list.", icon: "🔍", href: "/pdf-diff", gradient: "bg-gradient-to-br from-teal-500 to-cyan-600", category: "Premium" },
  { title: "Bates Numbering", description: "Add sequential legal Bates stamping with custom prefixes and digit padding.", icon: "🔢", href: "/bates-numbering", gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", category: "Premium" },
  { title: "Certificate Generator", description: "Generate bulk personalized PDF certificates from templates and CSV data.", icon: "🏆", href: "/certificate-generator", gradient: "bg-gradient-to-br from-purple-500 to-indigo-700", category: "Premium" },
  { title: "PDF to Audio", description: "Natural text-to-speech audio reader with voice selection & speed controls.", icon: "🎧", href: "/pdf-to-audio", gradient: "bg-gradient-to-br from-rose-500 to-pink-600", category: "Premium" },
  { title: "Form Data Extract", description: "Extract AcroForm responses into downloadable CSV spreadsheets.", icon: "📊", href: "/form-data-extract", gradient: "bg-gradient-to-br from-emerald-500 to-teal-700", category: "Premium" },
  { title: "Bulk Rename", description: "Auto-rename dozens of PDFs by internal metadata tags and patterns.", icon: "🏷️", href: "/bulk-rename", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Premium" },
  { title: "Booklet Creator", description: "Create 2-up saddle-stitch booklets and 2x2 / 4x4 print imposition layouts.", icon: "📖", href: "/booklet", gradient: "bg-gradient-to-br from-orange-500 to-red-600", category: "Premium" },
  { title: "Search & Redact", description: "Auto-find and permanently redact words across entire documents.", icon: "⬛", href: "/search-redact", gradient: "bg-gradient-to-br from-slate-700 to-gray-950", category: "Premium" },
  { title: "Color Inverter", description: "Convert PDFs to dark mode, ink-saving grayscale, or high contrast.", icon: "🎨", href: "/pdf-inverter", gradient: "bg-gradient-to-br from-violet-500 to-purple-600", category: "Premium" },
  { title: "Secure Vault", description: "Client-encrypted browser document storage with master password.", icon: "🔐", href: "/vault", gradient: "bg-gradient-to-br from-cyan-500 to-blue-600", category: "Premium" },
  { title: "QR Code Stamp", description: "Stamp scannable QR codes and URLs onto every page of your PDF.", icon: "📱", href: "/qr-stamp", gradient: "bg-gradient-to-br from-green-500 to-emerald-700", category: "Premium" },
  { title: "Metadata Sanitizer", description: "Strip author names, dates, annotations, and hidden metadata.", icon: "🧹", href: "/metadata-sanitizer", gradient: "bg-gradient-to-br from-yellow-500 to-orange-700", category: "Premium" },
  { title: "Split by Bookmarks", description: "Extract chapters and sections from PDF bookmark outline structure.", icon: "📑", href: "/split-by-bookmarks", gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600", category: "Premium" },
];

const categories: { key: Category; label: string; icon: string }[] = [
  { key: "All", label: "All Tools (40+)", icon: "✨" },
  { key: "Popular", label: "Most Popular", icon: "🔥" },
  { key: "Studio & AI", label: "Studio & AI", icon: "⚡" },
  { key: "Edit", label: "Edit & Markup", icon: "✏️" },
  { key: "Convert", label: "Convert", icon: "🔄" },
  { key: "Security", label: "Security & Sign", icon: "🔒" },
  { key: "Organize", label: "Organize Pages", icon: "📑" },
  { key: "Premium", label: "Premium ⭐", icon: "👑" },
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
                NEW FLAGSHIP FEATURE
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                PDF Studio: One-Stop Multi-Operation Pipeline
              </h3>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Why upload 5 times to do 5 things? Delete pages, rotate orientation, add your digital signature, stamp watermarks, and compress all in one unified interactive workspace.
              </p>
            </div>

            <Link
              href="/studio"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-sm rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 shrink-0 group-hover:scale-105"
            >
              <span>⚡ Launch PDF Studio</span>
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
