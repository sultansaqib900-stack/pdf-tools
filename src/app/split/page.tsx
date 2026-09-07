"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import Link from "next/link";
import ToolShell from "@/components/ui/ToolShell";
import ToolGuide from "@/components/ToolGuide";
import DropZone from "@/components/ui/DropZone";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("split");

export default function SplitPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "all">("all");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("split"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const { PDFDocument: PDFDoc } = await import("pdf-lib");
    const pdf = await PDFDoc.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();
    setPageCount(count);
    setEndPage(count);
    setStartPage(1);
  }, []);

  const runSplit = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      if (mode === "all") {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const pdfBytes = await newPdf.save({ useObjectStreams: true });
          const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `page-${i + 1}-${file.name}`;
          a.click();
          URL.revokeObjectURL(url);
        }
        trackExport(file.name, "Split PDF", sourcePdf.getPageCount());
      } else {
        const s = Math.max(0, startPage - 1);
        const e = Math.min(sourcePdf.getPageCount() - 1, endPage - 1);
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, Array.from({ length: e - s + 1 }, (_, i) => s + i));
        pages.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pages-${startPage}-${endPage}-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        trackExport(file.name, "Split PDF", pdfBytes.byteLength);
      }
      setSuccess(true);
    } catch {
      setError("Failed to split PDF. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [file, mode, startPage, endPage]);

  const split = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSplit();
    }, [usage, upsell, runSplit])

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
    <ToolShell
      icon="split"
      title="Split PDF"
      lead="Extract a page range or break a document into single pages. Processed on your device."
    >
      <SoftwareAppJsonLd
        name="Split PDF - Free Online PDF Tool"
        description="Split PDF files online for free. Extract pages from PDF documents instantly in your browser. No uploads."
        url="https://allaboutpdfediting.xyz/split"
      />
      <HowToJsonLd name="Split PDF Pages Online" description="Separate PDF pages into multiple files or extract specific pages" steps={[{name:"Upload PDF",text:"Select the PDF file to split"},{name:"Choose split method",text:"Select page ranges or split every page"},{name:"Download split files",text:"Download the individual PDF files"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Split PDF", item: "https://allaboutpdfediting.xyz/split" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Split PDF" summary="Separate PDF pages into multiple documents or extract specific page ranges" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page range extraction","Split every page","Multiple output files","Client-side processing","Free"]} limits="Files up to 10MB" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <DropZone
          file={file}
          onFile={handleFile}
          hint={pageCount > 0 ? `${pageCount} page${pageCount > 1 ? "s" : ""}` : "PDF up to 10 MB"}
        />

        <ProgressBar processing={processing} fileSize={file?.size} label="Splitting PDF..." />

        {pageCount > 0 && (
          <div className="mt-6 space-y-5">
            <div className="inline-flex p-0.5 rounded-[var(--r-md)] bg-[var(--surface-sunken)] border border-[var(--border)]">
              {([["all", "Every page"], ["range", "Page range"]] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={`px-3 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] font-medium transition-colors ${
                    mode === id
                      ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "range" && (
              <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface-subtle)]">
                <label htmlFor="fromPage" className="text-[0.8125rem] text-[var(--muted)]">From</label>
                <input id="fromPage" type="number" min={1} max={pageCount} value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="input w-20 tabular-nums" />
                <label htmlFor="toPage" className="text-[0.8125rem] text-[var(--muted)]">to</label>
                <input id="toPage" type="number" min={1} max={pageCount} value={endPage}
                  onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="input w-20 tabular-nums" />
                <span className="text-[0.75rem] text-[var(--muted)]">of {pageCount}</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSplit(); }} />}

            <button
              onClick={split}
              disabled={processing || showTimer}
              className="btn btn-primary btn-lg w-full"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Splitting
                </>
              ) : mode === "all" ? `Split into ${pageCount} files` : `Extract pages ${startPage}–${endPage}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-[0.75rem] text-[var(--muted)]">
                Free tier is limited to 10 MB.{" "}
                <a href="/premium" className="font-medium text-[var(--accent)] hover:underline">Upgrade for 100 MB and batch processing</a>
              </p>
            )}
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runSplit} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Split complete!" onRestore={restoreOriginal} />
      </div>

      <ToolGuide
        summary={
          <p>
            <strong>To split a PDF:</strong> add your file, then either extract a specific page range
            or break the document into one file per page. Extracted pages keep their original quality
            and formatting, because pages are copied rather than re-rendered.
          </p>
        }
        steps={[
          { title: "Add your PDF", body: "Drop the file above. The page count is shown once it loads, so you can confirm you have the right document." },
          { title: "Choose how to split", body: "Use 'Page range' to pull out a specific section such as pages 12 to 40, or 'Every page' to produce a separate file for each page." },
          { title: "Split and download", body: "A single range downloads as one PDF. Splitting every page produces a set of files, one per page." },
        ]}
        sections={[
          {
            heading: "Page ranges: getting the numbers right",
            body: (
              <>
                <p>
                  Ranges here are inclusive, so 5 to 10 gives you six pages, including both 5 and 10.
                  Use the page numbers shown by your PDF reader, which are positions in the file — these
                  often differ from the numbers printed on the page, because front matter and cover
                  pages shift the sequence.
                </p>
                <p>
                  If the printed numbering matters to whoever receives the extract, add fresh numbering
                  afterwards with{" "}
                  <Link href="/add-page-numbers" className="text-[var(--accent)] hover:underline">Add page numbers</Link>{" "}
                  so the excerpt reads sensibly on its own.
                </p>
              </>
            ),
          },
          {
            heading: "Splitting by chapter instead of by number",
            body: (
              <>
                <p>
                  If your document has a bookmark outline — most ebooks, manuals and generated reports
                  do —{" "}
                  <Link href="/split-by-bookmarks" className="text-[var(--accent)] hover:underline">Split by bookmarks</Link>{" "}
                  is far more reliable than counting pages. It uses the existing outline as the break
                  points, so each output file is a complete chapter or section with a meaningful name.
                </p>
                <p>
                  For removing a handful of unwanted pages rather than extracting a section,{" "}
                  <Link href="/delete-pages" className="text-[var(--accent)] hover:underline">Delete pages</Link>{" "}
                  is the more direct tool, and{" "}
                  <Link href="/organize" className="text-[var(--accent)] hover:underline">Organize pages</Link>{" "}
                  lets you reorder and rotate at the same time.
                </p>
              </>
            ),
          },
          {
            heading: "A caution about confidential extracts",
            body: (
              <>
                <p>
                  Splitting changes which pages are present; it does not remove information embedded in
                  the document itself. Metadata such as the author, the original file name and revision
                  timestamps travels with the extract, and so does any content hidden behind a drawn
                  black box, which is not redaction.
                </p>
                <p>
                  Before sending an extract outside your organisation, run{" "}
                  <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">the metadata sanitiser</Link>{" "}
                  and, where sensitive content must be removed,{" "}
                  <Link href="/redact" className="text-[var(--accent)] hover:underline">Redact PDF</Link>,
                  which strips the underlying content rather than covering it.
                </p>
              </>
            ),
          },
        ]}
      />

      <RelatedContent slug="split" />

      <UseCaseLinks toolSlug="split" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
