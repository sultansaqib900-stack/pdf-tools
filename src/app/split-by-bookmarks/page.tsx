"use client";

import { useEffect, useRef, useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { copyPdfBytes, isPdfFile } from "@/lib/pdfBytes";

export default function SplitByBookmarksPage() {
  usePageMeta("Split PDF by Bookmarks - Extract Chapters | PDFTools Premium", "Split PDF documents into separate files based on bookmarks and outline structure. Extract chapters, sections, and parts automatically. Premium feature.");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [splits, setSplits] = useState<{ name: string; pageStart: number; pageEnd: number }[]>([]);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    downloadUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [downloadUrls]);

  async function handleFile(f: File) {
    if (!isPdfFile(f)) {
      setError("Please select a valid PDF file.");
      return;
    }
    setFile(f);
    setError(null);
    setSplits([]);
    setDownloadUrls([]);
    setProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const bytes = new Uint8Array(await f.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({ data: copyPdfBytes(bytes) });
      const pdf = await loadingTask.promise;
      type OutlineItem = { title: string; dest: string | unknown[] | null; items: OutlineItem[] };
      let outline: OutlineItem[] | null;
      const bookmarks: { title: string; page: number }[] = [];
      try {
        outline = await pdf.getOutline();
        if (!outline || outline.length === 0) {
          throw new Error("No bookmarks found in this PDF. The document must have an outline/bookmark structure.");
        }

        async function walk(items: typeof outline) {
          if (!items) return;
          for (const item of items) {
            if (item.dest) {
              try {
                const destination = typeof item.dest === "string"
                  ? await pdf.getDestination(item.dest)
                  : item.dest;
                if (destination?.[0]) {
                  const pageIndex = await pdf.getPageIndex(destination[0]);
                  bookmarks.push({ title: item.title || `Chapter ${bookmarks.length + 1}`, page: pageIndex + 1 });
                }
              } catch {
                // Keep resolving the remaining bookmark destinations.
              }
            }
            if (item.items?.length) await walk(item.items);
          }
        }
        await walk(outline);
      } finally {
        await loadingTask.destroy();
      }

      if (bookmarks.length === 0) {
        throw new Error("Bookmarks were found, but none pointed to a page in this PDF.");
      }

      // Nested outlines may repeat a destination. Sort by page and keep one
      // chapter boundary per page so ranges never overlap or run backwards.
      bookmarks.sort((a, b) => a.page - b.page);
      const boundaries = bookmarks.filter((bookmark, index, list) => index === 0 || bookmark.page !== list[index - 1].page);
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(copyPdfBytes(bytes));
      const parts: { name: string; pageStart: number; pageEnd: number }[] = [];
      if (boundaries[0].page > 1) {
        parts.push({ name: "Front matter", pageStart: 1, pageEnd: boundaries[0].page - 1 });
      }
      for (let index = 0; index < boundaries.length; index += 1) {
        const start = boundaries[index].page;
        const end = index + 1 < boundaries.length ? boundaries[index + 1].page - 1 : srcDoc.getPageCount();
        if (start <= end && start <= srcDoc.getPageCount()) {
          parts.push({
            name: boundaries[index].title.replace(/[<>:"/\\|?*]/g, "_").slice(0, 80) || `Chapter ${index + 1}`,
            pageStart: start,
            pageEnd: Math.min(end, srcDoc.getPageCount()),
          });
        }
      }
      setSplits(parts);
      const urls: string[] = [];
      for (const part of parts) {
        const newDoc = await PDFDocument.create();
        const indices = [];
        for (let i = part.pageStart; i <= part.pageEnd; i++) indices.push(i - 1);
        const copied = await newDoc.copyPages(srcDoc, indices);
        for (const p of copied) newDoc.addPage(p);
        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        urls.push(URL.createObjectURL(blob));
      }
      setDownloadUrls(urls);
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : "Failed to process PDF. Try a different file.");
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) void handleFile(f);
  }

  return (
    <PremiumGate
      title="Split PDF by Bookmarks & Outlines"
      description="Automatically detect chapter outlines and split your document into separate PDF files named by each bookmark."
      icon="📑"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <BreadcrumbJsonLd items={[{ name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Split by Bookmarks", item: "https://allaboutpdfediting.xyz/split-by-bookmarks" }]} />
        <HowToJsonLd name="Split PDF by Bookmarks" description="Split PDF documents into separate files based on bookmark structure" steps={[{name:"Upload PDF with bookmarks",text:"Upload a PDF that contains bookmarks or an outline structure"},{name:"Review detected bookmarks",text:"The tool shows all found bookmarks with their page numbers"},{name:"Download chapter files",text:"Each bookmark becomes a separate PDF file named after the bookmark title"}]} />
        <AiSummaryJsonLd name="Split by Bookmarks" summary="Split PDF files into separate documents by extracting chapters and sections from the bookmark outline" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Bookmark-based splitting","Chapter extraction","Outline parsing","Auto-naming","Client-side processing"]} limits="Premium subscribers" />
        <SoftwareAppJsonLd name="Split PDF by Bookmarks" description="Split PDF files into separate documents based on bookmark/outline structure." url="https://allaboutpdfediting.xyz/split-by-bookmarks" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 156 }} />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Split PDF by Bookmarks</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Extract chapters and sections based on the PDF&apos;s bookmark outline.</p>
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-xl"}`}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-4">📑</div>
            <p className="font-bold text-lg text-[var(--foreground)] mb-1">Drop a bookmarked PDF here or click to browse</p>
            <p className="text-sm text-[var(--muted)]">Extracts each chapter into its own named file</p>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : processing ? (
          <div className="text-center py-16 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-base font-bold text-[var(--foreground)]">Reading bookmarks & extracting chapters...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl p-8">
            <p className="text-red-500 font-semibold mb-4">{error}</p>
            <button onClick={() => { setFile(null); setError(null); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition">Try Another File</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-[var(--foreground)] font-bold mb-4">
                Found {splits.length} Chapter Bookmark(s) in &ldquo;{file?.name}&rdquo;:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {splits.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-[var(--background)] rounded-xl px-4 py-3 border border-[var(--card-border)]">
                    <span className="text-[var(--foreground)] font-semibold truncate mr-4">{s.name}</span>
                    <span className="text-indigo-500 font-mono font-bold shrink-0">Pages {s.pageStart}–{s.pageEnd}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {downloadUrls.map((url, i) => (
                <a key={i} href={url} download={`${splits[i]?.name || `chapter-${i + 1}`}.pdf`} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold hover:opacity-95 transition shadow-md shadow-amber-500/20">
                  ⬇ Download: {splits[i]?.name?.slice(0, 25) || `Part ${i + 1}`}
                </a>
              ))}
            </div>
            <button onClick={() => { setFile(null); setSplits([]); setDownloadUrls([]); }} className="text-xs text-indigo-500 hover:underline font-semibold block">← Split another PDF</button>
          </div>
        )}
      </div>
    </PremiumGate>
  );
}
