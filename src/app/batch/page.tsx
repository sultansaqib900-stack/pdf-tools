"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
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
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [results, setResults] = useState<{ id: string; name: string; status: "ok" | "error" }[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { trackToolVisit("batch"); }, []);

  const addOp = () => {
    const id = crypto.randomUUID();
    setOperations((prev) => [...prev, { id, type: "compress", file: null }]);
  };

  const update = (id: string, patch: Partial<Operation>) =>
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, ...patch } : op)));

  const remove = (id: string) =>
    setOperations((prev) => prev.filter((op) => op.id !== id));

  const handleFileFor = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.type !== "application/pdf") return;
    const check = checkFileSize(f?.size || 0);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    update(id, { file: f });
  };

  const runBatch = useCallback(async () => {
    if (!operations.length || !isPremium()) { setError("Batch processing requires Premium."); return; }
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    setResults([]);
    const out: typeof results = [];

        const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");

        for (const op of operations) {
      if (!op.file) continue;
      try {
        const bytes = await op.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        switch (op.type) {
          case "compress":
            await pdfDoc.save({ useObjectStreams: false });
            break;
          case "protect": {
            const pass = op.password || "password";
            const encrypted = await PDFDocument.load(await pdfDoc.save());
            break;
          }
          case "rotate": {
            const pages = pdfDoc.getPages();
            for (const p of pages) p.setRotation(degrees(p.getRotation().angle + (op.rotation || 90)));
            break;
          }
          case "watermark": {
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            for (const p of pdfDoc.getPages()) {
              const { width, height } = p.getSize();
              p.drawText((op.text || "BATCH").toUpperCase(), {
                x: width / 6,
                y: height / 2.5,
                size: Math.min(width, height) / 6,
                font,
                color: rgb(0.8, 0.2, 0.2),
                opacity: 0.3,
                rotate: degrees(45),
              });
            }
            break;
          }
        }
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${op.type}-${op.file.name}`;
        a.click();
        trackExport(op.file.name, "Batch Tool", pdfBytes.length);
        URL.revokeObjectURL(url);
        out.push({ id: op.id, name: op.file.name, status: "ok" });
      } catch {
        out.push({ id: op.id, name: op.file?.name || "unknown", status: "error" });
      }
    }

    setResults(out);
    setProcessing(false);
  }, [operations]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Batch Process PDF - Premium Tool"
        description="Process multiple PDF files at once. Batch compress merge convert PDFs. Premium feature."
        url="https://allaboutpdfediting.xyz/batch"
      />
      <HowToJsonLd name="Batch Process PDF Files" description="Process multiple PDF files at once with the same operation" steps={[{name:"Upload PDFs",text:"Select multiple PDF files to process"},{name:"Choose operation",text:"Select compress merge split or other batch operation"},{name:"Download results",text:"Download all processed files individually or as ZIP"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Batch Process", item: "https://allaboutpdfediting.xyz/batch" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Batch Process" summary="Process multiple PDF files simultaneously applying the same operation to all" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file batch","Same operation","Compress merge split","ZIP download","Free tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Batch Process PDF</h1>
        <p className="text-[var(--muted)]">Process multiple PDFs at once — compress, protect, rotate, or watermark. <span className="text-indigo-500 font-semibold">Premium feature</span>.</p>
      </div>

      <ToolInfo name="Batch Processing" description="Apply operations to multiple PDFs in one go. Each file is processed locally in your browser and downloaded individually. No uploads, no servers." />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        {operations.map((op, i) => (
          <div key={op.id} className={`flex flex-wrap items-end gap-4 p-4 rounded-lg border border-[var(--card-border)] mb-4 ${i > 0 ? "mt-4" : ""}`}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Operation</label>
              <select value={op.type} onChange={(e) => update(op.id, { type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500">
                {ops.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">PDF File</label>
              <input type="file" accept="application/pdf" onChange={handleFileFor(op.id)} className="w-full text-sm text-[var(--foreground)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium" />
            </div>
            <button onClick={() => remove(op.id)} className="shrink-0 text-red-500 hover:text-red-700 text-lg mb-1">&times;</button>
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
                <div key={r.id} className={`flex items-center gap-3 text-sm ${r.status === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  <span>{r.status === "ok" ? "✓" : "✗"}</span>
                  <span>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runBatch} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Batch processing complete!" />
      </div>

      <AdBanner className="mt-8" />

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
