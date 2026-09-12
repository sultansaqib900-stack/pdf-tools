"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

interface DiffBlock {
  page: number;
  type: "same" | "removed" | "added";
  text: string;
}

export default function PdfDiffPage() {
  usePageMeta("Visual Contract & PDF Diff 2.0 | PDFTools Premium", "Compare two PDF files side by side or with an interactive split-screen slider. Highlight additions, deletions, and layout changes.");
  const [docA, setDocA] = useState<File | null>(null);
  const [docB, setDocB] = useState<File | null>(null);
  const [diffs, setDiffs] = useState<DiffBlock[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"slider" | "sideBySide" | "redline">("slider");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100

  // Canvas refs for visual diff
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  const extractText = async (file: File): Promise<string[]> => {
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str ?? "").filter(Boolean).join(" ");
      pages.push(text);
    }
    return pages;
  };

  // Render visual page comparison on canvases
  const renderVisualPage = useCallback(async (pageIdx: number) => {
    if (!docA || !docB) return;
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const [bytesA, bytesB] = await Promise.all([docA.arrayBuffer(), docB.arrayBuffer()]);
      const [pdfA, pdfB] = await Promise.all([
        pdfjsLib.getDocument({ data: bytesA }).promise,
        pdfjsLib.getDocument({ data: bytesB }).promise,
      ]);

      const maxP = Math.max(pdfA.numPages, pdfB.numPages);
      setTotalPages(maxP);

      const targetPageNum = pageIdx + 1;

      // Render Doc A
      if (canvasARef.current && targetPageNum <= pdfA.numPages) {
        const pageA = await pdfA.getPage(targetPageNum);
        const vpA = pageA.getViewport({ scale: 1.2 });
        const cA = canvasARef.current;
        cA.width = vpA.width;
        cA.height = vpA.height;
        const ctxA = cA.getContext("2d")!;
        await pageA.render({ canvas: cA, canvasContext: ctxA, viewport: vpA }).promise;
      }

      // Render Doc B
      if (canvasBRef.current && targetPageNum <= pdfB.numPages) {
        const pageB = await pdfB.getPage(targetPageNum);
        const vpB = pageB.getViewport({ scale: 1.2 });
        const cB = canvasBRef.current;
        cB.width = vpB.width;
        cB.height = vpB.height;
        const ctxB = cB.getContext("2d")!;
        await pageB.render({ canvas: cB, canvasContext: ctxB, viewport: vpB }).promise;
      }

      // Render Split Composite Canvas
      if (compositeCanvasRef.current && canvasARef.current && canvasBRef.current) {
        const comp = compositeCanvasRef.current;
        const cA = canvasARef.current;
        const cB = canvasBRef.current;
        comp.width = Math.max(cA.width, cB.width);
        comp.height = Math.max(cA.height, cB.height);
        const ctx = comp.getContext("2d")!;
        ctx.clearRect(0, 0, comp.width, comp.height);

        // Draw Left half from Doc A
        const splitX = (comp.width * sliderPosition) / 100;
        ctx.drawImage(cA, 0, 0, splitX, comp.height, 0, 0, splitX, comp.height);

        // Draw Right half from Doc B
        ctx.drawImage(cB, splitX, 0, comp.width - splitX, comp.height, splitX, 0, comp.width - splitX, comp.height);

        // Draw vertical divider line
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, comp.height);
        ctx.stroke();
      }
    } catch {}
  }, [docA, docB, sliderPosition]);

  useEffect(() => {
    if (docA && docB && diffs.length > 0) {
      renderVisualPage(currentPage);
    }
  }, [docA, docB, diffs, currentPage, sliderPosition, renderVisualPage]);

  const runDiff = async () => {
    if (!docA || !docB) return;
    setProcessing(true);
    setError(null);
    try {
      const [pagesA, pagesB] = await Promise.all([extractText(docA), extractText(docB)]);
      const maxPages = Math.max(pagesA.length, pagesB.length);
      setTotalPages(maxPages);
      const results: DiffBlock[] = [];

      for (let i = 0; i < maxPages; i++) {
        const ta = pagesA[i] || "";
        const tb = pagesB[i] || "";
        if (ta === tb) {
          results.push({ page: i + 1, type: "same", text: ta.substring(0, 500) });
        } else {
          const aLines = ta.split(/\n|\. /);
          const bLines = tb.split(/\n|\. /);
          const aSet = new Set(aLines.map((l) => l.trim()).filter(Boolean));
          const bSet = new Set(bLines.map((l) => l.trim()).filter(Boolean));
          for (const line of aLines) {
            const t = line.trim();
            if (t && !bSet.has(t)) results.push({ page: i + 1, type: "removed", text: t });
          }
          for (const line of bLines) {
            const t = line.trim();
            if (t && !aSet.has(t)) results.push({ page: i + 1, type: "added", text: t });
          }
        }
      }
      setDiffs(results);
      setCurrentPage(0);
    } catch {
      setError("Failed to compare PDFs. Ensure both files are valid, non-encrypted PDFs.");
    }
    setProcessing(false);
  };

  const addedCount = diffs.filter((d) => d.type === "added").length;
  const removedCount = diffs.filter((d) => d.type === "removed").length;

  return (
    <PremiumGate
      title="Visual Contract & PDF Diff 2.0"
      description="Compare revisions side by side or using the interactive split-screen slider. 100% in-browser comparison without cloud uploads."
      icon="🔍"
    >
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <SoftwareAppJsonLd
          name="Visual PDF Diff - Compare PDF Documents"
          description="Interactive split-screen visual comparison and redline diff engine for PDF files."
          url="https://allaboutpdfediting.xyz/pdf-diff"
        />
        <BreadcrumbJsonLd
          items={[
            { name: "Home", item: "https://allaboutpdfediting.xyz" },
            { name: "PDF Diff", item: "https://allaboutpdfediting.xyz/pdf-diff" },
          ]}
        />
        <HowToJsonLd
          name="Compare Two PDF Documents"
          description="Upload two PDF revisions and visually drag the split slider to spot differences"
          steps={[
            { name: "Upload Original v1", text: "Select original document" },
            { name: "Upload Revised v2", text: "Select revised document" },
            { name: "Visual Diff", text: "Drag slider or review redline changes" },
          ]}
        />
        <AiSummaryJsonLd
          name="Visual PDF Diff"
          summary="Side-by-side and interactive split-slider comparison for contract revisions and documents"
          category="UtilitiesApplication"
          inputType="PDF"
          outputType="Diff"
          processing="client-side"
          price="premium"
          features={["Split-screen slider", "Redline changelog", "Side by side visual canvases", "100% private"]}
          limits="Files up to 50MB"
        />

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Visual Contract Diff 2.0</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">
              Premium 2.0
            </span>
          </div>
          <p className="text-[var(--muted)] text-sm">
            Drag the interactive split-screen slider to reveal shifted paragraphs, signature changes, and clause modifications.
          </p>
        </div>

        {/* Upload Deck */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className={`p-6 rounded-3xl border-2 border-dashed text-center transition-all ${docA ? "border-emerald-500 bg-emerald-500/5" : "border-[var(--card-border)] bg-[var(--card)]"}`}>
            <input type="file" accept=".pdf" id="fileDiffA" className="hidden" onChange={(e) => setDocA(e.target.files?.[0] || null)} />
            <label htmlFor="fileDiffA" className="cursor-pointer flex flex-col items-center gap-2">
              <span className="text-3xl">📄</span>
              <span className="text-sm font-bold text-[var(--foreground)]">
                {docA ? docA.name : "Select Original Document (v1)"}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {docA ? `${(docA.size / 1024).toFixed(0)} KB · Ready` : "Drop older revision here"}
              </span>
            </label>
          </div>

          <div className={`p-6 rounded-3xl border-2 border-dashed text-center transition-all ${docB ? "border-emerald-500 bg-emerald-500/5" : "border-[var(--card-border)] bg-[var(--card)]"}`}>
            <input type="file" accept=".pdf" id="fileDiffB" className="hidden" onChange={(e) => setDocB(e.target.files?.[0] || null)} />
            <label htmlFor="fileDiffB" className="cursor-pointer flex flex-col items-center gap-2">
              <span className="text-3xl">📑</span>
              <span className="text-sm font-bold text-[var(--foreground)]">
                {docB ? docB.name : "Select Revised Document (v2)"}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {docB ? `${(docB.size / 1024).toFixed(0)} KB · Ready` : "Drop newer revision here"}
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={runDiff}
          disabled={!docA || !docB || processing}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-xl shadow-indigo-500/25 active:scale-[0.99]"
        >
          {processing ? "Analyzing Document Revisions..." : "⚡ Run Visual & Redline Comparison"}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Diff Results Deck */}
        {diffs.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn">
            {/* View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  +{addedCount} Additions
                </span>
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                  -{removedCount} Deletions
                </span>
              </div>

              <div className="flex p-1 bg-[var(--background)] rounded-xl border border-[var(--card-border)] gap-1">
                {[
                  { id: "slider" as const, label: "Interactive Slider 🎚️" },
                  { id: "sideBySide" as const, label: "Side-by-Side 📑" },
                  { id: "redline" as const, label: "Redline Text ✍️" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveView(mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeView === mode.id
                        ? "bg-indigo-600 text-white shadow"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--foreground)]">
                Viewing Page {currentPage + 1} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] font-bold disabled:opacity-30"
                >
                  ← Prev Page
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] font-bold disabled:opacity-30"
                >
                  Next Page →
                </button>
              </div>
            </div>

            {/* Mode 1: Split Slider */}
            {activeView === "slider" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                    <span className="text-indigo-400 font-mono">◀ Original (v1) [{sliderPosition}%]</span>
                    <span className="text-purple-400 font-mono">[{100 - sliderPosition}%] Revised (v2) ▶</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-[var(--background)] rounded-lg cursor-ew-resize"
                  />
                </div>

                <div className="bg-slate-900/70 rounded-2xl p-4 flex items-center justify-center min-h-[450px] overflow-auto border border-[var(--card-border)]">
                  <canvas ref={compositeCanvasRef} className="rounded-lg shadow-2xl max-w-full h-auto bg-white" />
                </div>
              </div>
            )}

            {/* Mode 2: Side-by-Side */}
            {activeView === "sideBySide" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-indigo-400">Original Document (v1)</p>
                  <div className="bg-slate-900/60 rounded-2xl p-2 flex items-center justify-center min-h-[350px] border border-[var(--card-border)]">
                    <canvas ref={canvasARef} className="rounded max-w-full h-auto bg-white" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-purple-400">Revised Document (v2)</p>
                  <div className="bg-slate-900/60 rounded-2xl p-2 flex items-center justify-center min-h-[350px] border border-[var(--card-border)]">
                    <canvas ref={canvasBRef} className="rounded max-w-full h-auto bg-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Redline Text Changelog */}
            {activeView === "redline" && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {diffs
                  .filter((d) => d.type !== "same")
                  .map((d, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl border text-xs font-mono leading-relaxed ${
                        d.type === "added"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-red-500/10 border-red-500/30 text-red-300 line-through"
                      }`}
                    >
                      <span className="font-bold uppercase text-[10px] block mb-1 font-sans">
                        {d.type === "added" ? "+ Added (Page " : "- Deleted (Page "}
                        {d.page})
                      </span>
                      {d.text}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
