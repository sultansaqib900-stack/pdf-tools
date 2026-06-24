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

export default function WordCounterPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ words: number; chars: number; charsNoSpace: number; pages: number; readingTime: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { trackToolVisit("word-counter"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setResult(null);
    setError(null);
    setSuccess(false);
  }, []);

  const runCount = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => ("str" in item ? (item as { str: string }).str : "")).join(" ") + " ";
      }
      const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
      const chars = fullText.length;
      const charsNoSpace = fullText.replace(/\s/g, "").length;
      const readingTime = Math.ceil(words / 200);
      setResult({ words, chars, charsNoSpace, pages: pdf.numPages, readingTime });
      setSuccess(true);
    } catch {
      setError("Failed to count words. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [file]);

  const count = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runCount();
  }, [runCount]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="PDF Word Counter - Free Online Tool"
        description="Count words, characters, and pages in any PDF file. Free online PDF word counter."
        url="https://allaboutpdfediting.xyz/word-counter"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PDF Word Counter</h1>
        <p className="text-[var(--muted)]">Count words, characters, and pages in any PDF document.</p>
      </div>

      <ToolInfo
        name="PDF Word Counter"
        description="Your PDF never leaves your device. All text extraction and counting happens locally in your browser using PDF.js — no uploads, no servers. Upload your file and get detailed word, character, and page statistics instantly."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
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
            <span className="text-5xl">🔤</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Counting words..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCount(); }} />}

        {file && (
          <>
            <button
              onClick={count}
              disabled={processing || showTimer || !!result}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Counting...
                </span>
              ) : result ? "Counted" : "Count Words"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runCount} onDismiss={() => setError(null)} />}

        {result && !processing && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-xs text-[var(--muted)] mb-1">Total Words</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{result.words.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-xs text-[var(--muted)] mb-1">Characters</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{result.chars.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-xs text-[var(--muted)] mb-1">Characters (no spaces)</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{result.charsNoSpace.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-xs text-[var(--muted)] mb-1">Pages</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{result.pages.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)] col-span-2">
              <p className="text-xs text-[var(--muted)] mb-1">Estimated Reading Time</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{result.readingTime} min{result.readingTime !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}

        <SuccessAnimation show={success} message="Word count complete!" details={`${result?.words.toLocaleString()} words, ${result?.pages} page${result?.pages !== 1 ? "s" : ""}`} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF Word Counter</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our free PDF word counter lets you count words, characters, and pages in any PDF document instantly. Whether you are a student checking an essay, a professional preparing a report with specific length requirements, or a writer tracking your progress, this tool gives you accurate statistics with zero effort.</p>
          <p>The tool uses PDF.js to extract text from every page of your PDF and computes word counts, character counts (with and without spaces), total pages, and estimated reading time based on 200 words per minute. Everything runs in your browser — your document never leaves your device, ensuring complete privacy.</p>
          <p>Keywords: PDF word counter, count words in PDF, PDF character count, PDF page counter, word count PDF online free, PDF word count tool.</p>
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
