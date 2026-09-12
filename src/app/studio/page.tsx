"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getPipelineDocument, pushPipelineStep, setPipelineDocument } from "@/lib/pdfPipeline";
import { scanPdfForPii, redactSelectedPii, type PiiMatch } from "@/lib/piiScanner";
import { DEFAULT_RECIPES, executePdfRecipe, type PdfRecipe } from "@/lib/pdfRecipes";
import { copyPdfBytes, downloadBytes, isPdfFile } from "@/lib/pdfBytes";
import { encryptPdf } from "@/lib/pdfSecurity";
import { compressPdfBytes } from "@/lib/pdfRaster";

type ActiveTab = "pages" | "pii" | "recipes" | "sign" | "watermark" | "protect" | "compress";

interface PageMetaInfo {
  index: number;
  rotation: number;
  thumbnail: string;
  deleted: boolean;
}

export default function StudioPage() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [docName, setDocName] = useState<string>("document.pdf");
  const [pages, setPages] = useState<PageMetaInfo[]>([]);
  const [activePage, setActivePage] = useState<number>(0);
  const [tab, setTab] = useState<ActiveTab>("pages");
  const [processing, setProcessing] = useState<boolean>(false);
  const [history, setHistory] = useState<{ label: string; bytes: Uint8Array }[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [protectedExportBytes, setProtectedExportBytes] = useState<Uint8Array | null>(null);

  // Signature state
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sigColor, setSigColor] = useState<string>("#1e293b");
  const [sigWidth] = useState<number>(3);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);
  const [sigPosition, setSigPosition] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 50, scale: 1 });

  // Watermark state
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(45);
  const [watermarkColor] = useState<string>("#dc2626");

  // Protect state
  const [password, setPassword] = useState<string>("");
  const [recipePassword, setRecipePassword] = useState<string>("");

  // Compress state
  const [compressionLevel, setCompressionLevel] = useState<"recommended" | "high" | "low">("recommended");

  // PII Scanner State inside Studio
  const [piiScanning, setPiiScanning] = useState(false);
  const [piiMatches, setPiiMatches] = useState<PiiMatch[]>([]);
  const [piiScanned, setPiiScanned] = useState(false);

  // Status banners
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const showError = useCallback((msg: string) => showToast(msg, "error"), [showToast]);

  // Load PDF into memory and render page thumbnails. PDF.js receives its own
  // copy because it transfers typed-array buffers to the worker.
  const loadPdfData = useCallback(async (bytes: Uint8Array, name: string) => {
    const stableBytes = copyPdfBytes(bytes);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const loadingTask = pdfjsLib.getDocument({ data: copyPdfBytes(stableBytes) });
      const pdf = await loadingTask.promise;
      const loadedPages: PageMetaInfo[] = [];

      try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(viewport.width));
          canvas.height = Math.max(1, Math.round(viewport.height));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas is unavailable.");
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          loadedPages.push({
            index: pageNumber - 1,
            rotation: 0,
            thumbnail: canvas.toDataURL("image/jpeg", 0.82),
            deleted: false,
          });
          page.cleanup();
        }
      } finally {
        await loadingTask.destroy();
      }

      setPdfBytes(stableBytes);
      setDocName(name);
      setPages(loadedPages);
      setActivePage(0);
    } catch (error) {
      throw new Error(
        error instanceof Error && /password/i.test(error.message)
          ? "This PDF is password protected. Unlock it before opening it in Studio."
          : "Could not parse PDF. The file may be password protected or corrupted.",
      );
    }
  }, []);

  const commitDocument = useCallback(async (bytes: Uint8Array, label: string) => {
    const stableBytes = copyPdfBytes(bytes);
    await loadPdfData(stableBytes, docName);
    await pushPipelineStep(label, stableBytes);
    setHistory((previous) => [...previous, { label, bytes: copyPdfBytes(stableBytes) }]);
    setProtectedExportBytes(null);
  }, [docName, loadPdfData]);

  // Initial load from pipeline or file drop
  useEffect(() => {
    let cancelled = false;
    void getPipelineDocument().then(async (activePipeline) => {
      if (cancelled || !activePipeline?.bytes) return;
      try {
        await loadPdfData(activePipeline.bytes, activePipeline.name);
        if (!cancelled) {
          setHistory([{ label: "Loaded Document", bytes: copyPdfBytes(activePipeline.bytes) }]);
        }
      } catch (error) {
        if (!cancelled) showError(error instanceof Error ? error.message : "Could not restore the pipeline document.");
      }
    });
    return () => { cancelled = true; };
  }, [loadPdfData, showError]);

  // Handle local file selection
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!isPdfFile(selected)) {
      showError("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    setProcessing(true);
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer());
      await loadPdfData(bytes, selected.name);
      await setPipelineDocument(bytes, selected.name);
      setHistory([{ label: `Original: ${selected.name}`, bytes: copyPdfBytes(bytes) }]);
      setProtectedExportBytes(null);
      success(`Loaded “${selected.name}” into Studio.`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Could not open this PDF.");
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  };

  // Render the currently selected page into the main canvas viewer
  useEffect(() => {
    if (!pdfBytes || pages.length === 0) return;
    const activeMeta = pages[activePage];
    const canvas = mainCanvasRef.current;
    if (!activeMeta || !canvas) return;
    if (activeMeta.deleted) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;

    void (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
        const task = pdfjsLib.getDocument({ data: copyPdfBytes(pdfBytes) });
        loadingTask = task;
        const pdf = await task.promise;
        const page = await pdf.getPage(activeMeta.index + 1);
        const viewport = page.getViewport({ scale: 1.2 * zoom, rotation: activeMeta.rotation });
        if (cancelled) return;

        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable.");
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        page.cleanup();
      } catch (error) {
        if (!cancelled) showError(error instanceof Error ? error.message : "Could not render this page.");
      } finally {
        if (loadingTask) await loadingTask.destroy().catch(() => undefined);
      }
    })();

    return () => { cancelled = true; };
  }, [pdfBytes, pages, activePage, zoom, showError]);

  // Page Operations
  const toggleDeletePage = (idx: number) => {
    const updated = pages.map((p, i) => i === idx ? { ...p, deleted: !p.deleted } : p);
    if (updated.filter(p => !p.deleted).length === 0) {
      showError("You cannot delete all pages.");
      return;
    }
    setPages(updated);
  };

  const rotatePage = (idx: number, degrees: number) => {
    setPages(prev => prev.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + degrees) % 360 } : p));
  };

  const rotateAllPages = (degrees: number) => {
    setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + degrees) % 360 })));
    success(`Rotated all pages by ${degrees}°`);
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    setPages((previous) => {
      const updated = [...previous];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
    setActivePage(target);
  };

  // Commit Page Organization Step
  const applyPageModifications = async () => {
    if (!pdfBytes) return;
    setProcessing(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      for (const p of pages) {
        if (!p.deleted) {
          const [copied] = await newDoc.copyPages(srcDoc, [p.index]);
          const currentRotation = copied.getRotation().angle;
          copied.setRotation(degrees((currentRotation + p.rotation) % 360));
          newDoc.addPage(copied);
        }
      }

      const outBytes = await newDoc.save({ useObjectStreams: true });
      await commitDocument(outBytes, "Pages Modified / Reorganized");
      success("Page adjustments saved to the pipeline.");
    } catch {
      showError("Failed to apply page modifications.");
    } finally {
      setProcessing(false);
    }
  };

  // PII Scanning & Redaction Step inside Studio
  const handleScanPii = async () => {
    if (!pdfBytes) return;
    setPiiScanning(true);
    setPiiMatches([]);
    try {
      const result = await scanPdfForPii(pdfBytes);
      setPiiMatches(result.matches);
      setPiiScanned(true);
      if (result.matches.length > 0) {
        success(`Found ${result.matches.length} sensitive items in document.`);
      } else {
        success("No sensitive items detected!");
      }
    } catch {
      showError("PII scan failed.");
    } finally {
      setPiiScanning(false);
    }
  };

  const handleApplyPiiRedactions = async () => {
    if (!pdfBytes || piiMatches.length === 0) return;
    const selected = piiMatches.filter(m => m.selected);
    if (selected.length === 0) {
      showError("No items selected for redaction.");
      return;
    }
    setProcessing(true);
    try {
      const outBytes = await redactSelectedPii(copyPdfBytes(pdfBytes), selected);
      await commitDocument(outBytes, `Securely Redacted ${selected.length} PII Items`);
      setPiiScanned(false);
      setPiiMatches([]);
      success(`Permanently blacked out ${selected.length} items!`);
    } catch {
      showError("Failed to apply redactions.");
    } finally {
      setProcessing(false);
    }
  };

  // Run Recipe Step inside Studio
  const handleExecuteRecipeInStudio = async (recipe: PdfRecipe) => {
    if (!pdfBytes) return;
    const createsProtectedOutput = recipe.actions.some((action) => action.type === "protect");
    if (createsProtectedOutput && recipePassword.length < 4) {
      showError("Enter a password of at least 4 characters before running this protected recipe.");
      return;
    }

    setProcessing(true);
    try {
      const outBytes = await executePdfRecipe(
        copyPdfBytes(pdfBytes),
        recipe,
        undefined,
        { password: recipePassword },
      );
      if (createsProtectedOutput) {
        setProtectedExportBytes(copyPdfBytes(outBytes));
        setHistory((previous) => [
          ...previous,
          { label: `Prepared Encrypted Export: ${recipe.name}`, bytes: copyPdfBytes(pdfBytes) },
        ]);
        success(`“${recipe.name}” completed. The encrypted PDF is ready to export.`);
      } else {
        await commitDocument(outBytes, `Executed Macro: ${recipe.name}`);
        success(`Successfully ran “${recipe.name}”.`);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : `Failed to run recipe: ${recipe.name}`);
    } finally {
      setProcessing(false);
    }
  };

  // Signature Canvas Handling
  const signaturePoint = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const source = "touches" in event ? event.touches[0] : event;
    if (!source || rect.width === 0 || rect.height === 0) return null;
    return {
      x: (source.clientX - rect.left) * (canvas.width / rect.width),
      y: (source.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startSigDraw = (event: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in event) event.preventDefault();
    const canvas = sigCanvasRef.current;
    const point = signaturePoint(event);
    if (!canvas || !point) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    setIsDrawingSig(true);
    context.strokeStyle = sigColor;
    context.lineWidth = sigWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const drawSig = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingSig) return;
    if ("touches" in event) event.preventDefault();
    const canvas = sigCanvasRef.current;
    const point = signaturePoint(event);
    if (!canvas || !point) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const endSigDraw = () => setIsDrawingSig(false);

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Commit Signature Step
  const applySignature = async () => {
    const signatureCanvas = sigCanvasRef.current;
    if (!pdfBytes || !signatureCanvas) return;
    const signatureContext = signatureCanvas.getContext("2d");
    const hasInk = signatureContext
      ? signatureContext.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height).data.some((value, index) => index % 4 === 3 && value > 0)
      : false;
    if (!hasInk) {
      showError("Draw a signature before stamping it onto the PDF.");
      return;
    }

    setProcessing(true);
    const displayedPage = activePage + 1;
    try {
      const sigDataUrl = signatureCanvas.toDataURL("image/png");
      const sigImgBytes = await fetch(sigDataUrl).then((response) => response.arrayBuffer());

      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(copyPdfBytes(pdfBytes));
      const sigImg = await doc.embedPng(sigImgBytes);
      const sourcePageIndex = pages[activePage]?.index ?? activePage;
      const targetPage = doc.getPages()[sourcePageIndex];
      if (!targetPage) throw new Error("The selected page no longer exists.");

      const { width, height } = targetPage.getSize();
      const drawWidth = 140 * sigPosition.scale;
      const drawHeight = 60 * sigPosition.scale;
      targetPage.drawImage(sigImg, {
        x: width / 2 - drawWidth / 2,
        y: height * 0.15,
        width: drawWidth,
        height: drawHeight,
      });

      const outBytes = await doc.save({ useObjectStreams: true });
      await commitDocument(outBytes, `Added Signature (Page ${displayedPage})`);
      clearSig();
      success(`Signature placed on page ${displayedPage}.`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to apply signature.");
    } finally {
      setProcessing(false);
    }
  };

  // Commit Watermark Step
  const applyWatermark = async () => {
    if (!pdfBytes || !watermarkText.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");
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

      const outBytes = await doc.save({ useObjectStreams: true });
      await commitDocument(outBytes, `Applied Watermark (“${watermarkText}”)`);
      success("Watermark stamped on all pages.");
    } catch {
      showError("Failed to apply watermark.");
    } finally {
      setProcessing(false);
    }
  };

  // Encryption is a final export step: encrypted bytes cannot be reopened by
  // pdf-lib for more edits, so Studio keeps the editable copy in memory and
  // uses the encrypted copy for downloads until another edit is committed.
  const applyPasswordProtection = async () => {
    if (!pdfBytes || !password.trim()) return;
    if (password.length < 4) {
      showError("Use a password of at least 4 characters.");
      return;
    }
    setProcessing(true);
    try {
      const encrypted = await encryptPdf(copyPdfBytes(pdfBytes), password);
      setProtectedExportBytes(copyPdfBytes(encrypted));
      setHistory((previous) => [
        ...previous,
        { label: "Prepared AES-256 Protected Export", bytes: copyPdfBytes(pdfBytes) },
      ]);
      success("AES-256 encryption applied. Export will download the protected PDF.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to encrypt document.");
    } finally {
      setProcessing(false);
    }
  };

  // Final Export & Download
  const exportFinalPdf = () => {
    const output = protectedExportBytes ?? pdfBytes;
    if (!output) return;
    downloadBytes(output, `${protectedExportBytes ? "protected" : "studio"}-${docName}`);
    success(protectedExportBytes ? "Encrypted PDF exported successfully." : "PDF Studio document exported successfully.");
  };

  const applyCompressionAndExport = async () => {
    if (!pdfBytes) return;
    setProcessing(true);
    try {
      const mode = compressionLevel === "high"
        ? "maximum"
        : compressionLevel === "low"
          ? "lossless"
          : "balanced";
      const result = await compressPdfBytes(copyPdfBytes(pdfBytes), mode);
      if (result.outputSize < result.originalSize) {
        await commitDocument(result.bytes, `Compressed PDF (${Math.round((1 - result.outputSize / result.originalSize) * 100)}% smaller)`);
      }
      downloadBytes(result.bytes, `compressed-${docName}`);
      success(
        result.outputSize < result.originalSize
          ? `Compressed PDF by ${Math.round((1 - result.outputSize / result.originalSize) * 100)}% and downloaded it.`
          : "The PDF was already optimized, so the original-size version was downloaded.",
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to compress the PDF.");
    } finally {
      setProcessing(false);
    }
  };

  // Undo to previous pipeline step
  const undoLastStep = async () => {
    if (history.length <= 1) return;
    const prevStep = history[history.length - 2];
    setProcessing(true);
    try {
      await loadPdfData(copyPdfBytes(prevStep.bytes), docName);
      await pushPipelineStep(`Undo to: ${prevStep.label}`, prevStep.bytes);
      setHistory((previous) => previous.slice(0, -1));
      setProtectedExportBytes(null);
      success(`Reverted to: ${prevStep.label}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Could not undo the last step.");
    } finally {
      setProcessing(false);
    }
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
                {protectedExportBytes ? "Export Protected PDF" : "Export PDF"}
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
                Delete unwanted pages, auto-redact SSNs/PII, run 1-click recipes, add signatures, insert watermarks, and compress — all in one smooth continuous session without re-uploading every time.
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-8">
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">🛡️ PII</div>
                <h4 className="font-bold text-xs">Auto-Redact</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Scan SSNs &amp; cards</p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">⚡ Macro</div>
                <h4 className="font-bold text-xs">1-Click Recipes</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Automate 5 steps</p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">✍️ + 💧</div>
                <h4 className="font-bold text-xs">Sign &amp; Watermark</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Stamp &amp; e-sign</p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-center">
                <div className="text-2xl mb-1">🗜️ + 🔒</div>
                <h4 className="font-bold text-xs">Compress &amp; Protect</h4>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">AES encrypt &amp; shrink</p>
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
                  { id: "pages" as ActiveTab, label: "Pages", icon: "📑" },
                  { id: "pii" as ActiveTab, label: "PII Guard", icon: "🛡️" },
                  { id: "recipes" as ActiveTab, label: "Recipes", icon: "⚡" },
                  { id: "sign" as ActiveTab, label: "Sign", icon: "✍️" },
                  { id: "watermark" as ActiveTab, label: "Watermark", icon: "💧" },
                  { id: "protect" as ActiveTab, label: "Protect", icon: "🔒" },
                  { id: "compress" as ActiveTab, label: "Export", icon: "📦" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
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

              {/* Tab: Pages & Layout Management */}
              {tab === "pages" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">Page Organizer</h3>
                      <p className="text-xs text-[var(--muted)]">Click trash to remove or arrow to rotate</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => rotateAllPages(90)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[11px] font-semibold hover:border-indigo-500"
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
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); movePage(idx, -1); }}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-gray-500/20 text-[10px] text-[var(--muted)] hover:text-indigo-500 disabled:opacity-25"
                              title="Move page earlier"
                              aria-label={`Move page ${idx + 1} earlier`}
                            >
                              ←
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); movePage(idx, 1); }}
                              disabled={idx === pages.length - 1}
                              className="p-1 rounded hover:bg-gray-500/20 text-[10px] text-[var(--muted)] hover:text-indigo-500 disabled:opacity-25"
                              title="Move page later"
                              aria-label={`Move page ${idx + 1} later`}
                            >
                              →
                            </button>
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

              {/* Tab: PII Guardian Scanner */}
              {tab === "pii" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <span>🛡️</span> PII &amp; Secrets Auto-Redactor
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Scan in-memory document for SSNs, credit cards, emails, and phone numbers.
                    </p>
                  </div>

                  {!piiScanned ? (
                    <button
                      onClick={handleScanPii}
                      disabled={piiScanning}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-extrabold rounded-xl hover:opacity-95 disabled:opacity-40 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                    >
                      {piiScanning ? "Scanning Active Document..." : "⚡ 1-Click Scan for PII Data"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)] flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--foreground)]">
                          Found {piiMatches.length} Sensitive Item(s)
                        </span>
                        <button
                          onClick={handleScanPii}
                          className="text-indigo-400 font-semibold hover:underline"
                        >
                          Re-scan
                        </button>
                      </div>

                      {piiMatches.length > 0 ? (
                        <>
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {piiMatches.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => setPiiMatches(prev => prev.map(item => item.id === m.id ? { ...item, selected: !item.selected } : item))}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                                  m.selected ? "border-red-500/50 bg-red-500/10" : "border-[var(--card-border)] opacity-60"
                                }`}
                              >
                                <div>
                                  <span className="font-mono font-bold text-[var(--foreground)] block">{m.maskedValue}</span>
                                  <span className="text-[10px] text-[var(--muted)]">{m.typeLabel} · Page {m.pageIndex + 1}</span>
                                </div>
                                <span className="text-[10px] font-bold text-red-400">
                                  {m.selected ? "Blackout ⬛" : "Keep"}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleApplyPiiRedactions}
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-extrabold rounded-xl hover:opacity-95 disabled:opacity-40 transition shadow-md shadow-red-500/20 active:scale-[0.99]"
                          >
                            {processing ? "Applying Redactions..." : `⬛ Burn Permanent Blackouts (${piiMatches.filter(m => m.selected).length})`}
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-emerald-400 font-bold text-center py-4">
                          ✓ Document is clean! No PII found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: 1-Click Recipes */}
              {tab === "recipes" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <span>⚡</span> 1-Click Workflow Recipes
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Execute multi-step macro pipelines on this document in 1 click.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="studioRecipePassword" className="block text-[11px] font-bold text-[var(--muted)] mb-1">
                      Password for recipes with a Protect step
                    </label>
                    <input
                      id="studioRecipePassword"
                      type="password"
                      autoComplete="new-password"
                      value={recipePassword}
                      onChange={(event) => setRecipePassword(event.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {DEFAULT_RECIPES.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500 transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{recipe.icon}</span>
                              <h4 className="text-xs font-bold text-[var(--foreground)]">{recipe.name}</h4>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] mt-1 line-clamp-2">{recipe.description}</p>
                          </div>
                          <button
                            onClick={() => handleExecuteRecipeInStudio(recipe)}
                            disabled={processing || (recipe.actions.some((action) => action.type === "protect") && recipePassword.length < 4)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold shrink-0 transition disabled:opacity-40"
                          >
                            Run Macro
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Signature */}
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

              {/* Tab: Watermark */}
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

              {/* Tab: Protect */}
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

                  {protectedExportBytes && (
                    <p className="text-xs font-bold text-emerald-500 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                      ✓ AES-256 protected export is ready. Any new edit will clear it.
                    </p>
                  )}

                  <button
                    onClick={applyPasswordProtection}
                    disabled={processing || password.length < 4}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-indigo-500/20 active:scale-[0.99]"
                  >
                    {processing ? "Encrypting Document..." : "⚡ Apply Password Protection"}
                  </button>
                </div>
              )}

              {/* Tab: Compress & Export */}
              {tab === "compress" && (
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Compress &amp; Download</h3>
                    <p className="text-xs text-[var(--muted)]">Export your finalized multi-step PDF</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "recommended", label: "Balanced", desc: "Good quality; flattens" },
                      { id: "high", label: "Max Shrink", desc: "Smallest; flattens" },
                      { id: "low", label: "Lossless", desc: "Keeps text & forms" },
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
                    onClick={applyCompressionAndExport}
                    disabled={processing}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition shadow-lg shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 0 0 2-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {processing ? "Compressing PDF…" : "Compress & Download Final PDF"}
                  </button>
                </div>
              )}

              {/* Pipeline History Timeline */}
              <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[var(--muted)]">
                    Pipeline Execution Steps ({history.length})
                  </span>
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf";
                      input.onchange = (e) => handleFileUpload(e as any);
                      input.click();
                    }}
                    className="text-indigo-400 font-semibold hover:underline"
                  >
                    Load Different PDF
                  </button>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {history.map((step, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded-lg flex items-center justify-between ${
                        idx === history.length - 1
                          ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold"
                          : "text-[var(--muted)] hover:bg-[var(--background)]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {idx + 1}. {step.label}
                      </span>
                      {idx === history.length - 1 && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live High-Resolution Page Canvas & Preview */}
            <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    Page {activePage + 1} of {pages.filter(p => !p.deleted).length}
                  </span>
                  {pages[activePage]?.deleted && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      Marked for Deletion
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActivePage(Math.max(0, activePage - 1))}
                    disabled={activePage === 0}
                    className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] text-xs font-bold disabled:opacity-30 hover:border-indigo-500"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setActivePage(Math.min(pages.length - 1, activePage + 1))}
                    disabled={activePage >= pages.length - 1}
                    className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] text-xs font-bold disabled:opacity-30 hover:border-indigo-500"
                  >
                    Next →
                  </button>
                  <div className="h-4 w-[1px] bg-[var(--card-border)] mx-1" />
                  <button
                    onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                    className="px-2 py-1 rounded-lg border border-[var(--card-border)] text-xs font-bold hover:border-indigo-500"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold px-1 text-[var(--muted)]">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                    className="px-2 py-1 rounded-lg border border-[var(--card-border)] text-xs font-bold hover:border-indigo-500"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Main Document Canvas Viewport */}
              <div className="bg-slate-900/60 rounded-2xl p-4 flex items-center justify-center min-h-[500px] overflow-auto border border-[var(--card-border)] shadow-inner">
                <canvas
                  ref={mainCanvasRef}
                  className="rounded-lg shadow-2xl max-w-full h-auto bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2 animate-scaleIn ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toast.type === "error"
              ? "bg-red-950/90 border-red-500/40 text-red-300"
              : "bg-indigo-950/90 border-indigo-500/40 text-indigo-300"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
