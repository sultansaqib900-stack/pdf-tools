"use client";

import { useState, useRef, useEffect } from "react";
import { checkFileSize } from "@/lib/premium";
import { isPdfFile, loadPdfForEditing, downloadBytes, formatPdfErrorMessage, validatePdfOutput } from "@/lib/pdfBytes";
import { useUsage } from "@/hooks/useUsage";
import { usePremiumUpsell } from "@/components/PremiumUpsell";
import { registerAdTask } from "@/lib/ads";
import TrialGate from "@/components/TrialGate";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BatesNumberingPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [prefix, setPrefix] = useState("CONFIDENTIAL-");
  const [suffix, setSuffix] = useState("");
  const [startNum, setStartNum] = useState(1);
  const [digits, setDigits] = useState(6);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center">("bottom-right");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  async function handleProcess() {
    if (!file) return;
    const sizeCheck = checkFileSize(file.size);
    if (!sizeCheck.ok) { setError(sizeCheck.message); return; }
    const reservation = await usage.checkAndTrack();
    if (!reservation) { upsell.showUpsell("trial-limit"); return; }
    setProcessing(true);
    setError(null);
    try {
      const { rgb, StandardFonts } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const srcDoc = await loadPdfForEditing(bytes);
      const font = await srcDoc.embedFont(StandardFonts.Helvetica);
      const total = srcDoc.getPageCount();
      for (let i = 0; i < total; i++) {
        const page = srcDoc.getPage(i);
        const { width, height } = page.getSize();
        const num = (startNum + i).toString().padStart(digits, "0");
        const label = `${prefix}${num}${suffix}`;
        const fontSize = 8;
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        let x = 0;
        let y = 0;
        const margin = 36;
        switch (position) {
          case "bottom-right":
            x = width - textWidth - margin;
            y = margin;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "top-right":
            x = width - textWidth - margin;
            y = height - margin;
            break;
          case "top-left":
            x = margin;
            y = height - margin;
            break;
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = margin;
            break;
        }
        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      }
      const pdfBytes = await srcDoc.save({ useObjectStreams: true });
      const validation = await validatePdfOutput(pdfBytes);
      if (!validation.ok) {
        throw new Error(validation.error || "Generated Bates numbered document is invalid.");
      }

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));
      registerAdTask();
    } catch (err) {
      // Failed processing must not consume the shared trial allowance.
      await usage.releaseReservation(reservation);
      setError(formatPdfErrorMessage(err, "Failed to apply Bates numbering. Try a different file."));
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && isPdfFile(f)) {
      setFile(f);
      setError(null);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }

  const resetFile = () => {
    setFile(null);
    setError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  return (
    <TrialGate
      tool="bates-numbering"
      title="Bates Numbering for PDFs"
      description="Add sequential Bates stamps to your legal and court documents. Processed 100% locally in your browser for complete confidentiality."
      icon="🔢"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Bates Numbering", item: "https://allaboutpdfediting.xyz/bates-numbering" }]} />
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 inline-block">🔢</span>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Bates Numbering</h1>
          <p className="text-[var(--muted)] mt-2">Add sequential legal Bates stamps to every page. Fully private, in-browser processing.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm">
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragging ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "border-[var(--card-border)] hover:border-amber-500/50"
              }`}
            >
              <span className="text-4xl block mb-2">📄</span>
              <p className="font-semibold text-[var(--foreground)] text-sm">Drop a PDF here, or click to browse</p>
              <p className="text-xs text-[var(--muted)] mt-1">Files up to 100MB supported for Premium</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && isPdfFile(f)) {
                    setFile(f);
                    setError(null);
                    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                <span className="text-sm font-semibold text-[var(--foreground)] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={resetFile}
                  className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                >
                  Change file
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Prefix</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. ABC-"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Suffix</label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. -CONF"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Start Number</label>
                  <input
                    type="number"
                    min={1}
                    value={startNum}
                    onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Digits (padding)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={digits}
                    onChange={(e) => setDigits(Math.max(1, Math.min(12, parseInt(e.target.value) || 6)))}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as typeof position)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-xs"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                Preview: <strong>{prefix}{(startNum).toString().padStart(digits, "0")}{suffix}</strong> on page 1
              </div>

              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

              <button
                onClick={handleProcess}
                disabled={processing}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
              >
                {processing ? "Applying Bates numbers..." : "Apply Bates Numbers"}
              </button>

              {downloadUrl && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Bates numbering complete!</p>
                    <p className="text-[11px] text-[var(--muted)]">Ready for download</p>
                  </div>
                  <a
                    href={downloadUrl}
                    download={`bates-${file.name}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TrialGate>
  );
}
