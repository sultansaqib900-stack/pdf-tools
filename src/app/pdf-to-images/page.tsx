"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ToolShell from "@/components/ui/ToolShell";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
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

const rc = getRelatedContent("pdf-to-images");

export default function PdfToImagesPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("pdf-to-images"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setPreviews([]);
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runExtract = useCallback(async () => {
    if (!file || !canvasRef.current) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    setPreviews([]);
    const previewsArr: string[] = [];
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = canvasRef.current;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvas: canvas, viewport: viewport }).promise;
        previewsArr.push(canvas.toDataURL("image/png"));
      }
      setPreviews(previewsArr);
      setSuccess(true);
    } catch {
      setError("Failed to extract images. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
    setProgress(0);
  }, [file]);

  const extract = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runExtract();
    }, [usage, upsell, runExtract])

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

  const downloadAll = () => {
    previews.forEach((dataUrl, i) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `page-${i + 1}.png`;
      a.click();
    });
    if (file) trackExport(file.name, "PDF to Images", previews.length);
  };

  return (
    <ToolShell icon="image" title={"PDF to Images"} lead={"Extract all pages as high-quality PNG images."}>
      <SoftwareAppJsonLd
        name="PDF to Images - Free Online Converter"
        description="Convert PDF pages to images online for free. Extract JPG PNG images from PDF documents in your browser."
        url="https://allaboutpdfediting.xyz/pdf-to-images"
      />
      <HowToJsonLd name="Convert PDF to Images" description="Extract PDF pages as high-quality JPG or PNG images" steps={[{name:"Upload PDF",text:"Select the PDF to convert to images"},{name:"Choose format",text:"Select JPG or PNG output format"},{name:"Download images",text:"Download individual page images or a ZIP archive"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to Images", item: "https://allaboutpdfediting.xyz/pdf-to-images" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="PDF to Images" summary="Convert PDF pages to high-quality JPG or PNG images" category="Graphics" inputType="PDF" outputType="Image" processing="client-side" price="free" features={["Page extraction","JPG PNG output","High quality","ZIP download","Free browser tool"]} limits="Files up to 10MB" />
      <canvas ref={canvasRef} className="hidden" />


      <ToolInfo
        name="PDF to Images"
        description="Your PDF stays on your device. Image extraction runs locally using PDF.js in your browser — no uploads, no servers. Each page is rendered as a high-quality PNG you can download individually."
      />


      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--surface)] rounded-[var(--r-lg)] border border-[var(--border)] p-8">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-[var(--r-lg)] p-10 text-center transition ${
            dragging ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]" : "border-[var(--border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <Icon name="camera" size={36} className="text-[var(--muted)]" />
            <span className="text-[var(--accent)] font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} page{pageCount > 1 ? "s" : ""}</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Extracting images..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runExtract(); }} />}

        {pageCount > 0 && (
          <>
            <button
              onClick={extract}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Extracting page {Math.floor(progress / (100 / pageCount)) + 1} of {pageCount}...
                  </span>
                  <div className="w-full bg-[var(--surface-sunken)] rounded-full h-1.5">
                    <div className="bg-[var(--accent)] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </span>
              ) : `Extract ${pageCount} page${pageCount > 1 ? "s" : ""} as images`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-[var(--accent)] font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </>
        )}

        {previews.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--foreground)]">{previews.length} image{previews.length > 1 ? "s" : ""} extracted</span>
              <button onClick={downloadAll} className="text-sm text-[var(--accent)] hover:text-[var(--accent)] font-medium">
                Download all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                  <div className="p-2 text-xs text-[var(--muted)] flex justify-between items-center">
                    <span>Page {i + 1}</span>
                    <a href={src} download={`page-${i + 1}.png`} className="text-[var(--accent)] hover:underline">Download</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runExtract} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Extraction complete!" onRestore={restoreOriginal} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF to Images</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Extract every page of your PDF as a high-quality PNG image using our PDF to images tool, designed for quick and private conversion. This is perfect for creating thumbnails, sharing individual pages on social media, or embedding document content into presentations and reports. To convert PDF to PNG, simply upload your file and click extract — each page is rendered client-side using PDF.js, ensuring your document never leaves your device. Use our free PDF to images online free tool to get high-resolution PNGs that preserve the original layout, fonts, and formatting of every page. Each image can be downloaded individually or all at once, giving you full control over how you use your extracted content.</p>
        </div>
      </div>
      <ToolGuide slug="pdf-to-images" />

      <RelatedContent slug="pdf-to-images" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
