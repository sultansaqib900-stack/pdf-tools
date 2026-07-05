"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

const rc = getRelatedContent("compress");

export default function EsCompressPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ size: number; originalSize: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("compress"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (f && f.type === "application/pdf") {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
      setFile(f);
      setResult(null);
      setError(null);
      setSuccess(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const runCompress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        objectsPerTick: 100,
      });
      const compressed = new Uint8Array(compressedBytes);
      setResult({ size: compressed.length, originalSize: bytes.byteLength });

      const blob = new Blob([compressed.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprimido-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Compress PDF", compressed.length);
      setSuccess(true);
    } catch {
      setError("No se pudo comprimir el PDF. El archivo puede estar encriptado o corrupto.");
    }
    setProcessing(false);
  }, [file, usage]);

  const compress = useCallback(async () => {
    if (!file) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runCompress();
    }, [usage, upsell, file, runCompress])

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restaurado.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Comprimir PDF - Herramienta Gratuita Online"
        description="Comprime archivos PDF gratis online. Reduce el tamaño del PDF sin perder calidad. Sin subidas, 100% privado."
        url="https://allaboutpdfediting.xyz/es/compress"
      />
      <HowToJsonLd name="Comprimir PDF Online Gratis" description="Reduce el tamaño del PDF sin perder calidad" steps={[{name:"Subir PDF",text:"Selecciona el archivo PDF que deseas comprimir"},{name:"Comprimir",text:"Haz clic en comprimir para reducir el tamaño"},{name:"Descargar PDF",text:"Descarga tu archivo PDF más pequeño"}]} />
      <BreadcrumbJsonLd items={[{ name: "Inicio", item: "https://allaboutpdfediting.xyz/es" }, { name: "Comprimir PDF", item: "https://allaboutpdfediting.xyz/es/compress" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Comprimir PDF" summary="Reduce el tamaño de archivos PDF al instante sin perder calidad" category="Utilidades" inputType="PDF" outputType="PDF" processing="lado-del-cliente" price="free" features={["Compresión sin pérdida","Reducción de tamaño","Preservación de calidad","Procesamiento instantáneo","Sin subidas"]} limits="Archivos hasta 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Comprimir PDF</h1>
        <p className="text-[var(--muted)]">Reduce el tamaño del PDF manteniendo la calidad.</p>
      </div>

      <ToolInfo
        name="Comprimir PDF"
        description="Tu PDF nunca sale de tu dispositivo. La compresión ocurre localmente en tu navegador usando pdf-lib. Selecciona un archivo, haz clic en comprimir y descarga la versión más pequeña — sin subidas, sin servidores, sin riesgos de privacidad."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
              : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📦</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Haz clic para seleccionar o arrastra un PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{formatBytes(file.size)}</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Máx 50MB · Solo PDF</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Comprimiendo PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCompress(); }} />}

        <button
          onClick={compress}
          disabled={!file || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Comprimiendo...
            </span>
          ) : "Comprimir PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Usuarios gratuitos limitados a 10MB.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Actualiza para 100MB, lotes y sin espera</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runCompress} onDismiss={() => setError(null)} />}

        {result && !processing && (
          <div className="mt-4 space-y-2">
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-sm font-medium text-[var(--foreground)]">Resultados de compresión</p>
              <div className="flex justify-between mt-2 text-sm text-[var(--muted)]">
                <span>Original: {formatBytes(result.originalSize)}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Comprimido: {formatBytes(result.size)}</span>
              </div>
              <div className="mt-2 w-full h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((1 - result.size / result.originalSize) * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                {Math.round((1 - result.size / result.originalSize) * 100)}% más pequeño
              </p>
            </div>
          </div>
        )}

        <SuccessAnimation show={success} message="¡Compresión completa!" details={`${file ? formatBytes((result?.originalSize || 0)) : ""} → ${file ? formatBytes((result?.size || 0)) : ""}`} onRestore={restoreOriginal} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">Acerca de Comprimir PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Nuestra herramienta gratuita para comprimir PDF te permite reducir el tamaño del archivo sin sacrificar calidad, facilitando el envío por correo electrónico o la carga en sitios web. La compresión funciona completamente en tu navegador usando pdf-lib, que elimina datos redundantes y optimiza los flujos de objetos para máxima eficiencia. Puedes lograr relaciones de compresión significativas dependiendo del contenido de tu archivo: las imágenes, fuentes y elementos incrustados se comprimen de manera diferente. Para obtener los mejores resultados, comprime PDF online gratis antes de compartir archivos adjuntos grandes, ya que los archivos más pequeños se transfieren más rápido y usan menos almacenamiento. Todo se procesa del lado del cliente, tus archivos nunca salen de tu dispositivo, garantizando privacidad y seguridad totales.</p>
        </div>
      </div>

      <RelatedContent slug="compress" />
      <UseCaseLinks toolSlug="compress" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
