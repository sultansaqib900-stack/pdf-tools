"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import Icon, { type IconName } from "@/components/ui/Icon";

type Category = "All" | "Edit" | "Convert" | "Security" | "Organize" | "Extract" | "Premium";

interface ToolDef {
  title: string;
  description: string;
  icon: IconName;
  href: string;
  category: Category;
}

const allTools: ToolDef[] = [
  { title: "Compress PDF", description: "Reduce file size while keeping quality.", icon: "compress", href: "/compress", category: "Edit" },
  { title: "Merge PDF", description: "Combine multiple PDFs into one document.", icon: "merge", href: "/merge", category: "Edit" },
  { title: "Chat with PDF", description: "Upload a PDF and ask AI questions about its content.", icon: "sparkles", href: "/chat-pdf", category: "Extract" },
  { title: "Fill PDF Form", description: "Fill form fields and download the completed PDF.", icon: "form", href: "/fill-form", category: "Edit" },
  { title: "Flatten PDF", description: "Merge form fields and layers into page content.", icon: "flatten", href: "/flatten-pdf", category: "Edit" },
  { title: "Reverse PDF Order", description: "Flip the entire page sequence of any PDF.", icon: "reverse", href: "/reverse-pdf", category: "Organize" },
  { title: "Split PDF", description: "Extract pages or split into separate files.", icon: "split", href: "/split", category: "Edit" },
  { title: "Delete Pages", description: "Remove unwanted pages from your PDF.", icon: "delete", href: "/delete-pages", category: "Edit" },
  { title: "Organize Pages", description: "Drag and drop to reorder PDF pages.", icon: "organize", href: "/organize", category: "Organize" },
  { title: "Crop PDF", description: "Remove unwanted margins from PDF pages.", icon: "crop", href: "/crop", category: "Edit" },
  { title: "Edit PDF", description: "Add text boxes, shapes, and drawings to any PDF.", icon: "edit", href: "/edit-pdf", category: "Edit" },
  { title: "Resize PDF", description: "Change page size to A4, Letter, Legal.", icon: "resize", href: "/resize", category: "Edit" },
  { title: "Image to PDF", description: "Convert JPG, PNG, and other images to PDF.", icon: "image", href: "/image-to-pdf", category: "Convert" },
  { title: "Scan to PDF", description: "Scan documents with your camera and convert to PDF.", icon: "camera", href: "/scan-to-pdf", category: "Convert" },
  { title: "OCR PDF", description: "Extract text from scanned PDFs and images.", icon: "scan", href: "/ocr-pdf", category: "Extract" },
  { title: "PDF to Word", description: "Convert PDF to editable Word DOCX files.", icon: "fileWord", href: "/pdf-to-word", category: "Convert" },
  { title: "Word to PDF", description: "Convert Word DOCX documents to PDF.", icon: "fileText", href: "/word-to-pdf", category: "Convert" },
  { title: "Repair PDF", description: "Fix corrupted or damaged PDF files.", icon: "repair", href: "/repair-pdf", category: "Edit" },
  { title: "PDF to PDF/A", description: "Convert PDF to archive format for preservation.", icon: "archive", href: "/pdf-to-pdfa", category: "Convert" },
  { title: "PDF to Images", description: "Extract all pages as high-quality images.", icon: "image", href: "/pdf-to-images", category: "Convert" },
  { title: "PDF to Excel", description: "Extract tables from PDF as CSV using AI.", icon: "fileSheet", href: "/pdf-to-excel", category: "Convert" },
  { title: "Word Counter", description: "Count words, characters, and pages.", icon: "hash", href: "/word-counter", category: "Extract" },
  { title: "Insert Blank Pages", description: "Add empty pages to any PDF.", icon: "insertPage", href: "/insert-blank", category: "Edit" },
  { title: "Annotate PDF", description: "Highlight, underline & strikethrough text.", icon: "annotate", href: "/annotate", category: "Edit" },
  { title: "HTML to PDF", description: "Convert HTML markup to a downloadable PDF.", icon: "code", href: "/html-to-pdf", category: "Convert" },
  { title: "Redact PDF", description: "Permanently black out sensitive text and areas.", icon: "redact", href: "/redact", category: "Security" },
  { title: "Text to PDF", description: "Convert plain text to a formatted PDF.", icon: "type", href: "/text-to-pdf", category: "Convert" },
  { title: "Password Protect", description: "Encrypt your PDF with a password.", icon: "lock", href: "/protect", category: "Security" },
  { title: "Unlock PDF", description: "Remove password protection from PDF files.", icon: "unlock", href: "/unlock", category: "Security" },
  { title: "e-Sign PDF", description: "Draw your signature and place it on any PDF.", icon: "signature", href: "/sign", category: "Security" },
  { title: "Watermark PDF", description: "Add text watermarks to every page.", icon: "droplet", href: "/watermark", category: "Security" },
  { title: "Extract Text", description: "Extract text content from any PDF.", icon: "fileText", href: "/extract-text", category: "Extract" },
  { title: "Add Page Numbers", description: "Insert page numbers at any position.", icon: "numbers", href: "/add-page-numbers", category: "Extract" },
  { title: "Metadata Editor", description: "View and edit PDF title, author, subject.", icon: "info", href: "/metadata", category: "Extract" },
  { title: "Rotate PDF", description: "Rotate pages by 90, 180, or 270 degrees.", icon: "rotate", href: "/rotate", category: "Edit" },
  { title: "Batch Process", description: "Process multiple PDFs at once (Premium).", icon: "settings", href: "/batch", category: "Premium" },
  { title: "PDF Diff", description: "Compare two PDFs side by side — see changes.", icon: "diff", href: "/pdf-diff", category: "Premium" },
  { title: "Certificate Generator", description: "Bulk-generate personalized PDF certificates.", icon: "award", href: "/certificate-generator", category: "Premium" },
  { title: "PDF to Audio", description: "Listen to PDFs with text-to-speech.", icon: "headphones", href: "/pdf-to-audio", category: "Premium" },
  { title: "Form Data Extract", description: "Extract PDF form data to CSV.", icon: "fileSheet", href: "/form-data-extract", category: "Premium" },
  { title: "Bulk Rename", description: "Rename PDFs by title, author, or metadata.", icon: "tag", href: "/bulk-rename", category: "Premium" },
  { title: "Booklet Creator", description: "Create N-up booklets for printing.", icon: "book", href: "/booklet", category: "Premium" },
  { title: "Search & Redact", description: "Auto-redact words across entire document.", icon: "search", href: "/search-redact", category: "Premium" },
  { title: "Color Inverter", description: "Invert, grayscale, or boost contrast.", icon: "contrast", href: "/pdf-inverter", category: "Premium" },
  { title: "PDF Vault", description: "Encrypted browser document storage.", icon: "vault", href: "/vault", category: "Premium" },
  { title: "QR Code Stamp", description: "Add QR codes to every PDF page.", icon: "qr", href: "/qr-stamp", category: "Premium" },
  { title: "Metadata Sanitizer", description: "Strip all hidden metadata from PDFs.", icon: "eraser", href: "/metadata-sanitizer", category: "Premium" },
  { title: "Split by Bookmarks", description: "Extract chapters from PDF outline/bookmarks.", icon: "bookmark", href: "/split-by-bookmarks", category: "Premium" },
  { title: "Bates Numbering", description: "Add sequential page numbers to every page.", icon: "numbers", href: "/bates-numbering", category: "Premium" },
];

