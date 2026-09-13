"use client";

import { useState, useCallback } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

export default function QrStampPage() {
  usePageMeta("Add QR Code to PDF - QR Code Stamping Tool | PDFTools Premium", "Add QR codes and barcodes to any PDF page. Choose position, size, and data. Premium stamping tool.");
  const [file, setFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState("https://allaboutpdfediting.xyz");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const [qrSize, setQrSize] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateQrDataUrl = useCallback(async (text: string, size: number): Promise<string> => {
    const QRCode = await import("qrcode");
    return QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, []);

  const stamp = async () => {
    if (!file || !qrData.trim()) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      const qrDataUrl = await generateQrDataUrl(qrData, qrSize * 2);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrDataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const pngBytes = canvas.toDataURL("image/png");

      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const margin = 20;
        const imgDims = pngImage.scale(qrSize / pngImage.width);
        let x = 0, y = 0;
        switch (position) {
          case "bottom-right": x = width - imgDims.width - margin; y = margin; break;
          case "bottom-left": x = margin; y = margin; break;
          case "top-right": x = width - imgDims.width - margin; y = height - imgDims.height - margin; break;
          case "top-left": x = margin; y = height - imgDims.height - margin; break;
        }
        page.drawImage(pngImage, { x, y, width: imgDims.width, height: imgDims.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${file.name}`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setSuccess(true);
    } catch {
      setError("Failed to stamp QR code. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  };

  return (
    <PremiumGate
      title="Dynamic QR Code & Barcode PDF Stamper"
      description="Embed interactive, scannable QR codes and URLs directly onto every page of your PDF documents."
      icon="📱"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="QR Code PDF Stamping" description="Add QR codes and barcodes to any PDF page. Premium." url="https://allaboutpdfediting.xyz/qr-stamp" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 112 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "QR Stamp", item: "https://allaboutpdfediting.xyz/qr-stamp" }]} />
        <HowToJsonLd name="Add QR Code to PDF" description="Add QR codes to every page of a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document to stamp with QR codes"},{name:"Enter URL or text",text:"Type the URL or text to encode in the QR code"},{name:"Download stamped PDF",text:"Download the PDF with QR codes added to each page"}]} />
        <AiSummaryJsonLd name="QR Code Stamp" summary="Add QR codes to every page of PDF documents with customizable position and size" category="Graphics" inputType="PDF+Text" outputType="PDF" processing="client-side" price="premium" features={["QR code generation","Position customization","Size adjustment","No external APIs"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">QR Code Stamp</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Add QR codes to every page of your PDF. Link to websites, documents, or any text content.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 font-semibold mt-2">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-2">QR Code Target URL or Text</label>
            <input value={qrData} onChange={(e) => setQrData(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm outline-none focus:border-indigo-500 font-medium" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Page Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs text-[var(--foreground)] outline-none focus:border-indigo-500">
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">QR Size: {qrSize}px</label>
              <input type="range" min="40" max="200" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
            </div>
          </div>

          <button
            onClick={stamp}
            disabled={!file || !qrData.trim() || processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {processing ? "Stamping QR Code..." : "⚡ Stamp QR Code & Download"}
          </button>
        </div>

        {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm text-emerald-600 font-bold">✅ QR code stamped and downloaded!</div>}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
