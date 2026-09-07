"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize, checkBatchCount } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import Link from "next/link";
import ToolShell from "@/components/ui/ToolShell";
import ToolGuide from "@/components/ToolGuide";
import DropZone from "@/components/ui/DropZone";
import Icon from "@/components/ui/Icon";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("merge");

export default function MergePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("merge"); }, []);

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const countCheck = checkBatchCount(list.length);
    if (!countCheck.ok) { upsell.showUpsell("file-size"); return; }
    setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.type === "application/pdf")]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const runMerge = useCallback(async () => {
    if (files.length < 2) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        if (!originalBytes.current) { originalBytes.current = bytes; }
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport(files[0]?.name || "merged.pdf", "Merge PDF", mergedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to merge PDFs. One or more files may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [files]);

  const merge = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runMerge();
    }, [usage, upsell, runMerge])

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${files[0]?.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i: number) => {
    if (i === files.length - 1) return;
    setFiles((prev) => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  };

  return (
    <ToolShell
      icon="merge"
      title="Merge PDF"
      lead="Combine several PDFs into one document and set the page order. Nothing is uploaded."
    >
      <SoftwareAppJsonLd
        name="Merge PDF - Free Online PDF Tool"
        description="Merge multiple PDFs into one document online for free. Combine PDF files instantly in your browser. No uploads required."
        url="https://allaboutpdfediting.xyz/merge"
      />
      <HowToJsonLd name="Merge PDF Files Online" description="Combine multiple PDF files into a single document" steps={[{name:"Upload PDFs",text:"Select two or more PDF files to merge"},{name:"Arrange order",text:"Drag and drop files to set the desired order"},{name:"Download merged PDF",text:"Download the combined single PDF document"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Merge PDF", item: "https://allaboutpdfediting.xyz/merge" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Merge PDF" summary="Combine multiple PDF documents into one file with customizable page order" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file merging","Order customization","Drag-and-drop","Free processing","No file uploads"]} limits="Files up to 10MB" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <DropZone
          multiple
          onFiles={(list) => handleFiles(list as unknown as FileList)}
          label="Drop PDFs here, or click to browse"
          hint="Select two or more files"
        />

        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.8125rem] text-[var(--muted)]">
                {files.length} file{files.length > 1 ? "s" : ""} &middot; drag order with the arrows
              </p>
              <button onClick={() => setFiles([])} className="text-[0.75rem] text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                Clear all
              </button>
            </div>
            <ul className="space-y-1.5">
              {files.map((file, i) => (
                <li key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)]">
                  <span className="w-5 shrink-0 text-[0.75rem] tabular-nums text-[var(--muted)]">{i + 1}</span>
                  <span className="flex-1 min-w-0 truncate text-[0.8125rem] text-[var(--foreground)]">{file.name}</span>
                  <span className="shrink-0 text-[0.75rem] tabular-nums text-[var(--muted)]">{formatBytes(file.size)}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i === 0} aria-label="Move up"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                      <Icon name="chevronDown" size={14} className="rotate-180" />
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === files.length - 1} aria-label="Move down"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                      <Icon name="chevronDown" size={14} />
                    </button>
                    <button onClick={() => removeFile(i)} aria-label="Remove"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-hover)] transition-colors">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ProgressBar processing={processing} fileSize={files.reduce((s, f) => s + f.size, 0)} label="Merging PDFs..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runMerge(); }} />}

        <button
          onClick={merge}
          disabled={files.length < 2 || processing || showTimer}
          className="btn btn-primary btn-lg w-full mt-4"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Merging {files.length} files
            </>
          ) : files.length > 0 ? `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}` : "Merge PDFs"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-[0.75rem] text-[var(--muted)]">
            Free tier is limited to 10 MB.{" "}
            <a href="/premium" className="font-medium text-[var(--accent)] hover:underline">Upgrade for 100 MB and batch processing</a>
          </p>
        )}

        {files.length > 0 && files.length < 2 && (
          <p className="mt-2 text-center text-[0.75rem] text-[var(--muted)]">Select at least two PDFs to merge.</p>
        )}

        {error && <ErrorBanner message={error} onRetry={runMerge} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDFs merged!" onRestore={restoreOriginal} />
      </div>

      <ToolGuide
        summary={
          <p>
            <strong>To merge PDFs:</strong> add two or more files above, drag them into the order you
            want, then click merge. Pages are copied without re-encoding, so the output keeps the
            original quality of every source document.
          </p>
        }
        steps={[
          { title: "Add your files", body: "Select several PDFs at once, or add them in batches. They appear in a list in the order they were added." },
          { title: "Put them in the right order", body: "Drag rows to reorder, or remove anything added by mistake. This order is exactly the order of the final document, so check it before merging." },
          { title: "Merge and download", body: "The combined file is assembled in your browser and downloaded straight to your device." },
        ]}
        sections={[
          {
            heading: "Mixed page sizes and orientations",
            body: (
              <>
                <p>
                  Merging does not force pages to a common size. If you combine an A4 report with a
                  Letter-sized invoice and a landscape spreadsheet export, each page keeps its own
                  dimensions, which is usually what you want on screen but can look inconsistent when
                  printed.
                </p>
                <p>
                  If the merged file is going to a printer, normalise it first with{" "}
                  <Link href="/resize" className="text-[var(--accent)] hover:underline">Resize PDF</Link>,
                  and fix any sideways scans using{" "}
                  <Link href="/rotate" className="text-[var(--accent)] hover:underline">Rotate</Link>{" "}
                  before merging rather than after, since it is easier to spot the problem in a single
                  short document than in a hundred-page combined one.
                </p>
              </>
            ),
          },
          {
            heading: "What happens to forms, signatures and bookmarks",
            body: (
              <>
                <p>
                  Interactive form fields can conflict when two documents use the same field names,
                  and the merged result may behave unpredictably. If the forms are already filled in
                  and you only need the values to appear, run{" "}
                  <Link href="/flatten-pdf" className="text-[var(--accent)] hover:underline">Flatten PDF</Link>{" "}
                  on each file first — that converts the entries to fixed page content and removes the
                  conflict entirely.
                </p>
                <p>
                  Note that a cryptographic digital signature covers the exact bytes of the document it
                  signed. Merging produces a new file, so that signature will no longer validate. A
                  drawn or image-based signature is just page content and is unaffected. If a signed
                  document must stay verifiable, keep it as a separate attachment rather than merging it.
                </p>
              </>
            ),
          },
          {
            heading: "After merging",
            body: (
              <>
                <p>
                  A combined document is often much larger than any of its parts, which can push it over
                  an email or portal limit — run{" "}
                  <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>{" "}
                  if so. For a long assembled pack,{" "}
                  <Link href="/add-page-numbers" className="text-[var(--accent)] hover:underline">page numbers</Link>{" "}
                  make it navigable, and{" "}
                  <Link href="/organize" className="text-[var(--accent)] hover:underline">Organize pages</Link>{" "}
                  lets you make final adjustments without starting over.
                </p>
                <p>
                  Changed your mind about the order, or need to pull one section back out?{" "}
                  <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>{" "}
                  reverses the process by page range.
                </p>
              </>
            ),
          },
        ]}
      />

      <RelatedContent slug="merge" />

      <UseCaseLinks toolSlug="merge" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