const categories: { key: Category; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Edit", label: "Edit" },
  { key: "Convert", label: "Convert" },
  { key: "Security", label: "Security" },
  { key: "Organize", label: "Organize" },
  { key: "Extract", label: "Extract" },
  { key: "Premium", label: "Premium" },
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
      <div className="relative w-full max-w-md mx-auto mb-5">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
        <input
          type="search"
          placeholder="Search tools"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search tools"
          className="input pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-7">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            aria-pressed={category === c.key}
            className={`px-3 py-1.5 rounded-[var(--r-full)] text-[0.8125rem] font-medium border transition-colors duration-150 ${
              category === c.key
                ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                : "bg-[var(--surface)] text-[var(--muted-strong)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-[var(--r-lg)] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--muted)] mb-3">
            <Icon name="search" size={20} />
          </span>
          <p className="text-sm font-medium text-[var(--foreground)]">No tools match your search</p>
          <p className="text-[0.8125rem] text-[var(--muted)] mt-1">Try a different term or clear the filters.</p>
          <button
            onClick={() => { setQuery(""); setCategory("All"); }}
            className="btn btn-secondary mt-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((tool) => (
            <ToolCard key={tool.href} {...tool} category={tool.category} />
          ))}
        </div>
      )}
    </div>
  );
}
