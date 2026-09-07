"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ToolShell from "@/components/ui/ToolShell";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
import ToolInfo from "@/components/ToolInfo";
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

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("image-to-pdf");

export default function ImageToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("image-to-pdf"); }, []);

  const addImages = useCallback((list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const newImages = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const runConvert = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      for (const { file } of images) {
        const imgBytes = await file.arrayBuffer();
        if (!originalBytes.current) { originalBytes.current = imgBytes; }
        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport(images[0]?.file.name || "images.pdf", "Image to PDF", pdfBytes.byteLength);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to convert images to PDF.");
    }
    setProcessing(false);
  }, [images]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
    }, [usage, upsell, runConvert])

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${images[0]?.file.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [images]);

  return (
    <ToolShell icon="image" title={"Image to PDF"} lead={"Convert JPG, PNG, and other images into a single PDF."}>
      <SoftwareAppJsonLd
        name="Image to PDF - Free Online Converter"
        description="Convert images to PDF online for free. Turn JPG, PNG, and other image formats into PDF documents instantly."
        url="https://allaboutpdfediting.xyz/image-to-pdf"
      />
      <HowToJsonLd name="Convert Image to PDF" description="Convert JPG PNG and other images to PDF documents" steps={[{name:"Upload images",text:"Select one or more images JPG PNG BMP WebP"},{name:"Arrange order",text:"Drag to reorder images as needed"},{name:"Download PDF",text:"Download your images combined into a PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Image to PDF", item: "https://allaboutpdfediting.xyz/image-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Image to PDF" summary="Convert images JPG PNG BMP to PDF documents with customizable page layout" category="Graphics" inputType="Image" outputType="PDF" processing="client-side" price="free" features={["Image to PDF conversion","Multi-image support","Page orientation","Free online tool","Client-side only"]} limits="Files up to 10MB" />

      <ToolInfo
        name="Image to PDF"
        description="Your images never leave your device. Conversion happens entirely in your browser — no uploads, no servers. Select images, preview them, and download your PDF in seconds."
      />


      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--surface)] rounded-[var(--r-lg)] border border-[var(--border)] p-8">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-[var(--r-lg)] p-10 text-center transition ${
            dragging ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]" : "border-[var(--border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addImages(e.target.files)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <Icon name="image" size={36} className="text-[var(--muted)]" />
            <span className="text-[var(--accent)] font-medium hover:underline">
              Click to select images or drag & drop
            </span>
            <span className="text-xs text-[var(--muted)]">Supports JPG and PNG</span>
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={images.reduce((s, i) => s + i.file.size, 0)} label="Converting images to PDF..." />

        {images.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--muted)]">{images.length} image{images.length > 1 ? "s" : ""}</span>
              <button onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.preview)); setImages([]); }} className="text-[var(--danger)] hover:text-[var(--danger)] text-xs">Clear all</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-24 object-cover rounded-lg border border-[var(--border)]" />
                  <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--danger)] text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    x
                  </button>
                  <p className="text-[10px] text-[var(--muted)] truncate mt-1">{img.file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={convert}
          disabled={images.length === 0 || processing || showTimer}
          className="mt-6 w-full py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Converting...
            </span>
          ) : `Convert ${images.length} image${images.length !== 1 ? "s" : ""} to PDF`}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{ " " }
            <a href="/premium" className="text-[var(--accent)] font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF created!" onRestore={restoreOriginal} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Image to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert your images to PDF documents with our free image to PDF converter, designed for speed and simplicity. Whether you have JPG photos from your camera, PNG screenshots, or other image formats, you can combine them into a single PDF with just a few clicks. This is great for creating photo albums, digitizing handwritten notes, or converting scanned documents into a portable format that anyone can view. Our JPG to PDF converter works entirely in your browser using pdf-lib, so your images stay private and secure with no server uploads. Simply upload your images, preview them in the gallery, and download your PDF. Each image becomes a separate page preserving its original dimensions and quality — perfect for archiving or sharing.</p>
        </div>
      </div>
      <ToolGuide slug="image-to-pdf" />

      <RelatedContent slug="image-to-pdf" />

      <UseCaseLinks toolSlug="image-to-pdf" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
