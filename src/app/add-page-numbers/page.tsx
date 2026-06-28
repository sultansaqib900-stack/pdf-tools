"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";

export default function AddPageNumbersPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<"bottom-left" | "bottom-center" | "bottom-right" | "top-left" | "top-center" | "top-right">("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => { trackToolVisit("add-page-numbers"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    const bytes = await f.arrayBuffer();
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runAddNumbers = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      const [vPos, hPos] = position.split("-") as [string, string];
      const margin = 40;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const num = startNumber + i;
        const text = `${num}`;
        const fontSize = 10;

        let x: number;
        if (hPos === "left") x = margin;
        else if (hPos === "right") x = width - margin - 30;
        else x = width / 2 - 10;

        let y: number;
        if (vPos === "top") y = height - margin;
        else y = margin;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `numbered-${file.name}`;
      a.click();
      trackExport(file.name, "Add Page Numbers", bytes.byteLength);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to add page numbers.");
    }
    setProcessing(false);
  }, [file, position, startNumber]);

  const addNumbers = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runAddNumbers();
    }, [usage, upsell, runAddNumbers])

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

  const positions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Add Page Numbers to PDF - Free Online Tool"
        description="Add page numbers to PDF documents online for free. Customizable positioning and formatting."
        url="https://allaboutpdfediting.xyz/add-page-numbers"
      />
      <HowToJsonLd name="Add Page Numbers to PDF" description="Insert page numbers at any position in PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF to add page numbers"},{name:"Customize numbering",text:"Choose position style and starting number"},{name:"Download numbered PDF",text:"Download the PDF with page numbers added"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Add Page Numbers", item: "https://allaboutpdfediting.xyz/add-page-numbers" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="Add Page Numbers" summary="Insert page numbers into PDF documents with customizable position and formatting" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page numbering","Position selection","Custom start number","Style options","Free tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Add Page Numbers</h1>
        <p className="text-[var(--muted)]">Insert page numbers into your PDF at any position.</p>
      </div>

      <ToolInfo
        name="Add Page Numbers"
        description="Your PDF stays on your device. Page numbering runs entirely in your browser using pdf-lib — no uploads, no servers. Choose position and start number, then download instantly."
      />

      <AdBanner />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 mt-8">
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
            <span className="text-5xl">🔢</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} pages</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Adding page numbers..." />

        {file && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {positions.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value as typeof position)}
                    className={`py-2 rounded-lg border text-xs font-medium transition ${
                      position === p.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--card-border)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-[var(--muted)]">Start number:</label>
              <input
                type="number"
                min={1}
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                className="w-20 px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] text-sm"
              />
            </div>

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runAddNumbers(); }} />}

            <button
              onClick={addNumbers}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? "Adding page numbers..." : `Add page numbers (${pageCount} pages)`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}

          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runAddNumbers} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Page numbers added!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Add Page Numbers</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Number your PDF pages easily with our free tool, designed for authors, office workers, and anyone preparing professional documents. Whether you are laying out a book, organizing a multi-section report, or creating an instruction manual, adding sequential page numbers helps readers navigate your content with confidence. Our tool lets you choose from six positions — top or bottom, aligned left, center, or right — and set any starting number. To add page numbers to PDF online free, just upload your file, pick your settings, and download instantly. The numbering is applied client-side using pdf-lib, so your files remain private and secure. The clean Helvetica font and balanced size blend seamlessly with your document's layout.</p>
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
