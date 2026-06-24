"use client";

import { useCallback, useState } from "react";

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

export function useToolHistory() {
  const [recentTools, setRecentTools] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const r = localStorage.getItem(RECENT_KEY);
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  });
  const [exportHistory, setExportHistory] = useState<ExportEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const e = localStorage.getItem(EXPORT_KEY);
      return e ? JSON.parse(e) : [];
    } catch {
      return [];
    }
  });

  const trackToolVisit = useCallback((path: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((t) => t.path !== path);
      const next = [{ path, label: getLabel(path), timestamp: Date.now() }, ...filtered].slice(0, 10);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const trackExport = useCallback((fileName: string, tool: string, size: number) => {
    const entry: ExportEntry = {
      id: crypto.randomUUID(),
      fileName,
      tool,
      size,
      date: new Date().toISOString(),
    };
    setExportHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      try { localStorage.setItem(EXPORT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentTools([]);
    setExportHistory([]);
    try {
      localStorage.removeItem(RECENT_KEY);
      localStorage.removeItem(EXPORT_KEY);
    } catch {}
  }, []);

  return { recentTools, exportHistory, trackToolVisit, trackExport, clearHistory };
}
