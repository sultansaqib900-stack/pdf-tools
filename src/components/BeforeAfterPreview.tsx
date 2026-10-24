"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeAfterPreviewProps {
  beforeBytes: ArrayBuffer;
  afterBytes: ArrayBuffer;
  pageNum?: number;
  labelBefore?: string;
  labelAfter?: string;
}

export default function BeforeAfterPreview({
  beforeBytes,
  afterBytes,
  pageNum = 0,
  labelBefore = "Before",
  labelAfter = "After",
}: BeforeAfterPreviewProps) {
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let taskBefore: { destroy: () => Promise<void> } | null = null;
    let taskAfter: { destroy: () => Promise<void> } | null = null;

    const render = async () => {
      setLoading(true);
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      if (!GlobalWorkerOptions.workerSrc && !GlobalWorkerOptions.workerPort) {
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      try {
        const tBefore = getDocument({ data: beforeBytes.slice(0) });
        const tAfter = getDocument({ data: afterBytes.slice(0) });
        taskBefore = tBefore;
        taskAfter = tAfter;

        const [beforePdf, afterPdf] = await Promise.all([
          tBefore.promise,
          tAfter.promise,
        ]);
        if (cancelled) return;

        const pageNumSafe = Math.min(pageNum, beforePdf.numPages - 1, afterPdf.numPages - 1);
        const [beforePage, afterPage] = await Promise.all([
          beforePdf.getPage(pageNumSafe + 1),
          afterPdf.getPage(pageNumSafe + 1),
        ]);
        if (cancelled) {
          beforePage.cleanup();
          afterPage.cleanup();
          return;
        }

        const scale = 1.2;
        const vp = beforePage.getViewport({ scale });
        const drawPage = async (
          page: any,
          canvas: HTMLCanvasElement | null
        ) => {
          if (!canvas || cancelled) return;
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          await page.render({ canvas, viewport: vp }).promise;
          page.cleanup();
        };

        await Promise.all([
          drawPage(beforePage, beforeRef.current),
          drawPage(afterPage, afterRef.current),
        ]);
      } catch {
        // silent fail — preview is optional
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    render();

    return () => {
      cancelled = true;
      taskBefore?.destroy().catch(() => {});
      taskAfter?.destroy().catch(() => {});
    };
  }, [beforeBytes, afterBytes, pageNum]);

  if (loading) {
    return (
      <div className="flex gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 h-48 bg-[var(--card-border)] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <div className="flex-1">
        <p className="text-xs font-medium text-[var(--muted)] mb-1.5">{labelBefore}</p>
        <canvas
          ref={beforeRef}
          className="w-full border border-[var(--card-border)] rounded-xl bg-white"
          style={{ maxHeight: 300, objectFit: "contain" }}
        />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-[var(--muted)] mb-1.5">{labelAfter}</p>
        <canvas
          ref={afterRef}
          className="w-full border border-[var(--card-border)] rounded-xl bg-white"
          style={{ maxHeight: 300, objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
