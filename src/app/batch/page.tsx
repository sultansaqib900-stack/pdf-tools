"use client";

import { useState, useCallback, useEffect } from "react";
import ToolInfo from "@/components/ToolInfo";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import { executePdfRecipe, type PdfRecipe, type RecipeActionConfig } from "@/lib/pdfRecipes";
import { isPdfFile, sanitizeDownloadFilename } from "@/lib/pdfBytes";
import type { PdfCompressionMode } from "@/lib/pdfRaster";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("batch");

type Operation = {
  id: string;
  type: "compress" | "protect" | "rotate" | "watermark";
  file: File | null;
  password?: string;
  rotation?: 90 | 180 | 270;
  text?: string;
  compressionMode?: PdfCompressionMode;
};

const ops: { value: Operation["type"]; label: string }[] = [
  { value: "compress", label: "Compress" },
  { value: "protect", label: "Password Protect" },
  { value: "rotate", label: "Rotate 90°" },
  { value: "watermark", label: "Add Watermark" },
];

export default function BatchPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [results, setResults] = useState<Array<{
    id: string;
    name: string;
    downloadName: string;
    status: "ok" | "error";
    url?: string;
    error?: string;
  }>>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { trackToolVisit("batch"); }, [trackToolVisit]);

  useEffect(() => () => {
    results.forEach((result) => { if (result.url) URL.revokeObjectURL(result.url); });
  }, [results]);

  const addOp = () => {
    const id = crypto.randomUUID();
    setOperations((prev) => [...prev, { id, type: "compress", file: null, compressionMode: "balanced" }]);
  };

  const update = (id: string, patch: Partial<Operation>) =>
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, ...patch } : op)));

  const remove = (id: string) =>
    setOperations((prev) => prev.filter((op) => op.id !== id));

  const handleFileFor = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !isPdfFile(f)) { setError("Please select PDF files only."); return; }
    const check = checkFileSize(f?.size || 0);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    update(id, { file: f });
  };

  const runBatch = useCallback(async () => {
    if (!operations.length || !isPremium()) { setError("Batch processing requires Premium."); return; }
    if (operations.some((operation) => operation.type === "protect" && (operation.password?.length ?? 0) < 4)) {
      setError("Every password-protection operation needs a password of at least 4 characters.");
      return;
    }

    setProcessing(true);
    setSuccess(false);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    setResults([]);
    const output: typeof results = [];

    for (const operation of operations) {
      if (!operation.file) continue;
      const action: RecipeActionConfig = operation.type === "protect"
        ? { type: "protect" }
        : operation.type === "rotate"
          ? { type: "rotate", params: { degrees: operation.rotation ?? 90 } }
          : operation.type === "watermark"
            ? { type: "watermark", params: { text: operation.text?.trim() || "CONFIDENTIAL" } }
            : { type: "compress", params: { mode: operation.compressionMode ?? "balanced" } };
      const recipe: PdfRecipe = {
        id: `batch_${operation.id}`,
        name: `Batch ${operation.type}`,
        badge: "Batch",
        icon: "⚡",
        category: "Custom",
        actions: [action],
        description: "Single batch operation",
      };

      try {
        const pdfBytes = await executePdfRecipe(
          await operation.file.arrayBuffer(),
          recipe,
          undefined,
          { password: operation.password },
        );
        const downloadName = sanitizeDownloadFilename(`${operation.type}-${operation.file.name}`);
        const blob = new Blob([pdfBytes.slice() as unknown as BlobPart], { type: "application/pdf" });
        output.push({
          id: operation.id,
          name: operation.file.name,
          downloadName,
          status: "ok",
          url: URL.createObjectURL(blob),
        });
        trackExport(operation.file.name, "Batch Tool", pdfBytes.length);
      } catch (batchError) {
        output.push({
          id: operation.id,
          name: operation.file.name,
          downloadName: operation.file.name,
          status: "error",
          error: batchError instanceof Error ? batchError.message : "Processing failed",
        });
      }
    }

    setResults(output);
    setSuccess(output.some((result) => result.status === "ok"));
    if (output.some((result) => result.status === "error")) {
      setError("Some files could not be processed. Review the results below.");
    }
    setProcessing(false);
  }, [operations, results, trackExport, upsell, usage]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Batch Process PDF - Premium Tool"
        description="Process multiple PDF files at once. Batch compress merge convert PDFs. Premium feature."
        url="https://allaboutpdfediting.xyz/batch"
      />
      <HowToJsonLd name="Batch Process PDF Files" description="Queue multiple PDF operations and process them in one run" steps={[{name:"Add jobs",text:"Add a row and select a PDF for each job"},{name:"Choose operations",text:"Configure compression, protection, rotation, or watermarking"},{name:"Download results",text:"Download each successful PDF from the result list"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Batch Process", item: "https://allaboutpdfediting.xyz/batch" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Batch Process" summary="Queue multiple PDFs and apply a configured operation to each in one run" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Multi-file job queue","Real AES-256 protection","Compression modes","Rotation","Watermarking","Per-file results"]} limits="Premium subscribers; browser file-size limits apply" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Batch Process PDF</h1>
        <p className="text-[var(--muted)]">Process multiple PDFs at once — compress, protect, rotate, or watermark. <span className="text-indigo-500 font-semibold">Premium feature</span>.</p>
      </div>

      <ToolInfo name="Batch Processing" description="Apply operations to multiple PDFs in one go. Each file is processed locally in your browser and downloaded individually. No uploads, no servers." />


      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        {operations.map((op, i) => (
          <div key={op.id} className={`flex flex-wrap items-end gap-4 p-4 rounded-lg border border-[var(--card-border)] mb-4 ${i > 0 ? "mt-4" : ""}`}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Operation</label>
              <select value={op.type} onChange={(e) => update(op.id, { type: e.target.value as Operation["type"] })} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500">
                {ops.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">PDF File</label>
              <input type="file" accept="application/pdf,.pdf" onChange={handleFileFor(op.id)} className="w-full text-sm text-[var(--foreground)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium" />
            </div>
            {op.type === "compress" && (
              <div className="w-full">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Compression</label>
                <select value={op.compressionMode ?? "balanced"} onChange={(e) => update(op.id, { compressionMode: e.target.value as PdfCompressionMode })} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500">
                  <option value="balanced">Balanced (flattens pages)</option><option value="maximum">Maximum (flattens pages)</option><option value="lossless">Lossless (preserves text and forms)</option>
                </select>
              </div>
            )}
            {op.type === "protect" && (
              <div className="w-full">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">AES-256 Output Password</label>
                <input type="password" autoComplete="new-password" value={op.password ?? ""} onChange={(e) => update(op.id, { password: e.target.value })} placeholder="At least 4 characters" className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500" />
              </div>
            )}
            {op.type === "rotate" && (
              <div className="w-full">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Rotation</label>
                <select value={op.rotation ?? 90} onChange={(e) => update(op.id, { rotation: Number(e.target.value) as 90 | 180 | 270 })} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500">
                  <option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option>
                </select>
              </div>
            )}
            {op.type === "watermark" && (
              <div className="w-full">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Watermark Text</label>
                <input value={op.text ?? ""} onChange={(e) => update(op.id, { text: e.target.value })} placeholder="CONFIDENTIAL" className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500" />
              </div>
            )}
            <button onClick={() => remove(op.id)} aria-label={`Remove operation ${i + 1}`} className="shrink-0 text-red-500 hover:text-red-700 text-lg mb-1">&times;</button>
          </div>
        ))}

        <button onClick={addOp} className="w-full py-2.5 border-2 border-dashed border-[var(--card-border)] rounded-xl text-[var(--muted)] hover:text-indigo-500 hover:border-indigo-500 transition text-sm font-medium">
          + Add Operation
        </button>

        <ProgressBar processing={processing} label="Processing batch..." />

        {!isPremium() && (
          <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
            <p className="text-amber-800 dark:text-amber-300 font-semibold mb-2">Premium Feature</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">Batch processing requires a Premium plan.</p>
            <a href="/premium" className="mt-3 inline-block px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Upgrade Now</a>
          </div>
        )}

        {isPremium() && operations.length > 0 && (
          <button
            onClick={runBatch}
            disabled={processing || operations.some((op) => !op.file)}
            className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Processing {operations.length} file(s)...
              </span>
            ) : `Process ${operations.length} File(s)`}
          </button>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-5 rounded-xl border border-[var(--card-border)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Results</h3>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg ${r.status === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  <span className="text-sm"><span className="mr-2">{r.status === "ok" ? "✓" : "✗"}</span>{r.name}{r.error ? ` — ${r.error}` : ""}</span>
                  {r.url && <a href={r.url} download={r.downloadName} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center">Download</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runBatch} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Batch processing complete!" />
      </div>


      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Batch Processing</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Process multiple PDFs at once with our Batch Processing tool. Select the operation for each file — compress, password protect, rotate, or add a watermark — and run them all simultaneously.</p>
          <p>This is a Premium feature for power users who work with multiple PDFs regularly. Each file is processed independently and downloaded automatically once ready.</p>
          <p>Keywords: batch process PDF files, bulk PDF processing online, process multiple PDFs at once.</p>
        </div>
      </div>

      <RelatedContent slug="batch" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
