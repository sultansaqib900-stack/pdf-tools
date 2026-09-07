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

const rc = getRelatedContent("split");

export default function EsSplitPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "all">("all");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("split"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const { PDFDocument: PDFDoc } = await import("pdf-lib");
    const pdf = await PDFDoc.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();
    setPageCount(count);
    setEndPage(count);
    setStartPage(1);
  }, []);

  const runSplit = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      if (mode === "all") {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const pdfBytes = await newPdf.save({ useObjectStreams: true });
          const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `pagina-${i + 1}-${file.name}`;
          a.click();
          URL.revokeObjectURL(url);
        }
        trackExport(file.name, "Split PDF", sourcePdf.getPageCount());
      } else {
        const s = Math.max(0, startPage - 1);
        const e = Math.min(sourcePdf.getPageCount() - 1, endPage - 1);
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, Array.from({ length: e - s + 1 }, (_, i) => s + i));
        pages.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `paginas-${startPage}-${endPage}-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        trackExport(file.name, "Split PDF", pdfBytes.byteLength);
      }
      setSuccess(true);
    } catch {
      setError("No se pudo dividir el PDF. El archivo puede estar encriptado o corrupto.");
    }
    setProcessing(false);
  }, [file, mode, startPage, endPage]);

  const split = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSplit();
    }, [usage, upsell, runSplit])

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Dividir PDF - Herramienta Gratuita Online"
        description="Divide archivos PDF online gratis. Extrae páginas de documentos PDF al instante en tu navegador."
        url="https://allaboutpdfediting.xyz/es/split"
      />
      <HowToJsonLd name="Dividir PDF Online" description="Separa páginas PDF en varios archivos o extrae páginas específicas" steps={[{name:"Subir PDF",text:"Selecciona el archivo PDF para dividir"},{name:"Elegir método",text:"Selecciona rangos de páginas o divide cada página"},{name:"Descargar archivos",text:"Descarga los archivos PDF individuales"}]} />
      <BreadcrumbJsonLd items={[{ name: "Inicio", item: "https://allaboutpdfediting.xyz/es" }, { name: "Dividir PDF", item: "https://allaboutpdfediting.xyz/es/split" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Dividir PDF" summary="Separa páginas PDF en varios documentos o extrae rangos de páginas específicos" category="Utilidades" inputType="PDF" outputType="PDF" processing="lado-del-cliente" price="free" features={["Extraer rango de páginas","Dividir cada página","Múltiples archivos de salida","Procesamiento local","Gratis"]} limits="Archivos hasta 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Dividir PDF</h1>
        <p className="text-[var(--muted)]">Extrae páginas o divide en archivos separados.</p>
      </div>

      <ToolInfo
        name="Dividir PDF"
        description="Tu archivo se mantiene privado. La división ocurre localmente en tu navegador usando pdf-lib. Selecciona páginas, elige tu rango y descarga — sin subidas, sin servidores, privacidad total."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--surface)] rounded-[var(--r-lg)] border border-[var(--border)] p-8">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-[var(--r-lg)] p-10 text-center transition ${
            dragging ? "border-[var(--accent-border)] bg-[var(--accent-subtle)]" : "border-[var(--border)] bg-[var(--background)]"
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
            <Icon name="fileText" size={36} className="text-[var(--muted)]" />
            <span className="text-[var(--accent)] font-medium hover:underline">
              {file ? file.name : "Haz clic para seleccionar o arrastra un PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} página{pageCount > 1 ? "s" : ""}</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Dividiendo PDF..." />

        {pageCount > 0 && (
          <div className="mt-6 space-y-5">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "all"} onChange={() => setMode("all")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extraer todas las páginas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "range"} onChange={() => setMode("range")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extraer rango de páginas</span>
              </label>
            </div>

            {mode === "range" && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                <label className="text-sm text-[var(--muted)]">Desde:</label>
                <input type="number" min={1} max={pageCount} value={startPage} onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))} className="w-20 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                <label className="text-sm text-[var(--muted)]">Hasta:</label>
                <input type="number" min={1} max={pageCount} value={endPage} onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))} className="w-20 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)]" />
                <span className="text-xs text-[var(--muted)]">(1–{pageCount})</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSplit(); }} />}

            <button
              onClick={split}
              disabled={processing || showTimer}
              className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Dividiendo...
                </span>
              ) : mode === "all" ? `Dividir en ${pageCount} archivos` : `Extraer páginas ${startPage}–${endPage}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Usuarios gratuitos limitados a 10MB.{ " " }
                <a href="/premium" className="text-[var(--accent)] font-medium hover:underline">Actualiza para 100MB, lotes y sin espera</a>
              </p>
            )}
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runSplit} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="¡División completa!" onRestore={restoreOriginal} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">Acerca de Dividir PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>¿Necesitas dividir PDF online gratis? Nuestra herramienta te permite extraer páginas PDF o dividir cada página en archivos individuales, dándote flexibilidad completa sobre cómo gestionas tus documentos. Elige entre extraer un rango de páginas específico o dividir el documento completo en páginas separadas. Es ideal cuando necesitas solo ciertas secciones de un informe grande, quieres compartir páginas una por una, o reorganizar contenido eliminando páginas específicas. El procesamiento ocurre completamente del lado del cliente usando pdf-lib, lo que significa que tu documento nunca sale de tu navegador. Cada página extraída preserva la calidad y el formato original.</p>
        </div>
      </div>
      <RelatedContent slug="split" />
      <UseCaseLinks toolSlug="split" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
