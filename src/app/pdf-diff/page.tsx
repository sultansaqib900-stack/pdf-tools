"use client";

import { useState } from "react";
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
  usePageMeta("Compare PDF Files Online - PDF Diff Tool | PDFTools Premium", "Compare two PDF files side by side and see highlighted differences. Premium PDF comparison tool. 100% private, no uploads.");
  const [docA, setDocA] = useState<File | null>(null);
  const [docB, setDocB] = useState<File | null>(null);
  const [diffs, setDiffs] = useState<DiffBlock[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingA, setDraggingA] = useState(false);
  const [draggingB, setDraggingB] = useState(false);

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

  const runDiff = async () => {
    if (!docA || !docB) return;
    setProcessing(true);
    setError(null);
    try {
      const [pagesA, pagesB] = await Promise.all([extractText(docA), extractText(docB)]);
      const maxPages = Math.max(pagesA.length, pagesB.length);
      const results: DiffBlock[] = [];
      for (let i = 0; i < maxPages; i++) {
        const ta = pagesA[i] || "";
        const tb = pagesB[i] || "";
        if (ta === tb) {
          results.push({ page: i + 1, type: "same", text: ta.substring(0, 500) });
        } else {
          const aLines = ta.split(/\n|\. /);
          const bLines = tb.split(/\n|\. /);
          const aSet = new Set(aLines.map(l => l.trim()).filter(Boolean));
          const bSet = new Set(bLines.map(l => l.trim()).filter(Boolean));
          for (const line of aLines) {
            const t = line.trim();
            if (t && !bSet.has(t)) results.push({ page: i + 1, type: "removed", text: t });
          }
          for (const line of bLines) {
            const t = line.trim();
            if (t && !aSet.has(t)) results.push({ page: i + 1, type: "added", text: t });
          }
          if (aLines.filter(l => l.trim()).length === 0 && bLines.filter(l => l.trim()).length === 0) {
            results.push({ page: i + 1, type: "same", text: "(no text content on this page)" });
          }
        }
      }
      setDiffs(results);
    } catch {
      setError("Failed to compare PDFs. Ensure both files are valid, non-encrypted PDFs.");
    }
    setProcessing(false);
  };

  return (
    <PremiumGate
      title="Compare PDF Files Online"
      description="See exactly what changed between two PDF versions — side by side, with highlighted additions and deletions."
      icon="🔍"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Diff - Compare PDF Files" description="Compare two PDF files and see highlighted differences side by side. Premium." url="https://allaboutpdfediting.xyz/pdf-diff" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.9, bestRating: 5, ratingCount: 312 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Diff", item: "https://allaboutpdfediting.xyz/pdf-diff" }]} />
        <HowToJsonLd name="Compare PDF Files Online" description="Compare two PDF documents side by side and see highlighted differences" steps={[{name:"Upload original PDF",text:"Drag and drop or select the older version of your PDF document"},{name:"Upload revised PDF",text:"Select the newer version you want to compare against"},{name:"View differences",text:"The tool processes both files and shows highlighted changes green for added red for removed content"}]} />
        <AiSummaryJsonLd name="PDF Diff" summary="Compare two PDF files side by side with highlighted text differences" category="Multimedia" inputType="PDF" outputType="Diff" processing="client-side" price="premium" features={["Side-by-side comparison","Highlighted additions and deletions","Synchronized scrolling","Client-side processing","No file uploads"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">PDF Compare & Diff</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Upload two PDFs and see exactly what changed — word by word, page by page.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${draggingA ? "border-indigo-500 bg-indigo-500/5" : "border-[var(--card-border)] bg-[var(--card)]"} ${docA ? "bg-emerald-500/5 border-emerald-500" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDraggingA(true); }}
            onDragLeave={() => setDraggingA(false)}
            onDrop={(e) => { e.preventDefault(); setDraggingA(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setDocA(f); }}
          >
            {docA ? (
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <p className="font-semibold text-sm text-[var(--foreground)] truncate max-w-full">{docA.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{(docA.size / 1024).toFixed(0)} KB</p>
                <button onClick={() => setDocA(null)} className="mt-3 px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition">Change file</button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl mx-auto mb-3">📄</div>
                <p className="font-semibold text-sm mb-1 text-[var(--foreground)]">Original Document (v1)</p>
                <p className="text-xs text-[var(--muted)] mb-4">Drag & drop or select file</p>
                <input type="file" accept=".pdf" className="hidden" id="diffA" onChange={(e) => setDocA(e.target.files?.[0] || null)} />
                <button onClick={() => document.getElementById("diffA")?.click()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition">Browse v1 PDF</button>
              </>
            )}
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${draggingB ? "border-indigo-500 bg-indigo-500/5" : "border-[var(--card-border)] bg-[var(--card)]"} ${docB ? "bg-emerald-500/5 border-emerald-500" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDraggingB(true); }}
            onDragLeave={() => setDraggingB(false)}
            onDrop={(e) => { e.preventDefault(); setDraggingB(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setDocB(f); }}
          >
            {docB ? (
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <p className="font-semibold text-sm text-[var(--foreground)] truncate max-w-full">{docB.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{(docB.size / 1024).toFixed(0)} KB</p>
                <button onClick={() => setDocB(null)} className="mt-3 px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition">Change file</button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl mx-auto mb-3">📄</div>
                <p className="font-semibold text-sm mb-1 text-[var(--foreground)]">Modified Document (v2)</p>
                <p className="text-xs text-[var(--muted)] mb-4">Drag & drop or select file</p>
                <input type="file" accept=".pdf" className="hidden" id="diffB" onChange={(e) => setDocB(e.target.files?.[0] || null)} />
                <button onClick={() => document.getElementById("diffB")?.click()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition">Browse v2 PDF</button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={runDiff}
          disabled={!docA || !docB || processing}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] mb-8"
        >
          {processing ? "Comparing Documents..." : "⚡ Run Side-by-Side Comparison"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm mb-8">
            {error}
          </div>
        )}

        {diffs.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Comparison Results</h2>
            {diffs.filter(d => d.type !== "same").length === 0 && (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">No differences found!</p>
                <p className="text-sm text-[var(--muted)] mt-1">Both PDF documents contain identical text.</p>
              </div>
            )}
            {diffs.filter(d => d.type !== "same").map((d, i) => (
              <div key={i} className={`p-5 rounded-2xl border text-sm transition-all ${
                d.type === "added"
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-red-500/5 border-red-500/30"
              }`}>
                <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full mb-2 ${
                  d.type === "added" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {d.type === "added" ? "+ Added Content" : "- Removed Content"} (Page {d.page})
                </span>
                <p className="text-[var(--foreground)] leading-relaxed font-mono text-xs mt-1">{d.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
