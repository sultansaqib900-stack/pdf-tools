"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { TOOL_CATALOG, type ToolDefinition } from "@/lib/toolCatalog";

/**
 * Task-oriented synonyms and natural user queries.
 * Maps user intents (e.g. "shrink", "combine", "blackout", "dark mode") to tool routes.
 */
const TASK_SYNONYMS: Record<string, string[]> = {
  "/compress": ["shrink", "reduce", "smaller", "size", "downsize", "optimize", "email size", "compressor", "kb", "mb"],
  "/merge": ["combine", "join", "unite", "together", "append", "attach", "mix", "binder", "collate", "assemble"],
  "/split": ["cut", "separate", "extract pages", "divide", "break", "range", "portion", "slice", "subset"],
  "/edit-pdf": ["add text", "write", "type", "textbox", "draw", "box", "shapes", "rectangle", "circle", "ellipse", "line"],
  "/sign": ["signature", "esign", "e-sign", "initials", "draw signature", "stamp signature", "contract", "approval"],
  "/pdf-to-word": ["docx", "doc", "word document", "microsoft word", "office", "export word", "editable text"],
  "/word-to-pdf": ["docx to pdf", "convert doc", "word to pdf", "save as pdf", "doc to pdf"],
  "/pdf-to-excel": ["csv", "spreadsheet", "table", "data", "sheet", "tabular", "extract table", "excel"],
  "/ocr-pdf": ["scan", "scanned", "image to text", "extract text from image", "read text", "tesseract", "recognize", "text recognition"],
  "/redact": ["blackout", "black out", "hide", "censor", "remove text", "sensitive", "private", "confidential", "ssn", "pii"],
  "/search-redact": ["find and redact", "auto redact", "search redact", "bulk censor", "pattern redact"],
  "/protect": ["password", "encrypt", "lock", "security", "secure", "aes-256", "restrict"],
  "/unlock": ["remove password", "decrypt", "open", "forgot password", "unlocker"],
  "/delete-pages": ["remove pages", "trash pages", "delete page", "drop page", "discard"],
  "/organize": ["reorder", "move pages", "sort pages", "rearrange", "shuffle", "order"],
  "/rotate": ["turn", "orientation", "flip", "landscape", "portrait", "90 degrees", "upside down"],
  "/crop": ["margins", "trim", "white space", "border", "cut edge", "cropping"],
  "/resize": ["page size", "a4", "letter", "legal", "dimensions", "paper size", "scale page"],
  "/add-page-numbers": ["paginate", "numbering", "footer number", "header number", "page count"],
  "/watermark": ["stamp", "draft", "confidential watermark", "logo", "copyright", "text stamp"],
  "/pdf-to-images": ["jpg", "png", "jpeg", "extract images", "render pages", "photo export"],
  "/image-to-pdf": ["jpg to pdf", "png to pdf", "photos to pdf", "pictures to pdf", "jpeg to pdf"],
  "/chat-pdf": ["ai", "ask pdf", "summary", "summarize", "gemini", "assistant", "question", "chat with document"],
  "/bates-numbering": ["legal stamp", "bates stamp", "litigation", "court numbering", "lawyer", "case number", "bates"],
  "/certificate-generator": ["bulk certificates", "diploma", "awards", "names from csv", "bulk generation"],
  "/studio": ["workspace", "pipeline", "multi-step", "chain", "all in one", "editor", "suite"],
  "/pii-guardian": ["pii", "ssn", "credit card", "personal info", "data leak", "scan pii", "phone numbers"],
  "/metadata-sanitizer": ["strip metadata", "clean metadata", "remove author", "clean pdf", "privacy wipe"],
  "/metadata": ["view metadata", "edit author", "edit title", "properties"],
  "/pdf-diff": ["compare", "diff", "changes", "revisions", "side by side", "version compare"],
  "/vault": ["secure storage", "encrypted store", "local vault", "save pdf", "browser vault"],
  "/pdf-inverter": ["dark mode", "invert colors", "night mode", "high contrast", "black background"],
  "/booklet": ["booklet", "print booklet", "n-up", "2-up", "4-up", "imposition", "pamphlet"],
  "/form-data-extract": ["extract form", "export form responses", "acroform to csv", "form fields"],
  "/fill-form": ["fill form", "acroform", "type form", "interactive form", "pdf form"],
  "/bulk-rename": ["rename multiple", "batch rename", "name by title", "filename pattern"],
  "/split-by-bookmarks": ["split chapters", "bookmarks to pdf", "outline split", "table of contents"],
  "/recipes": ["automation", "macro", "batch recipe", "auto workflow", "one-click"],
  "/batch": ["batch process", "multi-file", "queue", "bulk compress", "bulk protect"],
  "/extract-text": ["copy text", "raw text", "plain text", "extract words"],
  "/word-counter": ["word count", "character count", "reading time", "length", "stats"],
};

