"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

export default function ExtractTextPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("extract-text"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setText("");
  }, []);

  const runExtract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    setText("");
    let extracted = "";
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .filter(Boolean)
          .join(" ");
        extracted += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      setText(extracted);
      setSuccess(true);
    } catch {
      setError("Failed to extract text. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
    setProgress(0);
  }, [file]);

  const extract = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runExtract();
  }, [runExtract]);

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

  const copyText = () => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(".pdf", "") || "extracted"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackExport(file?.name || "extracted.txt", "Extract Text", blob.size);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Extract Text from PDF - Free Online Tool"
        description="Extract text content from PDF files online for free. Copy text from PDF documents instantly in your browser."
        url="https://allaboutpdfediting.xyz/extract-text"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Extract Text from PDF</h1>
        <p className="text-[var(--muted)]">Extract all text content from any PDF file.</p>
      </div>

      <ToolInfo
        name="Extract Text"
        description="Your PDF stays private. Text extraction runs locally in your browser using PDF.js — no uploads, no servers. Get all text content as plain text you can copy or download."
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
            <span className="text-5xl">📝</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Extracting text..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runExtract(); }} />}

        {file && (
          <>
            <button
              onClick={extract}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex flex-col items-center gap-1">
                  <span>Extracting text...</span>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 max-w-xs">
                    <div className="bg-indigo-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </span>
              ) : "Extract Text"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runExtract} onDismiss={() => setError(null)} />}

        {text && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--foreground)]">{text.split("\n").length} lines extracted</span>
              <div className="flex gap-2">
                <button onClick={copyText} className="text-xs px-3 py-1.5 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]">Copy</button>
                <button onClick={downloadText} className="text-xs px-3 py-1.5 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]">Download .txt</button>
              </div>
            </div>
            <pre className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto text-[var(--foreground)]">{text}</pre>
          </div>
        )}

        <SuccessAnimation show={success} message="Text extracted!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Extract Text</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our free PDF text extractor lets you extract text from PDF documents quickly and privately, making it an essential tool for researchers, students, and professionals. Whether you need to copy quotes for academic work, analyze document content for data processing, or repurpose text from a scanned PDF, this tool handles it all with ease. The extraction runs entirely in your browser using PDF.js, so your documents never leave your device — complete privacy guaranteed. To extract text from PDF online free, just upload your file and click extract. The tool reads every page and presents the text in a clean, copyable format with page markers. You can copy to clipboard or download as a .txt file for further editing.</p>
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
