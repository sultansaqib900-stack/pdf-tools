"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
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

export default function OcrPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ pages: string[]; fullText: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { trackToolVisit("ocr-pdf"); }, []);

  const runOcr = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress("Initializing OCR engine...");
    setOcrResult(null);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const Tesseract = await import("tesseract.js");
      const buffer = await file.arrayBuffer();
      const isPdf = file.type === "application/pdf";
      const pageTexts: string[] = [];

      if (isPdf) {
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(`Recognizing page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 2 });
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
          const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
          const { data: { text } } = await Tesseract.recognize(blob, "eng");
          pageTexts.push(text || "[No text detected]");
        }
      } else {
        setProgress("Recognizing text...");
        const { data: { text } } = await Tesseract.recognize(new Blob([buffer]), "eng");
        pageTexts.push(text || "[No text detected]");
      }

      setOcrResult({ pages: pageTexts, fullText: pageTexts.join("\n\n--- Page Break ---\n\n") });
      trackExport(file.name, "OCR PDF", buffer.byteLength);
    } catch (err) {
      console.error(err);
      setError("OCR failed. Please try a different file.");
    }
    setProcessing(false);
    setProgress("");
  }, [file]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setError("Please upload an image or PDF file.");
      return;
    }
    setFile(f);
    setOcrResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0] || null);
  }, [handleFile]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runOcr();
    }, [usage, upsell, runOcr])

  const downloadText = useCallback(() => {
    if (!ocrResult) return;
    const blob = new Blob([ocrResult.fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(/\.[^.]+$/, "") || "ocr"}-recognized.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [ocrResult, file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="OCR PDF - Free Online OCR"
        description="Extract text from scanned PDFs and images using OCR."
        url="https://allaboutpdfediting.xyz/ocr-pdf"
      />
      <HowToJsonLd name="OCR PDF" description="Extract text from scanned documents" steps={[{name:"Upload file",text:"Upload a scanned PDF or image"},{name:"Run OCR",text:"AI recognizes text from the document"},{name:"Copy or download",text:"Copy the extracted text or download as TXT"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "OCR PDF", item: "https://allaboutpdfediting.xyz/ocr-pdf" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="OCR PDF" summary="Extract text from scanned PDFs and images using optical character recognition" category="OCR" inputType="PDF/Image" outputType="Text" processing="client-side" price="free" features={["Scanned PDF OCR","Image text extraction","Multi-page support","Copy to clipboard","Download as TXT"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">OCR PDF</h1>
        <p className="text-[var(--muted)]">Extract text from scanned PDFs and images using OCR.</p>
      </div>

      <ToolInfo
        name="OCR PDF"
        description="Your documents never leave your device. OCR processing happens entirely in your browser using Tesseract.js — no uploads, no servers."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileInput"
            ref={fileRef}
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🔍</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select a PDF or image"}
            </span>
            <span className="text-xs text-[var(--muted)]">Supports PDF, JPG, PNG, BMP, TIFF</span>
          </label>
        </div>

        {file && !ocrResult && (
          <ProgressBar processing={processing} fileSize={file.size} label={progress || "Processing..."} />
        )}

        {file && !processing && !ocrResult && (
          <>
            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runOcr(); }} />}
            <button
              onClick={convert}
              disabled={showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Recognize Text
            </button>
            {!isPremium() && (
              <p className="text-center text-xs text-[var(--muted)]">
                Free users limited to 3 pages.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for unlimited pages & larger files</a>
              </p>
            )}
          </>
        )}

        {ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Recognized {ocrResult.pages.length} page{ocrResult.pages.length > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(ocrResult.fullText)}
                  className="px-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--card-border)] rounded-lg hover:bg-[var(--card-hover)] transition"
                >
                  Copy
                </button>
                <button
                  onClick={downloadText}
                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Download TXT
                </button>
              </div>
            </div>
            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-sans">{ocrResult.fullText}</pre>
            </div>
            <button
              onClick={() => { setFile(null); setOcrResult(null); }}
              className="w-full py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              Recognize another document
            </button>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runOcr} onDismiss={() => setError(null)} />}
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About OCR PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>OCR (Optical Character Recognition) extracts text from scanned documents and images, making it searchable and editable. Upload a scanned PDF or photo of a document, and our OCR engine recognizes the text — all in your browser with zero server uploads.</p>
          <p>Perfect for digitizing printed documents, extracting text from screenshots, making scanned PDFs searchable, or converting image-based content into editable text. Powered by Tesseract.js, one of the most accurate open-source OCR engines.</p>
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
