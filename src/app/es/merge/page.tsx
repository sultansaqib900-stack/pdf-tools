"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize, checkBatchCount } from "@/lib/premium";
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

const rc = getRelatedContent("merge");

export default function EsMergePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("merge"); }, []);

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const countCheck = checkBatchCount(list.length);
    if (!countCheck.ok) { upsell.showUpsell("file-size"); return; }
    setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.type === "application/pdf")]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const runMerge = useCallback(async () => {
    if (files.length < 2) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        if (!originalBytes.current) { originalBytes.current = bytes; }
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "unidos.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport(files[0]?.name || "unidos.pdf", "Merge PDF", mergedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("No se pudieron unir los PDFs. Uno o más archivos pueden estar encriptados o corruptos.");
    }
    setProcessing(false);
  }, [files]);

  const merge = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runMerge();
    }, [usage, upsell, runMerge])

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${files[0]?.name || "restaurado.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i: number) => {
    if (i === files.length - 1) return;
    setFiles((prev) => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Unir PDF - Herramienta Gratuita Online"
        description="Une varios PDF en un solo documento online gratis. Combina archivos PDF al instante en tu navegador."
        url="https://allaboutpdfediting.xyz/es/merge"
      />
      <HowToJsonLd name="Unir PDF Online" description="Combina varios archivos PDF en un solo documento" steps={[{name:"Subir PDFs",text:"Selecciona dos o más archivos PDF para unir"},{name:"Ordenar",text:"Arrastra los archivos para establecer el orden deseado"},{name:"Descargar PDF",text:"Descarga el documento PDF combinado"}]} />
      <BreadcrumbJsonLd items={[{ name: "Inicio", item: "https://allaboutpdfediting.xyz/es" }, { name: "Unir PDF", item: "https://allaboutpdfediting.xyz/es/merge" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Unir PDF" summary="Combina varios documentos PDF en un solo archivo con orden personalizable" category="Utilidades" inputType="PDF" outputType="PDF" processing="lado-del-cliente" price="free" features={["Combinar múltiples archivos","Orden personalizable","Arrastrar y soltar","Procesamiento gratuito","Sin subidas"]} limits="Archivos hasta 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Unir PDF</h1>
        <p className="text-[var(--muted)]">Combina varios PDF en un solo documento. Arrastra para reordenar.</p>
      </div>

      <ToolInfo
        name="Unir PDF"
        description="Tus archivos se quedan en tu dispositivo. La unión se realiza completamente en tu navegador — sin datos subidos, sin servidores involucrados. Selecciona, reordena y descarga tu PDF combinado al instante."
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
            accept="application/pdf"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <Icon name="fileText" size={36} className="text-[var(--muted)]" />
            <span className="text-[var(--accent)] font-medium hover:underline">Haz clic para seleccionar o arrastra PDFs</span>
            <span className="text-xs text-[var(--muted)]">Selecciona varios archivos a la vez</span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium text-[var(--muted)] mb-2">
              {files.length} archivo{files.length > 1 ? "s" : ""} seleccionado{files.length > 1 ? "s" : ""} — arrastra para reordenar
              <button onClick={() => setFiles([])} className="ml-3 text-[var(--danger)] hover:text-[var(--danger)] text-xs">Limpiar todo</button>
            </p>
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-[var(--muted)] w-6">{i + 1}.</span>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">{file.name}</span>
                  <span className="text-xs text-[var(--muted)] shrink-0">({formatBytes(file.size)})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Subir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Bajar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <button onClick={() => removeFile(i)} className="p-1 text-[var(--danger)] hover:text-[var(--danger)]" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ProgressBar processing={processing} fileSize={files.reduce((s, f) => s + f.size, 0)} label="Uniendo PDFs..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runMerge(); }} />}

        <button
          onClick={merge}
          disabled={files.length < 2 || processing || showTimer}
          className="mt-6 w-full py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Uniendo {files.length} archivos...
            </span>
          ) : `Unir ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Usuarios gratuitos limitados a 10MB.{ " " }
            <a href="/premium" className="text-[var(--accent)] font-medium hover:underline">Actualiza para 100MB, lotes y sin espera</a>
          </p>
        )}

        {files.length > 0 && files.length < 2 && (
          <p className="text-xs text-[var(--premium)] mt-2 text-center">Selecciona al menos 2 archivos PDF para unir.</p>
        )}

        {error && <ErrorBanner message={error} onRetry={runMerge} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="¡PDFs unidos!" onRestore={restoreOriginal} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">Acerca de Unir PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Con nuestra herramienta para unir PDF, puedes combinar documentos PDF en un solo archivo sin esfuerzo, perfecto para consolidar informes, facturas, contratos escaneados o cualquier colección de páginas relacionadas. Simplemente sube tus PDFs, arrastra para reordenarlos y haz clic en unir — la interfaz intuitiva te da control total sobre la secuencia final de páginas. La herramienta procesa todo localmente en tu navegador usando pdf-lib, por lo que tus documentos sensibles nunca tocan un servidor. Para unir PDF online gratis, solo selecciona varios PDFs, ordénalos en el orden deseado y descarga el resultado combinado en segundos. Todo se mantiene privado y seguro.</p>
        </div>
      </div>

      <RelatedContent slug="merge" />
      <UseCaseLinks toolSlug="merge" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
