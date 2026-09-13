"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";
import { canvasToImageBytes } from "@/lib/imageBytes";
import { copyPdfBytes, downloadBytes, isPdfFile } from "@/lib/pdfBytes";
import { locateSignatureOnPdfPage } from "@/lib/pdfSignature";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("sign");

export default function SignPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackToolVisit("sign");
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
        setFile(f);
      }
    })();
  }, [trackToolVisit]);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / Math.max(rect.width, 1)),
      y: (event.clientY - rect.top) * (canvas.height / Math.max(rect.height, 1)),
    };
  };

  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const pos = getPos(event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    // A tap should produce a visible mark and count as ink too.
    ctx.lineTo(pos.x + 0.01, pos.y + 0.01);
    ctx.stroke();
    setHasSignature(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pos = getPos(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = false;
    setHasSignature(false);
  };

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!isPdfFile(f)) {
      setError("Please select a valid PDF file.");
      return;
    }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, [upsell]);

  const runSign = useCallback(async () => {
    if (!file) return;
    if (!hasSignature) {
      setError("Draw a signature before stamping the PDF.");
      return;
    }
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("The signature pad is unavailable.");
      const sigBytes = await canvasToImageBytes(canvas, "image/png");

      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      originalBytes.current = copyPdfBytes(pdfBytes).buffer as ArrayBuffer;
      const { PDFDocument, degrees } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(copyPdfBytes(pdfBytes));
      const pages = pdfDoc.getPages();
      if (pages.length === 0) throw new Error("This PDF has no pages.");
      const lastPageIndex = pages.length - 1;
      const placement = await locateSignatureOnPdfPage(
        pdfBytes,
        lastPageIndex,
        50,
        85,
        150,
        50,
      );
      const sigImage = await pdfDoc.embedPng(sigBytes);
      pages[lastPageIndex].drawImage(sigImage, {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        rotate: degrees(placement.rotation),
      });

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      setResultBytes(outBytes);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(new Blob([outBytes.slice()], { type: "application/pdf" }));
      setDownloadUrl(url);
      downloadBytes(outBytes, `signed-${file.name}`);
      trackExport(file.name, "Sign PDF", outBytes.byteLength);
      setSuccess(true);
      setError(null);
    } catch (signError) {
      setError(signError instanceof Error ? signError.message : "Failed to add signature.");
    }
    setProcessing(false);
  }, [file, hasSignature, usage, upsell, trackExport, downloadUrl]);

  const sign = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSign();
  }, [usage, upsell, runSign]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restored.pdf"}`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Sign PDF - Free Online e-Sign Tool"
        description="Sign PDF documents online for free. Draw your signature and add it to any PDF in your browser."
        url="https://allaboutpdfediting.xyz/sign"
      />
      <HowToJsonLd name="Sign PDF Online" description="Draw and stamp a signature at the bottom of the last PDF page" steps={[{name:"Draw signature",text:"Draw your signature with a mouse or touchscreen"},{name:"Upload PDF",text:"Select the PDF document to stamp"},{name:"Stamp and download",text:"Add the signature at the bottom center of the last page and download"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Sign PDF", item: "https://allaboutpdfediting.xyz/sign" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Sign PDF" summary="Draw a signature and stamp it at the bottom center of the PDF's last page" category="BusinessApplications" inputType="PDF plus drawn signature" outputType="PDF" processing="client-side" price="free" features={["Mouse drawing","Touchscreen drawing","Transparent PNG stamp","Last-page placement","Client-side processing"]} limits="Files up to 10MB" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">e-Sign PDF</h1>
        <p className="text-[var(--muted)]">Draw your signature and stamp it at the bottom center of the last page.</p>
      </div>

      <ToolInfo
        name="e-Sign PDF"
        description="Your files stay private. Drawing and signing happens entirely in your browser — no uploads, no servers. Draw your signature, select a PDF, and download the signed document."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Draw your signature</label>
          <div className="border border-[var(--card-border)] rounded-2xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              className="w-full h-auto cursor-crosshair touch-none block"
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={stopDraw}
              onPointerCancel={stopDraw}
            />
          </div>
          <button onClick={clearCanvas} className="mt-2 text-xs text-red-500 hover:text-red-600 font-bold">
            Clear signature
          </button>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
            <span className="text-4xl">📄</span>
            <span className="text-indigo-500 font-bold text-sm hover:underline">
              {file ? file.name : "Click to select a PDF"}
            </span>
            {file && <span className="text-xs text-emerald-600 font-semibold">✓ Ready to stamp signature on last page</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Supports any PDF up to 10MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Signing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSign(); }} />}

        {file && (
          <>
            <button
              onClick={sign}
              disabled={!hasSignature || processing || showTimer}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/20 active:scale-[0.99]"
            >
              {processing ? "Signing PDF..." : "⚡ Stamp Signature & Save PDF"}
            </button>

            {!isPremium() && (
              <p className="text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runSign} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF signed successfully!" onRestore={restoreOriginal} />

        {success && (
          <PipelineActionBar
            pdfBytes={resultBytes}
            filename={`signed-${file?.name || "document.pdf"}`}
            downloadUrl={downloadUrl}
            currentToolName="Sign PDF"
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About e-Sign PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add your signature to PDF documents digitally with our e-sign tool, designed for quick and secure document signing without printing or scanning. Draw your signature using your mouse or touchscreen, upload a PDF, and your signature is placed neatly on the last page. To sign PDF online free, simply draw in the signature pad, select your document, and download the signed file immediately. Everything runs entirely in your browser — drawing, embedding, and downloading — so your data never reaches a server. This is ideal for contracts, rental agreements, consent forms, approval workflows, and any document that requires a personal touch. Our e-sign PDF document tool gives you a simple, private way to sign.</p>
        </div>
      </div>
      <RelatedContent slug="sign" />

      <UseCaseLinks toolSlug="sign" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
