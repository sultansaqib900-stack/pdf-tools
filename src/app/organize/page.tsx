"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import { isPremium, checkFileSize } from "@/lib/premium";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

export default function OrganizePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("organize"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();
    setPageCount(count);
    setOrder(Array.from({ length: count }, (_, i) => i));
  }, []);

  const movePage = useCallback((from: number, to: number) => {
    if (from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(fromIdx) && fromIdx !== toIdx) {
      movePage(fromIdx, toIdx);
    }
    setDragOverIdx(null);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDragOverIdx(null);
    setDraggedIdx(null);
  };

  const runOrganize = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, order);
      pages.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reorganized-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Organize Pages", pdfBytes.length);
      setSuccess(true);
    } catch { setError("Failed to reorganize."); }
    setProcessing(false);
  }, [file, order]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runOrganize();
  }, [runOrganize]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Organize PDF - Free Online Tool"
        description="Reorder PDF pages online for free. Drag and drop to arrange pages. No uploads required."
        url="https://allaboutpdfediting.xyz/organize"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Organize PDF Pages</h1>
        <p className="text-[var(--muted)]">Reorder, sort, and rearrange pages in your PDF document.</p>
      </div>

      <ToolInfo name="Organize PDF" description="Your file stays private. All page reordering happens locally in your browser — no uploads, no servers. Drag pages to reorder and download instantly." />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📑</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB &middot; {pageCount} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {order.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-[var(--muted)] mb-4">
              Drag page tiles to reorder. Current: {order.map((i) => i + 1).join(" → ")}
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {order.map((pageIdx, displayIdx) => {
                const isOver = dragOverIdx === displayIdx && draggedIdx !== displayIdx;
                const isDragging = draggedIdx === displayIdx;

                return (
                  <div
                    key={`${pageIdx}-${displayIdx}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, displayIdx)}
                    onDragOver={(e) => handleDragOver(e, displayIdx)}
                    onDrop={(e) => handleDrop(e, displayIdx)}
                    onDragEnd={handleDragEnd}
                    className={`relative rounded-xl border-2 flex flex-col items-center justify-center text-sm font-bold cursor-grab active:cursor-grabbing transition-all select-none aspect-[3/4] ${
                      isDragging
                        ? "opacity-40 border-indigo-500 scale-95"
                        : isOver
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-105 shadow-lg"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-300 hover:shadow"
                    }`}
                  >
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-xs text-[var(--muted)] font-mono">p.{pageIdx + 1}</div>
                    <div className="absolute top-1 left-1.5 text-[10px] text-[var(--muted)] font-mono">#{displayIdx + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runOrganize(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Reorganizing pages..." />

        {order.length > 0 && (
          <>
            <button
              onClick={process}
              disabled={processing || order.every((v, i) => v === i) || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Reorganizing pages...
                </span>
              ) : "Save New Order"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB &amp; 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runOrganize} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Pages reorganized successfully!" details={`${pageCount} pages reordered`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Organize PDF Pages</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Rearrange pages in your PDF document online for free. Drag and drop pages into any order you want. Perfect for fixing scanned documents where pages are out of order, rearranging sections in a report, or organizing a multi-page presentation.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. Your original file is never transmitted or stored.</p>
          <p>Keywords: organize PDF pages online free, reorder PDF pages, rearrange PDF file, PDF page organizer free online.</p>
        </div>
      </div>

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
