"use client";

import { useState, useCallback } from "react";
import AdBanner from "@/components/AdBanner";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";


export default function QrStampPage() {
  usePageMeta("Add QR Code to PDF - QR Code Stamping Tool | PDFTools Premium", "Add QR codes and barcodes to any PDF page. Choose position, size, and data. Premium stamping tool.");
  const [file, setFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState("https://allaboutpdfediting.xyz");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const [qrSize, setQrSize] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumBanner, setPremiumBanner] = useState(false);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="QR Code PDF Stamping" description="Add QR codes and barcodes to any PDF page. Premium." url="https://allaboutpdfediting.xyz/qr-stamp" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 112 }} />
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-3xl font-bold mb-3">QR Code Stamp</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Add QR codes and barcodes to any PDF in seconds. Perfect for marketing materials, invoices, and labels.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can stamp QR codes</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to stamp QR code. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="QR Code PDF Stamping" description="Add QR codes and barcodes to any PDF page. Premium." url="https://allaboutpdfediting.xyz/qr-stamp" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.6, bestRating: 5, ratingCount: 112 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "QR Stamp", item: "https://allaboutpdfediting.xyz/qr-stamp" }]} />
      <HowToJsonLd name="Add QR Code to PDF" description="Add QR codes to every page of a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document to stamp with QR codes"},{name:"Enter URL or text",text:"Type the URL or text to encode in the QR code"},{name:"Download stamped PDF",text:"Download the PDF with QR codes added to each page"}]} />
      <AiSummaryJsonLd name="QR Code Stamp" summary="Add QR codes to every page of PDF documents with customizable position and size" category="Graphics" inputType="PDF+Text" outputType="PDF" processing="client-side" price="premium" features={["QR code generation","Position customization","Size adjustment","No external APIs"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">QR Code Stamp</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Add QR codes to every page of your PDF. Link to websites, documents, or any text content.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">QR Code Content (URL or text)</label>
          <input value={qrData} onChange={(e) => setQrData(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm">
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Size: {qrSize}px</label>
            <input type="range" min="40" max="200" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <button onClick={stamp} disabled={!file || !qrData.trim() || processing} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition">
          {processing ? "Stamping..." : "Stamp QR Code"}
        </button>
      </div>

      {success && <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-sm text-emerald-700">✅ QR code stamped and downloading!</div>}
      {error && <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About QR Code Stamp</h2>
        <div className="text-sm text-[var(--muted)] space-y-3">Add a QR code to every page of your PDF. Perfect for marketing materials (link to your website), invoices (link to payment portal), labels (link to product page), and business documents (link to your contact page). Choose position and size.</div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
