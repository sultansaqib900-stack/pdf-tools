"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnnotationStore, generateAnnotationId, type Annotation, type ToolType, ANNOTATION_COLORS } from "@/lib/pdfViewer/annotations";

interface PdfViewerProps {
  file: File;
  onClose: () => void;
}

export default function PdfViewer({ file, onClose }: PdfViewerProps) {
  const [doc, setDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<ToolType>("cursor");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stickNoteText, setStickNoteText] = useState("");
  const [stickNotePos, setStickNotePos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const annotStore = useRef(new AnnotationStore());
  const annotState = useRef(0);
  const [, forceUpdate] = useState(0);
  const drawingPath = useRef<{ x: number; y: number }[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      if (!GlobalWorkerOptions.workerSrc && !GlobalWorkerOptions.workerPort) {
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const buf = await file.arrayBuffer();
      const pdf = await getDocument(buf).promise;
      if (cancelled) return;
      setDoc(pdf);
      setNumPages(pdf.numPages);
      const thumbs: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.2 });
        const c = document.createElement("canvas");
        c.width = vp.width;
        c.height = vp.height;
        await page.render({ canvas: c, canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        thumbs.push(c.toDataURL());
      }
      if (!cancelled) setThumbnails(thumbs);
    })();
    return () => { cancelled = true; };
  }, [file]);

  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageIndex + 1);
      const vp = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current!;
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
      if (!cancelled) renderOverlay();
    })();
    return () => { cancelled = true; };
  }, [doc, pageIndex, zoom]);

  const renderOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const pageCanvas = canvasRef.current;
    if (!pageCanvas) return;
    canvas.width = pageCanvas.width;
    canvas.height = pageCanvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotStore.current.getByPage(pageIndex).forEach((ann) => {
      if (ann.type === "highlight") {
        ctx.fillStyle = ann.color;
        ann.rects.forEach((r) => {
          ctx.fillRect(r.x * zoom * 1, r.y * zoom * 1, r.width * zoom * 1, r.height * zoom * 1);
        });
      } else if (ann.type === "sticky") {
        ctx.fillStyle = ann.color;
        ctx.beginPath();
        ctx.arc(ann.x * zoom, ann.y * zoom, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif";
        ctx.fillText("📌", ann.x * zoom - 8, ann.y * zoom + 4);
      } else if (ann.type === "drawing") {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ann.paths.forEach((path) => {
          if (path.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(path[0].x * zoom, path[0].y * zoom);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x * zoom, path[i].y * zoom);
          }
          ctx.stroke();
        });
      }
    });
    if (isDrawing.current && drawingPath.current.length > 1) {
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(drawingPath.current[0].x * zoom, drawingPath.current[0].y * zoom);
      for (let i = 1; i < drawingPath.current.length; i++) {
        ctx.lineTo(drawingPath.current[i].x * zoom, drawingPath.current[i].y * zoom);
      }
      ctx.stroke();
    }
  }, [pageIndex, zoom]);

  useEffect(() => { renderOverlay(); }, [renderOverlay, annotState.current]);

  const getPagePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "draw") {
      isDrawing.current = true;
      drawingPath.current = [getPagePos(e)];
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "draw" && isDrawing.current) {
      drawingPath.current.push(getPagePos(e));
      renderOverlay();
    }
  };

  const handleMouseUp = () => {
    if (tool === "draw" && isDrawing.current) {
      isDrawing.current = false;
      if (drawingPath.current.length > 1) {
        annotStore.current.add({
          type: "drawing", id: generateAnnotationId(), pageIndex,
          paths: [drawingPath.current], color: "#ff4444", width: 3,
        });
        annotState.current++;
        forceUpdate((n) => n + 1);
      }
      drawingPath.current = [];
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "sticky") {
      const pos = getPagePos(e);
      setStickNotePos(pos);
      setStickNoteText("");
    }
  };

  const saveStickyNote = () => {
    if (!stickNotePos || !stickNoteText.trim()) {
      setStickNotePos(null);
      return;
    }
    annotStore.current.add({
      type: "sticky", id: generateAnnotationId(), pageIndex,
      x: stickNotePos.x, y: stickNotePos.y,
      text: stickNoteText, color: ANNOTATION_COLORS.yellow,
    });
    annotState.current++;
    forceUpdate((n) => n + 1);
    setStickNotePos(null);
    setStickNoteText("");
  };

  const handleUndo = () => {
    annotStore.current.undo();
    annotState.current++;
    forceUpdate((n) => n + 1);
  };

  const handleRedo = () => {
    annotStore.current.redo();
    annotState.current++;
    forceUpdate((n) => n + 1);
  };

  const pageAnnotations = annotStore.current.getByPage(pageIndex);

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10 transition" title="Toggle thumbnails">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))} className="p-1.5 rounded-lg hover:bg-white/10 transition text-sm">−</button>
          <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1.5 rounded-lg hover:bg-white/10 transition text-sm">+</button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button onClick={() => setPageIndex(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0} className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30">◀</button>
          <span className="text-sm w-16 text-center">{pageIndex + 1} / {numPages}</span>
          <button onClick={() => setPageIndex(Math.min(numPages - 1, pageIndex + 1))} disabled={pageIndex >= numPages - 1} className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30">▶</button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button onClick={handleUndo} disabled={!annotStore.current.canUndo()} className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" title="Undo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button onClick={handleRedo} disabled={!annotStore.current.canRedo()} className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" title="Redo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-1">
          {(["cursor", "highlight", "sticky", "draw"] as ToolType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${tool === t ? "bg-indigo-600 text-white" : "text-white/70 hover:bg-white/10"}`}
            >
              {t === "cursor" ? "↖" : t === "highlight" ? "🖍" : t === "sticky" ? "📌" : "✏"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && thumbnails.length > 0 && (
          <div className="w-24 md:w-32 overflow-y-auto bg-gray-800/50 p-2 space-y-2 shrink-0">
            {thumbnails.map((t, i) => (
              <button
                key={i}
                onClick={() => setPageIndex(i)}
                className={`w-full rounded-lg overflow-hidden border-2 transition ${i === pageIndex ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={t} alt={`Page ${i + 1}`} className="w-full" />
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto flex items-start justify-center p-4">
          <div className="relative inline-block">
            <canvas ref={canvasRef} className="shadow-2xl" />
            <canvas
              ref={overlayRef}
              className="absolute inset-0"
              style={{ cursor: tool === "highlight" ? "crosshair" : tool === "draw" ? "crosshair" : tool === "sticky" ? "pointer" : "default" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>

      {stickNotePos && (
        <div className="absolute z-30 bg-gray-800 rounded-xl p-3 shadow-2xl border border-white/10" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          <textarea
            autoFocus
            value={stickNoteText}
            onChange={(e) => setStickNoteText(e.target.value)}
            placeholder="Type your note..."
            className="w-64 h-24 bg-gray-700 text-white rounded-lg p-2 text-sm outline-none border border-white/10 focus:border-indigo-500 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setStickNotePos(null)} className="px-3 py-1 text-xs text-white/70 hover:text-white">Cancel</button>
            <button onClick={saveStickyNote} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </div>
      )}

      {pageAnnotations.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-xl p-3 max-h-40 overflow-y-auto max-w-xs">
          <p className="text-xs text-white/50 mb-1">Annotations on this page</p>
          {pageAnnotations.map((ann) => (
            <div key={ann.id} className="text-xs text-white/80 flex items-center gap-1 py-0.5">
              <span>{ann.type === "highlight" ? "🖍" : ann.type === "sticky" ? "📌" : "✏"}</span>
              <span className="truncate">{ann.type === "sticky" ? (ann as any).text : ann.type}</span>
              <button onClick={() => { annotStore.current.remove(ann.id); annotState.current++; forceUpdate((n) => n + 1); }} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
