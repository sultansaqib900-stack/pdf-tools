"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface HistoryEntry {
  path: string;
  label: string;
  timestamp: number;
}

export interface ExportEntry {
  fileName: string;
  tool: string;
  size: number;
  date: string;
  id: string;
}

const RECENT_KEY = "pdftools:recent";
const EXPORT_KEY = "pdftools:exports";
const HISTORY_EVENT = "pdftools:history-change";
const EMPTY_RECENT: HistoryEntry[] = [];
const EMPTY_EXPORTS: ExportEntry[] = [];

let recentCacheRaw: string | null | undefined;
let recentCache: HistoryEntry[] = EMPTY_RECENT;
let exportCacheRaw: string | null | undefined;
let exportCache: ExportEntry[] = EMPTY_EXPORTS;

function getLabel(path: string): string {
  const map: Record<string, string> = {
    compress: "Compress PDF",
    merge: "Merge PDFs",
    split: "Split PDF",
    "image-to-pdf": "Image to PDF",
    "pdf-to-images": "PDF to Images",
    rotate: "Rotate PDF",
    "extract-text": "Extract Text",
    "add-page-numbers": "Add Page Numbers",
    protect: "Password Protect",
    "html-to-pdf": "HTML to PDF",
    sign: "e-Sign PDF",
    unlock: "Unlock PDF",
    watermark: "Watermark PDF",
    "delete-pages": "Delete Pages",
    "text-to-pdf": "Text to PDF",
    organize: "Organize Pages",
    metadata: "Metadata Editor",
    resize: "Resize PDF",
    crop: "Crop PDF",
    batch: "Batch Process",
    "fill-form": "Fill PDF Form",
    flatten: "Flatten PDF",
    "reverse-pdf": "Reverse PDF",
    "chat-pdf": "Chat with PDF",
    redact: "Redact PDF",
    annotate: "Annotate PDF",
    "insert-blank": "Insert Blank Pages",
    "word-counter": "Word Counter",
    "pdf-to-excel": "PDF to Excel",
  };
  return map[path] || path.replace(/-/g, " ");
}

function safelyParse<T>(raw: string | null, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch {
    return fallback;
  }
}

function getRecentSnapshot(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_RECENT;
  const raw = localStorage.getItem(RECENT_KEY);
  if (raw !== recentCacheRaw) {
    recentCacheRaw = raw;
    recentCache = safelyParse(raw, EMPTY_RECENT);
  }
  return recentCache;
}

function getExportSnapshot(): ExportEntry[] {
  if (typeof window === "undefined") return EMPTY_EXPORTS;
  const raw = localStorage.getItem(EXPORT_KEY);
  if (raw !== exportCacheRaw) {
    exportCacheRaw = raw;
    exportCache = safelyParse(raw, EMPTY_EXPORTS);
  }
  return exportCache;
}

function subscribeToHistory(onStoreChange: () => void): () => void {
  window.addEventListener(HISTORY_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(HISTORY_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeHistory(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function useToolHistory() {
  // useSyncExternalStore supplies empty server snapshots for hydration, then
  // reads localStorage after hydration. This prevents header/page mismatches and
  // keeps every hook instance synchronized after an export.
  const recentTools = useSyncExternalStore(subscribeToHistory, getRecentSnapshot, () => EMPTY_RECENT);
  const exportHistory = useSyncExternalStore(subscribeToHistory, getExportSnapshot, () => EMPTY_EXPORTS);

  const trackToolVisit = useCallback((path: string) => {
    const filtered = getRecentSnapshot().filter((tool) => tool.path !== path);
    const next = [{ path, label: getLabel(path), timestamp: Date.now() }, ...filtered].slice(0, 10);
    try { writeHistory(RECENT_KEY, next); } catch {}
  }, []);

  const trackExport = useCallback((fileName: string, tool: string, size: number) => {
    const entry: ExportEntry = {
      id: crypto.randomUUID(),
      fileName,
      tool,
      size,
      date: new Date().toISOString(),
    };
    const next = [entry, ...getExportSnapshot()].slice(0, 50);
    try { writeHistory(EXPORT_KEY, next); } catch {}
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_KEY);
      localStorage.removeItem(EXPORT_KEY);
      window.dispatchEvent(new Event(HISTORY_EVENT));
    } catch {}
  }, []);

  return { recentTools, exportHistory, trackToolVisit, trackExport, clearHistory };
}
