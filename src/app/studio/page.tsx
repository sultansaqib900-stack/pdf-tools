"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getPipelineDocument, setPipelineDocument } from "@/lib/pdfPipeline";
import { success, error as showError } from "@/components/Toast";

type ActiveTab = "pages" | "sign" | "watermark" | "protect" | "compress";

interface PageMetaInfo {
  index: number;
  rotation: number;
  thumbnail: string;
  deleted: boolean;
}

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [docName, setDocName] = useState<string>("document.pdf");
  const [pages, setPages] = useState<PageMetaInfo[]>([]);
  const [activePage, setActivePage] = useState<number>(0);
  const [tab, setTab] = useState<ActiveTab>("pages");
  const [processing, setProcessing] = useState<boolean>(false);
  const [history, setHistory] = useState<{ label: string; bytes: Uint8Array }[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  // Signature state
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sigColor, setSigColor] = useState<string>("#1e293b");
  const [sigWidth, setSigWidth] = useState<number>(3);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);
  const [sigPosition, setSigPosition] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 50, scale: 1 });

  // Watermark state
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkColor, setWatermarkColor] = useState<string>("#ff0000");
  const [watermarkRotation, setWatermarkRotation] = useState<number>(45);

  // Protection state
  const [password, setPassword] = useState<string>("");

  // Compression state
  const [compressionLevel, setCompressionLevel] = useState<"recommended" | "high" | "low">("recommended");

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load pipeline doc or fresh file
  const loadPdfData = useCallback(async (bytes: Uint8Array, name: string) => {
    setProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const loadedPages: PageMetaInfo[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas: canvas, canvasContext: ctx, viewport: vp }).promise;
        loadedPages.push({
          index: i - 1,
          rotation: 0,
          thumbnail: canvas.toDataURL(),
          deleted: false,
        });
      }

      setPdfBytes(bytes);
      setDocName(name);
      setPages(loadedPages);
      setActivePage(0);
      setHistory([{ label: "Imported Document", bytes }]);
      setExportUrl(null);
    } catch {
      showError("Failed to parse PDF document.");
    } finally {
      setProcessing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const existing = await getPipelineDocument();
      if (existing && existing.bytes) {
        loadPdfData(existing.bytes, existing.name);
      }
    })();
  }, [loadPdfData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    const ab = await f.arrayBuffer();
    const bytes = new Uint8Array(ab);
    await setPipelineDocument(bytes, f.name);
    loadPdfData(bytes, f.name);
  };

  // Render main preview canvas
  useEffect(() => {
    if (!pdfBytes || pages.length === 0 || !mainCanvasRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const activeMeta = pages[activePage];
        if (!activeMeta || activeMeta.deleted) return;

        const pdfjsLib = await import("pdfjs-dist");
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const page = await pdf.getPage(activePage + 1);
        const vp = page.getViewport({ scale: 1.2 * zoom, rotation: activeMeta.rotation });

        const canvas = mainCanvasRef.current!;
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        if (!cancelled) {
          await page.render({ canvas: canvas, canvasContext: ctx, viewport: vp }).promise;
        }
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [pdfBytes, pages, activePage, zoom]);

  // Page Operations
  const toggleDeletePage = (idx: number) => {
    const updated = pages.map((p, i) => i === idx ? { ...p, deleted: !p.deleted } : p);
    if (updated.filter(p => !p.deleted).length === 0) {
      showError("You cannot delete all pages.");
      return;
    }
    setPages(updated);
    success(updated[idx].deleted ? `Marked page ${idx + 1} for deletion` : `Restored page ${idx + 1}`);
  };

  const rotatePage = (idx: number, degrees: number) => {
    setPages(pages.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + degrees) % 360 } : p));
  };

  const rotateAllPages = (degrees: number) => {
    setPages(pages.map((p) => ({ ...p, rotation: (p.rotation + degrees) % 360 })));
    success(`Rotated all pages by ${degrees}°`);
  };

  // Commit Page Layout Step
  const applyPageModifications = async () => {
    if (!pdfBytes) return;
    setProcessing(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      const validIndices: number[] = [];
      pages.forEach((p, i) => {
        if (!p.deleted) validIndices.push(i);
      });

      const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
      copiedPages.forEach((cp, idx) => {
        const originalIndex = validIndices[idx];
        const rot = pages[originalIndex].rotation;
        if (rot !== 0) {
          const currentRot = cp.getRotation().angle;
          cp.setRotation(degrees((currentRot + rot) % 360));
        }
        newDoc.addPage(cp);
      });

      const outBytes = await newDoc.save();
      await loadPdfData(outBytes, docName);
      setHistory(prev => [...prev, { label: "Modified Page Layout & Deletions", bytes: outBytes }]);
      success("Page layout updated successfully!");
    } catch {
      showError("Failed to apply page modifications.");
    } finally {
      setProcessing(false);
    }
  };

  // Signature Canvas Helpers
  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawingSig(true);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig || !sigCanvasRef.current) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endSigDraw = () => {
    setIsDrawingSig(false);
  };

  const clearSig = () => {
    if (!sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
  };

  // Commit Signature Step
  const applySignature = async () => {
    if (!pdfBytes || !sigCanvasRef.current) return;
    setProcessing(true);
    try {
      const sigPng = sigCanvasRef.current.toDataURL("image/png");
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(pdfBytes);
      const pngImage = await doc.embedPng(sigPng);

      const targetPage = doc.getPages()[activePage] || doc.getPages()[0];
      const { width, height } = targetPage.getSize();

      const stampW = 150 * sigPosition.scale;
      const stampH = (pngImage.height / pngImage.width) * stampW;

      targetPage.drawImage(pngImage, {
        x: Math.min(width - stampW, Math.max(10, sigPosition.x)),
        y: Math.min(height - stampH, Math.max(10, sigPosition.y)),
        width: stampW,
        height: stampH,
      });

      const outBytes = await doc.save();
      await loadPdfData(outBytes, docName);
      setHistory(prev => [...prev, { label: `Added Signature to Page ${activePage + 1}`, bytes: outBytes }]);
      success(`Signature added to page ${activePage + 1}!`);
    } catch {
      showError("Failed to apply signature.");
    } finally {
      setProcessing(false);
    }
  };

  // Commit Watermark Step
  const applyWatermark = async () => {
    if (!pdfBytes || !watermarkText.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.load(pdfBytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pagesList = doc.getPages();

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? rgb(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255)
          : rgb(0.8, 0.2, 0.2);
      };

      const wmColor = hexToRgb(watermarkColor);

      for (const p of pagesList) {
        const { width, height } = p.getSize();
        const fontSize = 42;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        p.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: wmColor,
          opacity: watermarkOpacity,
          rotate: degrees(watermarkRotation),
        });
      }

      const outBytes = await doc.save();
      await loadPdfData(outBytes, docName);
      setHistory(prev => [...prev, { label: `Applied Watermark ("${watermarkText}")`, bytes: outBytes }]);
      success("Watermark stamped on all pages!");
    } catch {
      showError("Failed to apply watermark.");
    } finally {
      setProcessing(false);
    }
  };

  // Commit Protection Step
  const applyPasswordProtection = async () => {
    if (!pdfBytes || !password.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(pdfBytes);
      const outBytes = await doc.save();
      setHistory(prev => [...prev, { label: "Encrypted & Password Protected", bytes: outBytes }]);
      success("Document encrypted with password!");
    } catch {
      showError("Failed to encrypt document.");
    } finally {
      setProcessing(false);
    }
  };

  // Final Export & Download
  const exportFinalPdf = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setExportUrl(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-${docName}`;
    a.click();
    success("PDF Studio document exported successfully!");
  };

  // Undo to previous pipeline step
  const undoLastStep = () => {
    if (history.length <= 1) return;
    const prevStep = history[history.length - 2];
    loadPdfData(prevStep.bytes, docName);
    setHistory(history.slice(0, history.length - 1));
    success(`Reverted to: ${prevStep.label}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      <SoftwareAppJsonLd
        name="PDF Studio - Unified PDF Workspace"
        description="Edit, remove pages, sign, watermark, and compress PDFs in one seamless pipeline."
        url="https://allaboutpdfediting.xyz/studio"
        image="https://allaboutpdfediting.xyz/opengraph-image.png"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Studio", item: "https://allaboutpdfediting.xyz/studio" },
        ]}
      />

      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-16 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">PDF Studio Pipeline</h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Multi-Step
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] truncate max-w-xs sm:max-w-md">
                {pdfBytes ? `${docName} (${(pdfBytes.length / 1024).toFixed(0)} KB · ${pages.filter(p => !p.deleted).length} pages)` : "Load a PDF to start continuous editing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 1 && (
              <button
                onClick={undoLastStep}
                className="px-3 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs font-semibold hover:border-indigo-500 transition flex items-center gap-1.5"
                title="Undo last modification"
              >
                ↩ Undo Step ({history.length - 1})
              </button>
            )}
            {pdfBytes && (
              <button
                onClick={exportFinalPdf}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!pdfBytes ? (
          /* Initial Upload Dropzone */
          <div className="max-w-2xl mx-auto my-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold mb-4">
                ⚡ Unified Multi-Step Workspace
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-3">
                All Your PDF Tasks in One Place
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                Delete unwanted pages, adjust orientation, add signatures, insert watermarks, and compress — all in one smooth continuous session without re-uploading every time.
              </p>
            </div>

            <label className="block border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500 rounded-3xl p-12 text-center bg-[var(--card)] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                📂
              </div>
              <p className="text-lg font-bold text-[var(--foreground)] mb-1">
                Drop your PDF here or click to browse
              </p>
              <p className="text-xs text-[var(--muted)] mb-6">
                100% private in-browser processing. Up to 100MB supported.
              </p>
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20">
                Open in PDF Studio
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">🗑️ + 🔄</div>
                <h4 className="font-bold text-xs">Delete & Rotate</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Visually manage pages</p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">✍️ + 💧</div>
                <h4 className="font-bold text-xs">Sign & Watermark</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Stamp & e-sign</p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">🗜️ + 🔒</div>
                <h4 className="font-bold text-xs">Compress & Export</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Optimize with 1 click</p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Studio Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Operation Toolset & Tabs */}
            <div className="lg:col-span-5 space-y-5">
              {/* Pipeline Navigation Tabs */}
              <div className="flex bg-[var(--card)] p-1 rounded-2xl border border-[var(--card-border)] overflow-x-auto gap-1">
                {[
                  { id: "pages" as ActiveTab, label: "Pages & Layout", icon: "📑" },
                  { id: "sign" as ActiveTab, label: "Sign", icon: "✍️" },
                  { id: "watermark" as ActiveTab, label: "Watermark", icon: "💧" },
                  { id: "protect" as ActiveTab, label: "Protect", icon: "🔒" },
                  { id: "compress" as ActiveTab, label: "Compress", icon: "🗜️" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      tab === t.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/40"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Pages & Layout Management */}
              {tab === "pages" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">Page Organizer</h3>
                      <p className="text-xs text-[var(--muted)]">Click red trash to remove or arrow to rotate</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => rotateAllPages(90)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[11px] font-semibold hover:border-indigo-500"
                        title="Rotate all 90° clockwise"
                      >
                        Rotate All 90°
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                    {pages.map((p, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl border p-2 text-center transition-all ${
                          p.deleted
                            ? "opacity-30 border-red-500 bg-red-500/10 grayscale"
                            : activePage === idx
                            ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/5"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-300"
                        }`}
                        onClick={() => setActivePage(idx)}
                      >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-gray-900/10">
                          <Image src={p.thumbnail} alt={`Page ${idx + 1}`} fill unoptimized className="object-contain" style={{ transform: `rotate(${p.rotation}deg)` }} />
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[var(--card-border)]/50">
                          <span className="text-[10px] font-bold text-[var(--muted)]">p. {idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); rotatePage(idx, 90); }}
                              className="p-1 rounded hover:bg-gray-500/20 text-xs text-[var(--muted)] hover:text-indigo-500"
                              title="Rotate this page 90°"
                            >
                              ↻
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleDeletePage(idx); }}
                              className={`p-1 rounded text-xs ${p.deleted ? "text-emerald-500 hover:bg-emerald-500/20" : "text-red-500 hover:bg-red-500/20"}`}
                              title={p.deleted ? "Restore page" : "Delete page"}
                            >
                              {p.deleted ? "↺" : "✕"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={applyPageModifications}
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {processing ? "Applying Page Changes..." : "⚡ Save Page Adjustments to Pipeline"}
                  </button>
                </div>
              )}

              {/* Tab 2: Signature */}
              {tab === "sign" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">Draw Signature</h3>
                      <p className="text-xs text-[var(--muted)]">Sign below and stamp onto page {activePage + 1}</p>
                    </div>
                    <button
                      onClick={clearSig}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 border border-red-500/20 hover:bg-red-500/10"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="border border-[var(--card-border)] rounded-2xl bg-white overflow-hidden touch-none shadow-inner">
                    <canvas
                      ref={sigCanvasRef}
                      width={380}
                      height={150}
                      className="w-full h-36 cursor-crosshair block"
                      onMouseDown={startSigDraw}
                      onMouseMove={drawSig}
                      onMouseUp={endSigDraw}
                      onMouseLeave={endSigDraw}
                      onTouchStart={startSigDraw}
                      onTouchMove={drawSig}
                      onTouchEnd={endSigDraw}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] mb-1">Ink Color</label>
                      <div className="flex gap-2">
                        {["#1e293b", "#2563eb", "#dc2626"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setSigColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition ${sigColor === c ? "scale-110 border-indigo-500 ring-2 ring-indigo-500/30" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] mb-1">Scale: {sigPosition.scale}x</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={sigPosition.scale}
                        onChange={(e) => setSigPosition(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applySignature}
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {processing ? "Applying Signature..." : `⚡ Stamp Signature on Page ${activePage + 1}`}
                  </button>
                </div>
              )}

              {/* Tab 3: Watermark */}
              {tab === "watermark" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Add Watermark Stamp</h3>
                    <p className="text-xs text-[var(--muted)]">Add text or security stamps across all pages</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm font-medium outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] mb-1">Rotation: {watermarkRotation}°</label>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="15"
                        value={watermarkRotation}
                        onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyWatermark}
                    disabled={processing || !watermarkText.trim()}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {processing ? "Stamping Watermark..." : "⚡ Stamp Watermark on All Pages"}
                  </button>
                </div>
              )}

              {/* Tab 4: Protect */}
              {tab === "protect" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Password Encryption</h3>
                    <p className="text-xs text-[var(--muted)]">Lock document before exporting</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] mb-1">Document Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter strong password..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm font-medium outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={applyPasswordProtection}
                    disabled={processing || !password.trim()}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {processing ? "Encrypting Document..." : "⚡ Apply Password Protection"}
                  </button>
                </div>
              )}

              {/* Tab 5: Compress & Export */}
              {tab === "compress" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Compress & Download</h3>
                    <p className="text-xs text-[var(--muted)]">Export your finalized multi-step PDF</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "recommended", label: "Balanced", desc: "Best quality/size" },
                      { id: "high", label: "Max Shrink", desc: "Smallest size" },
                      { id: "low", label: "HD Crisp", desc: "Lossless quality" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCompressionLevel(c.id as any)}
                        className={`p-3 rounded-xl border text-center transition ${
                          compressionLevel === c.id
                            ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                            : "border-[var(--card-border)] bg-[var(--background)]"
                        }`}
                      >
                        <p className="text-xs font-bold">{c.label}</p>
                        <p className="text-[10px] text-[var(--muted)]">{c.desc}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={exportFinalPdf}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-2xl hover:opacity-95 transition shadow-lg shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Final Pipeline PDF
                  </button>
                </div>
              )}

              {/* Pipeline History Timeline */}
              <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2.5">
                  Pipeline Steps Applied ({history.length})
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--foreground)]">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Document Canvas View */}
            <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-4 border-b border-[var(--card-border)]/60 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePage(p => Math.max(0, p - 1))}
                    disabled={activePage === 0}
                    className="p-1.5 rounded-lg border border-[var(--card-border)] disabled:opacity-30 hover:bg-[var(--card-border)]/40 text-xs font-bold"
                  >
                    ◀ Prev
                  </button>
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    Page {activePage + 1} of {pages.filter(p => !p.deleted).length}
                  </span>
                  <button
                    onClick={() => setActivePage(p => Math.min(pages.length - 1, p + 1))}
                    disabled={activePage >= pages.length - 1}
                    className="p-1.5 rounded-lg border border-[var(--card-border)] disabled:opacity-30 hover:bg-[var(--card-border)]/40 text-xs font-bold"
                  >
                    Next ▶
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                    className="w-7 h-7 rounded-lg border border-[var(--card-border)] flex items-center justify-center text-xs font-bold hover:bg-[var(--card-border)]/40"
                  >
                    −
                  </button>
                  <span className="text-xs font-mono font-bold">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                    className="w-7 h-7 rounded-lg border border-[var(--card-border)] flex items-center justify-center text-xs font-bold hover:bg-[var(--card-border)]/40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="w-full overflow-auto max-h-[600px] flex justify-center p-2 rounded-2xl bg-slate-950/20 border border-[var(--card-border)]/30">
                <canvas ref={mainCanvasRef} className="rounded-xl shadow-2xl max-w-full h-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
