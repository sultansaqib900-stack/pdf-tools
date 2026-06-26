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
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PageData {
  pageNum: number;
  width: number;
  height: number;
}

export default function RedactPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
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
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
      for (const r of rects[currentPage] || []) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    };
  }, [isDrawing, drawStart, getCanvasCoords, pageImages, currentPage, rects]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    setIsDrawing(false);
    const end = getCanvasCoords(e);
    const x = Math.min(drawStart.x, end.x);
    const y = Math.min(drawStart.y, end.y);
    const w = Math.abs(end.x - drawStart.x);
    const h = Math.abs(end.y - drawStart.y);
    if (w > 5 && h > 5) {
      const newRect: Rect = { id: crypto.randomUUID(), x, y, w, h };
      setRects((prev) => {
        const next = [...prev];
        next[currentPage] = [...(next[currentPage] || []), newRect];
        return next;
      });
    }
    setDrawStart(null);
  }, [isDrawing, drawStart, getCanvasCoords, currentPage]);

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
    const img = new Image();
    img.src = pageImages[currentPage];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      for (const r of rects[currentPage] || []) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    };
  }, [pageImages, currentPage, rects]);

  const runRedact = useCallback(async () => {
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
          page.drawRectangle({
            x: r.x * scale,
            y: page.getHeight() - (r.y + r.h) * scale,
            width: r.w * scale,
            height: r.h * scale,
            color: rgb(0, 0, 0),
          });
        }
      }

      const outBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to redact PDF. The file may be encrypted or corrupted.");
    }
    setSaving(false);
  }, [file, pdfDoc, rects, saving, usage]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runRedact();
  }, [runRedact]);

  const hasRects = rects.some((r) => r.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Redact PDF - Free Online Tool"
        description="Permanently black out sensitive text and areas in your PDF documents. 100% private, no uploads."
        url="https://allaboutpdfediting.xyz/redact"
      />
      <HowToJsonLd name="Redact PDF Online" description="Permanently black out sensitive content in PDF files" steps={[{name:"Upload PDF",text:"Select the PDF with content to redact"},{name:"Select areas to redact",text:"Draw black boxes over sensitive text and images"},{name:"Download redacted PDF",text:"Download the PDF with permanently removed content"}]} />
      <AiSummaryJsonLd name="Redact PDF" summary="Permanently black out sensitive text images and areas in PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Area redaction","Text blackout","Permanent removal","Client-side","No server uploads"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Redact PDF</h1>
        <p className="text-[var(--muted)]">Permanently black out sensitive information — text, numbers, or images.</p>
      </div>

      <ToolInfo name="Redact PDF" description="Your file stays completely private. All redaction happens locally — no uploads, no servers. Drag to draw black rectangles over sensitive content, then download the permanently redacted PDF." />

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
            <span className="text-5xl">⬛</span>
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
                <span className="text-xs text-[var(--muted)]">{hasRects ? `${rects.flat().length} redactions` : "Drag to redact"}</span>
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

            <div ref={containerRef} className="border border-[var(--card-border)] rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { if (isDrawing) setIsDrawing(false); setDrawStart(null); }}
                className="w-full cursor-crosshair"
                style={{ maxHeight: "70vh", objectFit: "contain" }}
              />
            </div>

            <p className="text-xs text-[var(--muted)] text-center">
              Click and drag to draw redaction boxes over sensitive content. Repeat on each page.
            </p>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runRedact} onDismiss={() => setError(null)} />}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runRedact(); }} />}

        {file && (
          <button
            onClick={process}
            disabled={!hasRects || saving || showTimer}
            className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Applying redactions...
              </span>
            ) : "Apply Redactions & Download"}
          </button>
        )}

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB & 5s wait.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB & no limits</a>
          </p>
        )}

        <SuccessAnimation show={success} message="Redactions applied!" details={`${rects.flat().length} areas redacted across ${pages.length} page(s).`} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Redact PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Permanently remove sensitive information from your PDF documents. Draw black rectangles over text, numbers, images, or any content you want to hide. The redaction is permanent — once applied, the content underneath cannot be recovered.</p>
          <p>Perfect for: hiding personal information before sharing documents, redacting confidential data in legal forms, removing sensitive details from contracts, and protecting privacy in shared PDFs.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. Keywords: redact PDF online free, black out text PDF, hide sensitive information PDF, PDF redaction tool.</p>
        </div>
      </div>

      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
