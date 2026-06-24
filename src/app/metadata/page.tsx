"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import { isPremium, checkFileSize } from "@/lib/premium";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

export default function MetadataPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("metadata"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    setLoaded(false);
    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setTitle(pdf.getTitle() || "");
    setAuthor(pdf.getAuthor() || "");
    setSubject(pdf.getSubject() || "");
    setKeywords(pdf.getKeywords() || "");
    setLoaded(true);
  }, []);

  const runEdit = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      if (title) pdf.setTitle(title);
      if (author) pdf.setAuthor(author);
      if (subject) pdf.setSubject(subject);
      if (keywords) pdf.setKeywords(keywords.split(",").map((k) => k.trim()));

      const pdfBytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `metadata-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Metadata Editor", pdfBytes.length);
      setSuccess(true);
    } catch { setError("Failed to edit metadata."); }
    setProcessing(false);
  }, [file, title, author, subject, keywords]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runEdit();
  }, [runEdit]);

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Edit PDF Metadata - Free Online Tool"
        description="View and edit PDF document properties like title author and keywords online for free."
        url="https://allaboutpdfediting.xyz/metadata"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PDF Metadata Editor</h1>
        <p className="text-[var(--muted)]">View and edit PDF metadata like title, author, subject, and keywords.</p>
      </div>

      <ToolInfo name="PDF Metadata Editor" description="Your file stays private. Metadata editing happens locally in your browser — no uploads, no servers. View and update document properties instantly." />

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
            <span className="text-5xl">📋</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {loaded && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Keywords (comma separated)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runEdit(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Saving metadata..." />

        {loaded && (
          <>
            <button
              onClick={process}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving metadata...
                </span>
              ) : "Save Changes & Download"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users have a 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for instant processing</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runEdit} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Metadata updated successfully!" details={`Title: ${title || "(none)"}`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF Metadata Editor</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Edit PDF metadata online for free. Update document properties like title, author, subject, and keywords. Useful for organizing your PDF library, improving searchability, or preparing documents for publishing.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. The original file is never transmitted or stored.</p>
          <p>Keywords: edit PDF metadata online free, PDF properties editor, change PDF title author, update PDF document properties.</p>
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
