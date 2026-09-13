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
import { downloadBytes, isPdfFile } from "@/lib/pdfBytes";

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

export default function EditPdfTool({ locale = "en" }: { locale?: "en" | "es" }) {
  const isSpanish = locale === "es";
  const usage = useUsage("edit-pdf");
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
    if (!f) return;
    if (!isPdfFile(f)) {
      setError(isSpanish ? "Selecciona un archivo PDF válido." : "Please select a valid PDF file.");
      return;
    }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setError(null);
    setSuccess(false);
    setFile(f);
    setCurrentPage(0);
    setTextBoxes([]);
    setShapes([]);
    setSelectedId(null);

    let loadingTask: import("pdfjs-dist").PDFDocumentLoadingTask | null = null;
    try {
      const bytes = await f.arrayBuffer();
      fileBytesRef.current = bytes;
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
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
    } catch (loadError) {
      fileBytesRef.current = null;
      setFile(null);
      setError(loadError instanceof Error
        ? `${isSpanish ? "No se pudo abrir el PDF" : "Could not open the PDF"}: ${loadError.message}`
        : (isSpanish ? "No se pudo abrir el PDF." : "Could not open the PDF."));
    } finally {
      if (loadingTask) await loadingTask.destroy().catch(() => undefined);
    }
  }, [isSpanish, upsell]);

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
        text: isSpanish ? "Escribe aquí" : "Type here",
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
      setError(isSpanish ? "Añade al menos un cuadro de texto o una forma antes de descargar." : "Add at least one text box or shape before downloading.");
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

      const doc = await PDFDocument.load(sourceBytes.slice(0));
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
      const outputName = file?.name
        ? `${isSpanish ? "editado" : "edited"}-${file.name}`
        : (isSpanish ? "editado.pdf" : "edited.pdf");
      downloadBytes(pdfBytes, outputName);
      trackExport(outputName, isSpanish ? "Editar PDF" : "Edit PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch (saveError) {
      setError(saveError instanceof Error
        ? `${isSpanish ? "No se pudo guardar el PDF editado" : "Failed to save edited PDF"}: ${saveError.message}`
        : (isSpanish ? "No se pudo guardar el PDF editado." : "Failed to save edited PDF."));
    } finally {
      if (coordinateTask) await coordinateTask.destroy();
      setProcessing(false);
    }
  }, [file, shapes, textBoxes, usage, upsell, trackExport, isSpanish]);

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
  const copy = isSpanish ? {
    name: "Editar PDF",
    appName: "Editar PDF - Editor PDF Gratuito Online",
    appDescription: "Añade cuadros de texto y formas vectoriales a cualquier página PDF en tu navegador.",
    url: "https://allaboutpdfediting.xyz/es/edit-pdf",
    home: "Inicio",
    homeUrl: "https://allaboutpdfediting.xyz/es",
    summary: "Añade cuadros de texto, rectángulos, elipses y líneas a archivos PDF",
    processing: "lado del cliente",
    limits: "Archivos de hasta 10MB",
    subtitle: "Añade texto y formas a cualquier página PDF.",
    toolDescription: "Superpone cuadros de texto, rectángulos, elipses y líneas en tu navegador. Las coordenadas de la vista previa se convierten mediante PDF.js, incluso en páginas rotadas, antes de guardar los elementos en el PDF.",
    upload: "Haz clic para seleccionar un PDF o arrástralo aquí",
    select: "↖ Seleccionar",
    text: "T Texto",
    rectangle: "▭ Rect",
    ellipse: "○ Elipse",
    line: "╱ Línea",
    strokeColor: "Color del trazo",
    fillColor: "Color de relleno",
    delete: "Eliminar",
    selectedText: "Texto seleccionado",
    size: "Tamaño",
    color: "Color",
    page: "Página",
    of: "de",
    previous: "Anterior",
    next: "Siguiente",
    progress: "Guardando PDF editado...",
    saving: "Guardando...",
    download: "Descargar PDF Editado",
    freeLimit: "Los usuarios gratuitos tienen un límite de 10MB.",
    upgrade: "Actualiza para 100MB y sin espera",
    saved: "¡PDF guardado!",
    about: "Acerca de Editar PDF",
    aboutOne: "Añade superposiciones de texto, rectángulos, elipses y líneas a cualquier página PDF. Después de dibujar un cuadro de texto, selecciónalo para cambiar su contenido, tamaño y color. Este editor no modifica ni redistribuye el texto existente y no añade notas adhesivas ni trazos a mano alzada.",
    aboutTwo: "Tu PDF original permanece privado. Toda la edición se realiza localmente en tu navegador; solo tienes que subir, editar y descargar el archivo modificado.",
  } : {
    name: "Edit PDF",
    appName: "Edit PDF - Free Online PDF Editor",
    appDescription: "Add text boxes and vector shapes to any PDF page in your browser.",
    url: "https://allaboutpdfediting.xyz/edit-pdf",
    home: "Home",
    homeUrl: "https://allaboutpdfediting.xyz",
    summary: "Add text boxes, rectangles, ellipses, and lines to PDF files",
    processing: "client-side",
    limits: "Files up to 10MB",
    subtitle: "Add text and shapes to any PDF page.",
    toolDescription: "Overlay text boxes, rectangles, ellipses, and lines directly in your browser. Preview coordinates are converted through each page's PDF.js viewport, including rotated pages, before the overlays are saved into the PDF.",
    upload: "Click to select a PDF or drag & drop",
    select: "↖ Select",
    text: "T Text",
    rectangle: "▭ Rect",
    ellipse: "○ Ellipse",
    line: "╱ Line",
    strokeColor: "Stroke color",
    fillColor: "Fill color",
    delete: "Delete",
    selectedText: "Selected text",
    size: "Size",
    color: "Color",
    page: "Page",
    of: "of",
    previous: "Prev",
    next: "Next",
    progress: "Saving edited PDF...",
    saving: "Saving...",
    download: "Download Edited PDF",
    freeLimit: "Free users limited to 10MB files.",
    upgrade: "Upgrade for 100MB & no wait",
    saved: "PDF saved!",
    about: "About Edit PDF",
    aboutOne: "Add editable text overlays, rectangles, ellipses, and lines to any PDF page. Select a text box after drawing it to change its content, size, and color. This overlay editor does not modify or reflow existing PDF text and does not add sticky notes or freehand ink.",
    aboutTwo: "Your original PDF stays private. All editing happens locally in your browser; simply upload, edit, and download your modified PDF.",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name={copy.appName} description={copy.appDescription} url={copy.url} />
      <HowToJsonLd
        name={copy.name}
        description={copy.summary}
        steps={isSpanish
          ? [
              { name: "Subir PDF", text: "Selecciona un PDF para editar" },
              { name: "Añadir contenido", text: "Usa la barra para añadir texto, rectángulos, elipses o líneas" },
              { name: "Editar y descargar", text: "Selecciona el texto para cambiar su contenido, tamaño o color y guarda el PDF" },
            ]
          : [
              { name: "Upload PDF", text: "Select a PDF to edit" },
              { name: "Add content", text: "Use the toolbar to add text boxes, rectangles, ellipses, or lines" },
              { name: "Edit and download", text: "Select text to change its content, size, or color, then save the edited PDF" },
            ]}
      />
      <BreadcrumbJsonLd items={[{ name: copy.home, item: copy.homeUrl }, { name: copy.name, item: copy.url }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd
        name={copy.name}
        summary={copy.summary}
        category="Editor"
        inputType="PDF"
        outputType="PDF"
        processing={copy.processing}
        price="free"
        features={isSpanish
          ? ["Añadir cuadros de texto", "Dibujar formas", "Edición multipágina", "Procesamiento local"]
          : ["Add text boxes", "Draw shapes", "Multi-page editing", "Client-side processing"]}
        limits={copy.limits}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{copy.name}</h1>
        <p className="text-[var(--muted)]">{copy.subtitle}</p>
      </div>
      <ToolInfo name={copy.name} description={copy.toolDescription} />
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>

      {!file ? (
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--card)]"}`}>
          <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">✏️</span>
            <span className="text-indigo-500 font-medium hover:underline">{copy.upload}</span>
          </label>
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[var(--card-border)]">
            {(["select", "text", "rect", "circle", "line"] as Tool[]).map((t) => (
              <button key={t} onClick={() => { setTool(t); setSelectedId(null); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${tool === t ? "bg-indigo-600 text-white" : "bg-[var(--background)] text-[var(--muted)] border border-[var(--card-border)]"}`}>
                {t === "select" ? copy.select : t === "text" ? copy.text : t === "rect" ? copy.rectangle : t === "circle" ? copy.ellipse : copy.line}
              </button>
            ))}
            <div className="w-px h-6 bg-[var(--card-border)] mx-1" />
            <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title={copy.strokeColor} />
            <input type="color" value={currentFill} onChange={(e) => setCurrentFill(e.target.value)} className="w-8 h-8 rounded cursor-pointer" title={copy.fillColor} />
            <select value={currentFontSize} onChange={(e) => setCurrentFontSize(Number(e.target.value))} className="text-xs bg-[var(--background)] border border-[var(--card-border)] rounded px-2 py-1">
              {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
            {selectedId && <button onClick={deleteSelected} className="ml-auto px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">{copy.delete}</button>}
          </div>

          {selectedTextBox && (
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mb-4 p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
              <label className="text-xs font-medium text-[var(--muted)]">
                {copy.selectedText}
                <input
                  type="text"
                  value={selectedTextBox.text}
                  onChange={(event) => updateSelectedTextBox({ text: event.target.value })}
                  className="block mt-1 w-full px-3 py-2 rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </label>
              <label className="text-xs font-medium text-[var(--muted)]">
                {copy.size}
                <select value={selectedTextBox.fontSize} onChange={(event) => updateSelectedTextBox({ fontSize: Number(event.target.value) })} className="block mt-1 px-3 py-2 rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]">
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => <option key={size} value={size}>{size}px</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--muted)]">
                {copy.color}
                <input type="color" value={selectedTextBox.color} onChange={(event) => updateSelectedTextBox({ color: event.target.value })} className="block mt-1 w-10 h-9 rounded cursor-pointer" />
              </label>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-[var(--muted)]">{copy.page} {currentPage + 1} {copy.of} {numPages}</span>
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded disabled:opacity-40">{copy.previous}</button>
              <button onClick={() => setCurrentPage((p) => Math.min(numPages - 1, p + 1))} disabled={currentPage >= numPages - 1} className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded disabled:opacity-40">{copy.next}</button>
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

          <ProgressBar processing={processing} fileSize={file?.size || 0} label={copy.progress} />

          {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

          <button onClick={convert} disabled={!hasEdits || processing || showTimer}
            className="mt-4 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm">
            {processing ? copy.saving : copy.download}
          </button>

          {!isPremium() && (
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              {copy.freeLimit}<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">{copy.upgrade}</a>
            </p>
          )}

          {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}
          <SuccessAnimation show={success} message={copy.saved} />
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">{copy.about}</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>{copy.aboutOne}</p>
          <p>{copy.aboutTwo}</p>
        </div>
      </div>
      <RelatedContent slug="edit-pdf" />

      <UseCaseLinks toolSlug="edit-pdf" />

      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
