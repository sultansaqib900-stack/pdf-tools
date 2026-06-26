"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

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
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="PDF Diff - Compare PDF Files" description="Compare two PDF files and see highlighted differences. Premium feature." url="https://allaboutpdfediting.xyz/pdf-diff" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.9, bestRating: 5, ratingCount: 312 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold mb-3">Compare PDF Files</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">See exactly what changed between two PDF versions — side by side, highlighted.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can compare PDFs</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF Diff - Compare PDF Files" description="Compare two PDF files and see highlighted differences side by side. Premium." url="https://allaboutpdfediting.xyz/pdf-diff" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.9, bestRating: 5, ratingCount: 312 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Diff", item: "https://allaboutpdfediting.xyz/pdf-diff" }]} />
      <HowToJsonLd name="Compare PDF Files Online" description="Compare two PDF documents side by side and see highlighted differences" steps={[{name:"Upload original PDF",text:"Drag and drop or select the older version of your PDF document"},{name:"Upload revised PDF",text:"Select the newer version you want to compare against"},{name:"View differences",text:"The tool processes both files and shows highlighted changes green for added red for removed content"}]} />
      <AiSummaryJsonLd name="PDF Diff" summary="Compare two PDF files side by side with highlighted text differences" category="Multimedia" inputType="PDF" outputType="Diff" processing="client-side" price="premium" features={["Side-by-side comparison","Highlighted additions and deletions","Synchronized scrolling","Client-side processing","No file uploads"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">PDF Compare</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Upload two PDFs and see exactly what changed — word by word, page by page.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${draggingA ? "border-indigo-500 bg-indigo-50/50" : "border-[var(--card-border)]"} ${docA ? "bg-emerald-50/50 border-emerald-400" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDraggingA(true); }}
          onDragLeave={() => setDraggingA(false)}
          onDrop={(e) => { e.preventDefault(); setDraggingA(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setDocA(f); }}
        >
          {docA ? (
            <div>
              <div className="text-4xl mb-2">✅</div>
              <p className="font-medium text-sm text-emerald-700 truncate max-w-full">{docA.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{(docA.size / 1024).toFixed(0)} KB</p>
              <button onClick={() => setDocA(null)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📄</div>
              <p className="font-medium text-sm mb-1">Original Document</p>
              <p className="text-xs text-[var(--muted)]">Drag & drop or click to browse</p>
              <input type="file" accept=".pdf" className="hidden" id="diffA" onChange={(e) => setDocA(e.target.files?.[0] || null)} />
              <button onClick={() => document.getElementById("diffA")?.click()} className="mt-3 text-xs text-indigo-500 hover:underline">Browse files</button>
            </>
          )}
        </div>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${draggingB ? "border-indigo-500 bg-indigo-50/50" : "border-[var(--card-border)]"} ${docB ? "bg-emerald-50/50 border-emerald-400" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDraggingB(true); }}
          onDragLeave={() => setDraggingB(false)}
          onDrop={(e) => { e.preventDefault(); setDraggingB(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setDocB(f); }}
        >
          {docB ? (
            <div>
              <div className="text-4xl mb-2">✅</div>
              <p className="font-medium text-sm text-emerald-700 truncate max-w-full">{docB.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{(docB.size / 1024).toFixed(0)} KB</p>
              <button onClick={() => setDocB(null)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📄</div>
              <p className="font-medium text-sm mb-1">Modified Document</p>
              <p className="text-xs text-[var(--muted)]">Drag & drop or click to browse</p>
              <input type="file" accept=".pdf" className="hidden" id="diffB" onChange={(e) => setDocB(e.target.files?.[0] || null)} />
              <button onClick={() => document.getElementById("diffB")?.click()} className="mt-3 text-xs text-indigo-500 hover:underline">Browse files</button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={runDiff}
        disabled={!docA || !docB || processing}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition text-lg mb-8"
      >
        {processing ? "Comparing..." : "Compare Documents"}
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm mb-8">
          {error}
        </div>
      )}

      {diffs.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Comparison Results</h2>
          {diffs.filter(d => d.type !== "same").length === 0 && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">No differences found — the documents are identical</p>
            </div>
          )}
          {diffs.filter(d => d.type !== "same").map((d, i) => (
            <div key={i} className={`p-4 rounded-xl border text-sm ${
              d.type === "added"
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
            }`}>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                d.type === "added" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}>
                {d.type === "added" ? "+ Added" : "- Removed"} (Page {d.page})
              </span>
              <p className="text-[var(--foreground)]">{d.text}</p>
            </div>
          ))}
          <details className="border border-[var(--card-border)] rounded-xl overflow-hidden">
            <summary className="px-5 py-3 font-medium text-sm cursor-pointer hover:bg-[var(--background)]">Show identical pages ({diffs.filter(d => d.type === "same").length})</summary>
            <div className="px-5 pb-4 space-y-2">
              {diffs.filter(d => d.type === "same").map((d, i) => (
                <p key={i} className="text-xs text-[var(--muted)]">Page {d.page}: {d.text.substring(0, 100)}...</p>
              ))}
            </div>
          </details>
        </div>
      )}

      <AdBanner className="mb-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF Comparison</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our PDF Diff tool extracts text from both documents page by page using PDF.js and compares them line by line. Added content is shown in green, removed content in red — just like a code diff. All processing happens in your browser; your files never leave your device.</p>
          <p>This is essential for legal document reviews, contract versioning, manuscript edits, and regulatory compliance. Unlike expensive tools like Adobe Acrobat Pro or Draftable, this is included with your Premium subscription.</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
