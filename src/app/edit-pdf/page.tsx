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
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("edit-pdf");

interface TextBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  color: string;
}

interface Shape {
  id: string;
  type: "rect" | "circle" | "line";
  x1: number; y1: number; x2: number; y2: number;
  color: string;
  fill: string;
  width: number;
}

type Tool = "select" | "text" | "rect" | "circle" | "line";

export default function EditPdfPage() {
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
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [textBoxes, setTextBoxes] = useState<TextBox[][]>([]);
  const [shapes, setShapes] = useState<Shape[][]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState("#2563eb");
  const [currentFill, setCurrentFill] = useState("rgba(37,99,235,0.1)");
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const editorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileBytesRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("edit-pdf"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setError(null);
    setSuccess(false);
    setFile(f);
    setCurrentPage(0);
    setTextBoxes([]);
    setShapes([]);
    setSelectedId(null);

    const bytes = await f.arrayBuffer();
    fileBytesRef.current = bytes;
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    setNumPages(pdf.numPages);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const images: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 1.5 });
      canvas.width = vp.width;
      canvas.height = vp.height;
      await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
      images.push(canvas.toDataURL());
    }
    setPageImages(images);
    setTextBoxes(images.map(() => []));
    setShapes(images.map(() => []));
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const rect = editorRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "select") {
      const pos = getPos(e);
      const all = [...textBoxes[currentPage], ...shapes[currentPage]];
      const found = all.find((item: any) => {
        if ("text" in item) {
          const tb = item as TextBox;
          return pos.x >= tb.x && pos.x <= tb.x + tb.w && pos.y >= tb.y && pos.y <= tb.y + tb.h;
        }
        const s = item as Shape;
        return Math.abs(pos.x - s.x1) < 10 && Math.abs(pos.y - s.y1) < 10;
      });
      setSelectedId(found ? (found as any).id : null);
      return;
    }
    setDrawing(true);
    setDrawStart(getPos(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !drawStart) return;
    const pos = getPos(e);
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(ctx);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(drawStart.x, drawStart.y, pos.x - drawStart.x, pos.y - drawStart.y);
    ctx.setLineDash([]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !drawStart) return;
    const pos = getPos(e);
    const id = crypto.randomUUID();
    const newShapes = [...shapes];
    if (tool === "text") {
      const newBoxes = [...textBoxes];
      newBoxes[currentPage] = [...newBoxes[currentPage], {
        id, x: drawStart.x, y: drawStart.y, w: Math.max(pos.x - drawStart.x, 60), h: Math.max(pos.y - drawStart.y, 20),
        text: "Type here", fontSize: currentFontSize, color: currentColor,
      }];
      setTextBoxes(newBoxes);
    } else {
      newShapes[currentPage] = [...newShapes[currentPage], {
        id, type: tool as "rect" | "circle" | "line",
        x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y,
        color: currentColor, fill: tool === "rect" ? currentFill : "transparent", width: 2,
      }];
      setShapes(newShapes);
    }
    setDrawing(false);
    setDrawStart(null);
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    const page = pageImages[currentPage];
    if (!page) return;
    textBoxes[currentPage]?.forEach((tb) => {
      if (selectedId === tb.id) { ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.strokeRect(tb.x, tb.y, tb.w, tb.h); ctx.setLineDash([]); }
      ctx.fillStyle = tb.color;
      ctx.font = `${tb.fontSize}px sans-serif`;
      ctx.fillText(tb.text, tb.x + 4, tb.y + tb.fontSize + 4);
    });
    shapes[currentPage]?.forEach((s) => {
      if (selectedId === s.id) { ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); } else { ctx.strokeStyle = s.color; ctx.lineWidth = s.width; }
      ctx.setLineDash([]);
      if (s.type === "rect") {
        if (s.fill !== "transparent") { ctx.fillStyle = s.fill; ctx.fillRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1); }
        ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      } else if (s.type === "circle") {
        const cx = (s.x1 + s.x2) / 2, cy = (s.y1 + s.y2) / 2, r = Math.max(Math.abs(s.x2 - s.x1), Math.abs(s.y2 - s.y1)) / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (s.fill !== "transparent") { ctx.fillStyle = s.fill; ctx.fill(); }
        ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      }
    });
  };

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !pageImages[currentPage]) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOverlay(ctx);
    };
    img.src = pageImages[currentPage];
  }, [currentPage, textBoxes, shapes, selectedId]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setTextBoxes((prev) => prev.map((page) => page.filter((tb) => tb.id !== selectedId)));
    setShapes((prev) => prev.map((page) => page.filter((s) => s.id !== selectedId)));
    setSelectedId(null);
  }, [selectedId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Delete" || e.key === "Backspace") deleteSelected(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected]);

  const savePdf = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.load(fileBytesRef.current!.slice(0), { ignoreEncryption: true });
      const pages = doc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        for (const s of shapes[i] || []) {
          page.drawRectangle({ x: s.x1, y: height - s.y1, width: s.x2 - s.x1, height: -(s.y2 - s.y1), borderColor: rgb(0.15, 0.39, 0.92), borderWidth: s.width, color: s.fill !== "transparent" ? rgb(0.15, 0.39, 0.92) : undefined, opacity: 0.1 });
        }
        for (const tb of textBoxes[i] || []) {
          page.drawText(tb.text, { x: tb.x, y: height - tb.y - tb.fontSize, size: tb.fontSize, color: rgb(0.15, 0.39, 0.92) });
        }
      }
      const pdfBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "edited.pdf"; a.click();
      URL.revokeObjectURL(url);
      trackExport("edited.pdf", "Edit PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to save edited PDF.");
    }
    setSaving(false);
  }, [shapes, textBoxes]);

  const runConvert = useCallback(async () => {
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(fileBytesRef.current!.slice(0), { ignoreEncryption: true });
      const pages = doc.getPages();
      for (let i = 0; i < pages.length; i++) {
        for (const tb of textBoxes[i] || []) {
          pages[i].drawText(tb.text, { x: tb.x, y: pages[i].getHeight() - tb.y - tb.fontSize, size: tb.fontSize });
        }
      }
      const pdfBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "edited.pdf"; a.click();
      URL.revokeObjectURL(url);
      trackExport("edited.pdf", "Edit PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to save.");
    }
    setProcessing(false);
  }, [textBoxes]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
    }, [usage, upsell, runConvert])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0] || null);
  }, [handleFile]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Edit PDF - Free Online PDF Editor" description="Edit PDF files online for free. Add text, shapes, and drawings to any PDF." url="https://allaboutpdfediting.xyz/edit-pdf" />
      <HowToJsonLd name="Edit PDF" description="Add text and shapes to PDF documents" steps={[{name:"Upload PDF",text:"Select a PDF to edit"},{name:"Add content",text:"Use the toolbar to add text boxes, rectangles, circles, or lines"},{name:"Download",text:"Save your edited PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Edit PDF", item: "https://allaboutpdfediting.xyz/edit-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Edit PDF" summary="Edit PDF files online — add text boxes, shapes, and drawings to any PDF" category="Editor" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Add text boxes","Draw shapes","Multi-page editing","Client-side processing","Free online tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Edit PDF</h1>
        <p className="text-[var(--muted)]">Add text, shapes, and drawings to any PDF.</p>
      </div>
      <ToolInfo name="Edit PDF" description="Edit PDFs directly in your browser with zero uploads. Add text boxes, rectangles, circles, and lines to any page." />
      <AdBanner className="mb-8" />
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>

      {!file ? (
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--card)]"}`}>
          <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">✏️</span>
            <span className="text-indigo-500 font-medium hover:underline">Click to select a PDF or drag & drop</span>
          </label>
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[var(--card-border)]">
            {(["select", "text", "rect", "circle", "line"] as Tool[]).map((t) => (
              <button key={t} onClick={() => { setTool(t); setSelectedId(null); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${tool === t ? "bg-indigo-600 text-white" : "bg-[var(--background)] text-[var(--muted)] border border-[var(--card-border)]"}`}>
                {t === "select" ? "↖ Select" : t === "text" ? "T Text" : t === "rect" ? "▭ Rect" : t === "circle" ? "○ Circle" : "╱ Line"}
              </button>
            ))}
            <div className="w-px h-6 bg-[var(--card-border)] mx-1" />
            <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title="Stroke color" />
            <input type="color" value={currentFill} onChange={(e) => setCurrentFill(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title="Fill color" />
            <select value={currentFontSize} onChange={(e) => setCurrentFontSize(Number(e.target.value))} className="text-xs bg-[var(--background)] border border-[var(--card-border)] rounded px-2 py-1">
              {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
            {selectedId && <button onClick={deleteSelected} className="ml-auto px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>}
          </div>

          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-[var(--muted)]">Page {currentPage + 1} of {numPages}</span>
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded disabled:opacity-40">Prev</button>
              <button onClick={() => setCurrentPage((p) => Math.min(numPages - 1, p + 1))} disabled={currentPage >= numPages - 1} className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded disabled:opacity-40">Next</button>
            </div>
          </div>

          <div ref={editorRef} className="relative overflow-auto border border-[var(--card-border)] rounded-lg bg-white">
            {pageImages[currentPage] && (
              <img src={pageImages[currentPage]} alt="" className="w-full" draggable={false} />
            )}
            <canvas
              ref={overlayRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="absolute inset-0 cursor-crosshair"
            />
          </div>

          <ProgressBar processing={processing} fileSize={file?.size || 0} label="Saving edited PDF..." />

          {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

          <button onClick={convert} disabled={processing || showTimer || saving}
            className="mt-4 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm">
            {processing ? "Saving..." : "Download Edited PDF"}
          </button>

          {!isPremium() && (
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              Free users limited to 10MB files.<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">Upgrade for 100MB & no wait</a>
            </p>
          )}

          {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}
          <SuccessAnimation show={success} message="PDF saved!" />
        </div>
      )}

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Edit PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Edit PDF files online with our free PDF editor. Add text boxes, rectangles, circles, and lines to any page. Perfect for filling forms, adding notes, marking up documents, or creating diagrams — all in your browser with zero server uploads.</p>
          <p>Your original PDF stays private. All editing happens client-side using pdf-lib. Simply upload, edit, and download your modified PDF.</p>
        </div>
      </div>
      <RelatedContent slug="edit-pdf" />

      <UseCaseLinks toolSlug="edit-pdf" />

      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
