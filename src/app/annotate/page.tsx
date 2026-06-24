"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

type AnnotateMode = "highlight" | "underline" | "strikethrough";

interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: AnnotateMode;
}

interface PageData {
  pageNum: number;
  width: number;
  height: number;
}

const MODES: { key: AnnotateMode; label: string; fill: string; border: string; cursor: string }[] = [
  { key: "highlight", label: "Highlight", fill: "rgba(255,255,0,0.3)", border: "#ca8a04", cursor: "cell" },
  { key: "underline", label: "Underline", fill: "rgba(0,160,0,0.25)", border: "#16a34a", cursor: "text" },
  { key: "strikethrough", label: "Strike", fill: "rgba(220,0,0,0.25)", border: "#dc2626", cursor: "text" },
];

export default function AnnotatePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rects, setRects] = useState<Rect[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [annotateMode, setAnnotateMode] = useState<AnnotateMode>("highlight");
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackToolVisit("annotate"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setError(null);
    setSuccess(false);
    setFile(f);
    setCurrentPage(0);
    setRects([]);
    setPageImages([]);
    setPdfDoc(null);

    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    pdfBytesRef.current = bytes;
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPdfDoc(doc);

    const pageData: PageData[] = doc.getPages().map((_: any, i: number) => ({
      pageNum: i + 1,
      width: doc.getPage(i).getWidth(),
      height: doc.getPage(i).getHeight(),
    }));
    setPages(pageData);
    setRects(pageData.map(() => []));
  }, []);

  useEffect(() => {
    if (!file || !pdfDoc || currentPage >= pages.length) return;
    const renderPage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      if (!GlobalWorkerOptions.workerSrc && !GlobalWorkerOptions.workerPort) {
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const pdfData = await getDocument({ data: pdfBytesRef.current!.slice(0) }).promise;
      const pdfPage = await pdfData.getPage(currentPage + 1);
      const vp = pdfPage.getViewport({ scale: 1.5 });
      canvas.width = vp.width;
      canvas.height = vp.height;
      await pdfPage.render({ canvas: canvas, viewport: vp }).promise;
      setPageImages((prev) => {
        const next = [...prev];
        next[currentPage] = canvas.toDataURL();
        return next;
      });
    };
    renderPage();
  }, [file, pdfDoc, currentPage]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const modeConfig = MODES.find((m) => m.key === annotateMode)!;

  const redrawAll = useCallback((ctx: CanvasRenderingContext2D) => {
    const img = new Image();
    img.src = pageImages[currentPage];
    img.onload = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0);
      for (const r of rects[currentPage] || []) {
        if (r.mode === "highlight") {
          ctx.fillStyle = "rgba(255,255,0,0.3)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#ca8a04";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(r.x, r.y, r.w, r.h);
        } else if (r.mode === "underline") {
          ctx.fillStyle = "rgba(0,160,0,0.2)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y + r.h);
          ctx.lineTo(r.x + r.w, r.y + r.h);
          ctx.stroke();
        } else if (r.mode === "strikethrough") {
          ctx.fillStyle = "rgba(220,0,0,0.2)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y + r.h / 2);
          ctx.lineTo(r.x + r.w, r.y + r.h / 2);
          ctx.stroke();
        }
      }
    };
  }, [pageImages, currentPage, rects]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setDrawStart(getCanvasCoords(e));
  }, [getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    const current = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = pageImages[currentPage];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const x = Math.min(drawStart.x, current.x);
      const y = Math.min(drawStart.y, current.y);
      const w = Math.abs(current.x - drawStart.x);
      const h = Math.abs(current.y - drawStart.y);
      if (w > 5 && h > 5) {
        if (annotateMode === "highlight") {
          ctx.fillStyle = "rgba(255,255,0,0.3)";
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = modeConfig.border;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
        } else if (annotateMode === "underline") {
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
        } else if (annotateMode === "strikethrough") {
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
        }
      }
      for (const r of rects[currentPage] || []) {
        if (r.mode === "highlight") {
          ctx.fillStyle = "rgba(255,255,0,0.3)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#ca8a04";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(r.x, r.y, r.w, r.h);
        } else if (r.mode === "underline") {
          ctx.fillStyle = "rgba(0,160,0,0.2)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y + r.h);
          ctx.lineTo(r.x + r.w, r.y + r.h);
          ctx.stroke();
        } else if (r.mode === "strikethrough") {
          ctx.fillStyle = "rgba(220,0,0,0.2)";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y + r.h / 2);
          ctx.lineTo(r.x + r.w, r.y + r.h / 2);
          ctx.stroke();
        }
      }
    };
  }, [isDrawing, drawStart, getCanvasCoords, pageImages, currentPage, rects, annotateMode, modeConfig]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    setIsDrawing(false);
    const end = getCanvasCoords(e);
    const x = Math.min(drawStart.x, end.x);
    const y = Math.min(drawStart.y, end.y);
    const w = Math.abs(end.x - drawStart.x);
    const h = Math.abs(end.y - drawStart.y);
    if (w > 5 && h > 5) {
      const newRect: Rect = { id: crypto.randomUUID(), x, y, w, h, mode: annotateMode };
      setRects((prev) => {
        const next = [...prev];
        next[currentPage] = [...(next[currentPage] || []), newRect];
        return next;
      });
    }
    setDrawStart(null);
  }, [isDrawing, drawStart, getCanvasCoords, currentPage, annotateMode]);

  const undoLast = useCallback(() => {
    setRects((prev) => {
      const next = [...prev];
      next[currentPage] = (next[currentPage] || []).slice(0, -1);
      return next;
    });
  }, [currentPage]);

  useEffect(() => {
    if (!pageImages[currentPage]) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    redrawAll(ctx);
  }, [pageImages, currentPage, rects]);

  const runAnnotate = useCallback(async () => {
    if (!file || !pdfDoc || saving) return;
    setSaving(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setSaving(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const bytes = pdfBytesRef.current!.slice(0);
      const outDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const allRects = rects;
      const canvas = canvasRef.current;
      if (!canvas) { setError("Rendering error. Please try again."); setSaving(false); return; }
      const scale = outDoc.getPage(0).getWidth() / canvas.width;

      for (let i = 0; i < allRects.length; i++) {
        const pageRects = allRects[i] || [];
        if (pageRects.length === 0) continue;
        const page = outDoc.getPage(i);
        for (const r of pageRects) {
          if (r.mode === "highlight") {
            page.drawRectangle({
              x: r.x * scale,
              y: page.getHeight() - (r.y + r.h) * scale,
              width: r.w * scale,
              height: r.h * scale,
              color: rgb(1, 1, 0),
              opacity: 0.3,
            });
          } else if (r.mode === "underline") {
            page.drawLine({
              start: { x: r.x * scale, y: page.getHeight() - (r.y + r.h) * scale },
              end: { x: (r.x + r.w) * scale, y: page.getHeight() - (r.y + r.h) * scale },
              thickness: 2,
              color: rgb(0, 0.6, 0),
            });
          } else if (r.mode === "strikethrough") {
            page.drawLine({
              start: { x: r.x * scale, y: page.getHeight() - (r.y + r.h / 2) * scale },
              end: { x: (r.x + r.w) * scale, y: page.getHeight() - (r.y + r.h / 2) * scale },
              thickness: 2,
              color: rgb(1, 0, 0),
            });
          }
        }
      }

      const outBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(`annotated-${file.name}`, "annotate", blob.size);
      setSuccess(true);
    } catch {
      setError("Failed to annotate PDF. The file may be encrypted or corrupted.");
    }
    setSaving(false);
  }, [file, pdfDoc, rects, saving, usage]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runAnnotate();
  }, [runAnnotate]);

  const hasRects = rects.some((r) => r.length > 0);
  const totalAnnotations = rects.flat().length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Annotate PDF - Free Online Tool"
        description="Highlight, underline, and strikethrough text in PDF files. Free online PDF annotation tool."
        url="https://allaboutpdfediting.xyz/annotate"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Annotate PDF</h1>
        <p className="text-[var(--muted)]">Highlight, underline, or strikethrough text in your PDF documents.</p>
      </div>

      <ToolInfo name="Annotate PDF" description="Your file stays completely private. All annotation happens locally — no uploads, no servers. Drag to draw highlights, underlines, or strikethroughs over text, then download the annotated PDF." />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} />
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
            <span className="text-5xl">🖍</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && pages.length > 0 && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB · {pages.length} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {file && pages.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 text-sm rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-40 transition"
                >
                  ← Prev
                </button>
                <span className="text-sm text-[var(--muted)]">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage >= pages.length - 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">{hasRects ? `${totalAnnotations} annotations` : "Drag to annotate"}</span>
                {hasRects && (
                  <button
                    onClick={undoLast}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                  >
                    Undo Last
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setAnnotateMode(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${
                    annotateMode === m.key
                      ? "ring-2 ring-offset-1 " + (
                          m.key === "highlight" ? "ring-yellow-500 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20" :
                          m.key === "underline" ? "ring-green-500 border-green-400 bg-green-50 dark:bg-green-950/20" :
                          "ring-red-500 border-red-400 bg-red-50 dark:bg-red-950/20"
                        )
                      : "border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--background)]"
                  }`}
                >
                  <span className={`w-3 h-3 rounded ${m.key === "highlight" ? "bg-yellow-400" : m.key === "underline" ? "bg-green-500" : "bg-red-500"}`} />
                  {m.label}
                </button>
              ))}
            </div>

            <div ref={containerRef} className="border border-[var(--card-border)] rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { if (isDrawing) setIsDrawing(false); setDrawStart(null); }}
                className="w-full"
                style={{ cursor: modeConfig.cursor, maxHeight: "70vh", objectFit: "contain" }}
              />
            </div>

            <p className="text-xs text-[var(--muted)] text-center">
              Select an annotation mode above, then click and drag on the page to apply. Repeat on each page.
            </p>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runAnnotate} onDismiss={() => setError(null)} />}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runAnnotate(); }} />}

        {file && (
          <button
            onClick={process}
            disabled={!hasRects || saving || showTimer}
            className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Applying annotations...
              </span>
            ) : "Download Annotated PDF"}
          </button>
        )}

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB & 5s wait.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB & no limits</a>
          </p>
        )}

        <SuccessAnimation show={success} message="Annotations applied!" details={`${totalAnnotations} annotations across ${pages.length} page(s).`} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Annotate PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add highlights, underlines, and strikethroughs to your PDF documents. Select an annotation mode, then click and drag over any text to mark it up. All annotations are drawn as colored rectangles and lines — perfect for studying, reviewing documents, or marking up drafts.</p>
          <p>Perfect for: highlighting key passages in research papers, underlining important clauses in contracts, strikethrough text in drafts, and reviewing PDF documents with visual annotations.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. Keywords: annotate PDF online free, highlight PDF, underline PDF, strikethrough PDF, PDF annotation tool.</p>
        </div>
      </div>

      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