export interface ToolSearchProps {
  className?: string;
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSelect?: () => void;
}

export default function ToolSearch({
  className = "",
  placeholder = "Search PDF tools (e.g., compress, merge, e-sign, redact, docx)...",
  compact = false,
  autoFocus = false,
  onSelect,
}: ToolSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: top 8 popular tools
      return TOOL_CATALOG.slice(0, 8);
    }

    const scored = TOOL_CATALOG.map((tool) => {
      let score = 0;
      const titleLower = tool.title.toLowerCase();
      const descLower = tool.description.toLowerCase();
      const href = tool.href.toLowerCase();
      const synonyms = TASK_SYNONYMS[tool.href] || [];

      // Exact title match
      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 60;
      else if (titleLower.includes(q)) score += 40;

      // Synonym match
      if (synonyms.some((s) => s === q)) score += 80;
      else if (synonyms.some((s) => s.includes(q) || q.includes(s))) score += 45;

      // Description match
      if (descLower.includes(q)) score += 20;

      // Route match
      if (href.replace("/", "").includes(q)) score += 30;

      return { tool, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.tool)
      .slice(0, 8);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setIsOpen(true);
        return;
      }
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          window.location.href = selected.href;
          setIsOpen(false);
          onSelect?.();
        }
      }
    },
    [isOpen, results, selectedIndex, onSelect]
  );

  const quickChips = [
    { label: "Compress", query: "compress" },
    { label: "Merge", query: "merge" },
    { label: "Edit", query: "edit" },
    { label: "Sign", query: "sign" },
    { label: "Convert to Word", query: "docx" },
  ];

  const open = isOpen && (query.trim().length > 0 || !compact);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="flex items-center bg-[var(--card)] border border-[var(--card-border)] rounded-xl transition-all px-4 py-3 text-sm shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <svg
          className="w-5 h-5 mr-3 text-[var(--muted)] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search PDF tools"
          aria-autocomplete="list"
          aria-expanded={open}
          className="bg-transparent border-none outline-none w-full text-[var(--foreground)] placeholder:text-[var(--muted)] font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-md text-xs font-bold"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Filter Chips (Shown when not in a dropdown and no active search) */}
      {!compact && !query && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 px-1 text-xs text-[var(--muted)]">
          <span className="font-semibold text-[11px]">Quick actions:</span>
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setQuery(chip.query);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--card-border)] hover:border-indigo-500 hover:text-indigo-600 transition-colors text-[11px] font-medium"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Instant Search Results Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-[var(--card-border)]/60 animate-fadeIn"
        >
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)] mb-1">
                No tools matched &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] mb-3">Try searching for compress, merge, sign, bates, or redact.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] hover:border-indigo-500"
              >
                Clear Search
              </button>
            </div>
          ) : (
            results.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              const isPremium = tool.category === "Premium";

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => {
                    setIsOpen(false);
                    onSelect?.();
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isSelected ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300" : "hover:bg-[var(--background)]"
                  }`}
                >
                  <span className="text-xl shrink-0" aria-hidden="true">
                    {tool.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--foreground)] truncate">
                        {tool.title}
                      </p>
                      {tool.badge && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                          {tool.badge}
                        </span>
                      )}
                      {isPremium && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white">
                          Premium
                        </span>
                      )}
                      {tool.hasFreePreview && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded border border-emerald-300 text-emerald-700 bg-emerald-50">
                          Preview
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                      {tool.description}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-[var(--muted)] shrink-0 ml-2">
                    Open →
                  </span>
                </Link>
              );
            })
          )}

          {results.length > 0 && (
            <div className="px-4 py-2 bg-[var(--background)] flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Use ↑↓ keys to navigate, Enter to select</span>
              <span>{results.length} tools found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
