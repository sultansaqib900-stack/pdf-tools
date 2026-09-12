"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { downloadBytes } from "@/lib/pdfBytes";

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
  const [currentFill, setCurrentFill] = useState("#bfdbfe");
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
    const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
    try {
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas rendering is unavailable.");
      const images: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.5 });
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        images.push(canvas.toDataURL());
        page.cleanup();
      }
      setPageImages(images);
      setTextBoxes(images.map(() => []));
      setShapes(images.map(() => []));
    } finally {
      await loadingTask.destroy();
    }
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / Math.max(rect.width, 1)),
      y: (e.clientY - rect.top) * (canvas.height / Math.max(rect.height, 1)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "select") {
      const pos = getPos(e);
      const all = [...(textBoxes[currentPage] || []), ...(shapes[currentPage] || [])].reverse();
      const found = all.find((item) => {
        if ("text" in item) {
          const tb = item as TextBox;
          return pos.x >= tb.x && pos.x <= tb.x + tb.w && pos.y >= tb.y && pos.y <= tb.y + tb.h;
        }
        const s = item as Shape;
        const left = Math.min(s.x1, s.x2) - 8;
        const right = Math.max(s.x1, s.x2) + 8;
        const top = Math.min(s.y1, s.y2) - 8;
        const bottom = Math.max(s.y1, s.y2) + 8;
        return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
      });
      setSelectedId(found?.id ?? null);
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
    if (tool !== "text" && Math.hypot(pos.x - drawStart.x, pos.y - drawStart.y) < 3) {
      setDrawing(false);
      setDrawStart(null);
      return;
    }
    const id = crypto.randomUUID();
    const newShapes = [...shapes];
    if (tool === "text") {
      const newBoxes = [...textBoxes];
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      newBoxes[currentPage] = [...newBoxes[currentPage], {
        id,
        x,
        y,
        w: Math.max(Math.abs(pos.x - drawStart.x), 80),
        h: Math.max(Math.abs(pos.y - drawStart.y), currentFontSize + 10),
        text: "Type here",
        fontSize: currentFontSize,
        color: currentColor,
      }];
      setTextBoxes(newBoxes);
    } else {
      newShapes[currentPage] = [...newShapes[currentPage], {
        id, type: tool as "rect" | "circle" | "line",
        x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y,
        color: currentColor, fill: tool === "line" ? "transparent" : currentFill, width: 2,
      }];
      setShapes(newShapes);
    }
    setSelectedId(id);
    setTool("select");
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
      ctx.strokeStyle = selectedId === s.id ? "#2563eb" : s.color;
      ctx.lineWidth = selectedId === s.id ? Math.max(2, s.width) : s.width;
      ctx.setLineDash(selectedId === s.id ? [4, 4] : []);
      if (s.type === "rect") {
        if (s.fill !== "transparent") {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = s.fill;
          ctx.fillRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
          ctx.restore();
        }
        ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      } else if (s.type === "circle") {
        const cx = (s.x1 + s.x2) / 2;
        const cy = (s.y1 + s.y2) / 2;
        const rx = Math.abs(s.x2 - s.x1) / 2;
        const ry = Math.abs(s.y2 - s.y1) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (s.fill !== "transparent") {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = s.fill;
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
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

  const updateSelectedTextBox = useCallback((changes: Partial<TextBox>) => {
    if (!selectedId) return;
    setTextBoxes((prev) => prev.map((page) => page.map((box) => (
      box.id === selectedId ? { ...box, ...changes } : box
    ))));
  }, [selectedId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") || target?.isContentEditable) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected]);

  const runConvert = useCallback(async () => {
    if (!fileBytesRef.current) return;
    const hasEdits = textBoxes.some((page) => page.length > 0) || shapes.some((page) => page.length > 0);
    if (!hasEdits) {
      setError("Add at least one text box or shape before downloading.");
      return;
    }

    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }

    const sourceBytes = fileBytesRef.current.slice(0);
    let coordinateTask: import("pdfjs-dist").PDFDocumentLoadingTask | null = null;
    try {
      const [{ PDFDocument, StandardFonts, rgb }, pdfjs] = await Promise.all([
        import("pdf-lib"),
        import("pdfjs-dist"),
      ]);
      if (!pdfjs.GlobalWorkerOptions.workerSrc) pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const doc = await PDFDocument.load(sourceBytes.slice(0), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      coordinateTask = pdfjs.getDocument({ data: sourceBytes.slice(0) });
      const coordinatePdf = await coordinateTask.promise;
      const pages = doc.getPages();

      const colorFromHex = (value: string) => {
        const match = /^#([0-9a-f]{6})$/i.exec(value);
        if (!match) return rgb(0.15, 0.39, 0.92);
        const numeric = Number.parseInt(match[1], 16);
        return rgb(((numeric >> 16) & 255) / 255, ((numeric >> 8) & 255) / 255, (numeric & 255) / 255);
      };

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const page = pages[pageIndex];
        const coordinatePage = await coordinatePdf.getPage(pageIndex + 1);
        const viewport = coordinatePage.getViewport({ scale: 1.5 });
        const mapPoint = (x: number, y: number) => viewport.convertToPdfPoint(x, y) as [number, number];
        const pdfDistance = (x1: number, y1: number, x2: number, y2: number) => {
          const first = mapPoint(x1, y1);
          const second = mapPoint(x2, y2);
          return Math.hypot(second[0] - first[0], second[1] - first[1]);
        };

        for (const shape of shapes[pageIndex] || []) {
          const first = mapPoint(shape.x1, shape.y1);
          const second = mapPoint(shape.x2, shape.y2);
          const left = Math.min(first[0], second[0]);
          const bottom = Math.min(first[1], second[1]);
          const width = Math.abs(second[0] - first[0]);
          const height = Math.abs(second[1] - first[1]);
          const borderColor = colorFromHex(shape.color);
          const fillColor = shape.fill === "transparent" ? undefined : colorFromHex(shape.fill);
          const borderWidth = Math.max(0.25, pdfDistance(0, 0, shape.width, 0));

          if (shape.type === "rect") {
            page.drawRectangle({
              x: left,
              y: bottom,
              width,
              height,
              borderColor,
              borderWidth,
              color: fillColor,
              opacity: fillColor ? 0.2 : undefined,
              borderOpacity: 1,
            });
          } else if (shape.type === "circle") {
            page.drawEllipse({
              x: left + width / 2,
              y: bottom + height / 2,
              xScale: width / 2,
              yScale: height / 2,
              borderColor,
              borderWidth,
              color: fillColor,
              opacity: fillColor ? 0.2 : undefined,
              borderOpacity: 1,
            });
          } else {
            page.drawLine({
              start: { x: first[0], y: first[1] },
              end: { x: second[0], y: second[1] },
              thickness: borderWidth,
              color: borderColor,
            });
          }
        }

        for (const textBox of textBoxes[pageIndex] || []) {
          if (!textBox.text) continue;
          const baseline = mapPoint(textBox.x + 4, textBox.y + textBox.fontSize + 4);
          const fontSize = Math.max(1, pdfDistance(0, 0, 0, textBox.fontSize));
          page.drawText(textBox.text, {
            x: baseline[0],
            y: baseline[1],
            size: fontSize,
            font,
            color: colorFromHex(textBox.color),
          });
        }
        coordinatePage.cleanup();
      }

      const pdfBytes = await doc.save({ useObjectStreams: true });
      const outputName = file?.name ? `edited-${file.name}` : "edited.pdf";
      downloadBytes(pdfBytes, outputName);
      trackExport(outputName, "Edit PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? `Failed to save edited PDF: ${saveError.message}` : "Failed to save edited PDF.");
    } finally {
      if (coordinateTask) await coordinateTask.destroy();
      setProcessing(false);
    }
  }, [file, shapes, textBoxes, usage, upsell, trackExport]);

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

  const selectedTextBox = selectedId
    ? textBoxes.flat().find((box) => box.id === selectedId) ?? null
    : null;
  const hasEdits = textBoxes.some((page) => page.length > 0) || shapes.some((page) => page.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Edit PDF - Free Online PDF Editor" description="Edit PDF files online for free. Add text, shapes, and drawings to any PDF." url="https://allaboutpdfediting.xyz/edit-pdf" />
      <HowToJsonLd name="Edit PDF" description="Overlay editable text and vector shapes on PDF pages" steps={[{name:"Upload PDF",text:"Select a PDF to edit"},{name:"Add content",text:"Use the toolbar to add text boxes, rectangles, ellipses, or lines"},{name:"Edit and download",text:"Select text to change its content, size, or color, then save the edited PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Edit PDF", item: "https://allaboutpdfediting.xyz/edit-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Edit PDF" summary="Edit PDF files online — add text boxes, shapes, and drawings to any PDF" category="Editor" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Add text boxes","Draw shapes","Multi-page editing","Client-side processing","Free online tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Edit PDF</h1>
        <p className="text-[var(--muted)]">Add text, shapes, and drawings to any PDF.</p>
      </div>
      <ToolInfo name="Edit PDF" description="Overlay text boxes, rectangles, ellipses, and lines directly in your browser. Preview coordinates are converted through each page's PDF.js viewport, including rotated pages, before the overlays are saved into the PDF." />
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
                {t === "select" ? "↖ Select" : t === "text" ? "T Text" : t === "rect" ? "▭ Rect" : t === "circle" ? "○ Ellipse" : "╱ Line"}
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

          {selectedTextBox && (
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mb-4 p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
              <label className="text-xs font-medium text-[var(--muted)]">
                Selected text
                <input
                  type="text"
                  value={selectedTextBox.text}
                  onChange={(event) => updateSelectedTextBox({ text: event.target.value })}
                  className="block mt-1 w-full px-3 py-2 rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </label>
              <label className="text-xs font-medium text-[var(--muted)]">
                Size
                <select value={selectedTextBox.fontSize} onChange={(event) => updateSelectedTextBox({ fontSize: Number(event.target.value) })} className="block mt-1 px-3 py-2 rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]">
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => <option key={size} value={size}>{size}px</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--muted)]">
                Color
                <input type="color" value={selectedTextBox.color} onChange={(event) => updateSelectedTextBox({ color: event.target.value })} className="block mt-1 w-10 h-9 rounded cursor-pointer" />
              </label>
            </div>
          )}

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
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
          </div>

          <ProgressBar processing={processing} fileSize={file?.size || 0} label="Saving edited PDF..." />

          {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

          <button onClick={convert} disabled={!hasEdits || processing || showTimer}
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

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Edit PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add editable text overlays, rectangles, ellipses, and lines to any PDF page. Select a text box after drawing it to change its content, size, and color. This overlay editor does not modify or reflow existing PDF text and does not add sticky notes or freehand ink.</p>
          <p>Your original PDF stays private. All editing happens client-side using pdf-lib. Simply upload, edit, and download your modified PDF.</p>
        </div>
      </div>
      <RelatedContent slug="edit-pdf" />

      <UseCaseLinks toolSlug="edit-pdf" />

      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
