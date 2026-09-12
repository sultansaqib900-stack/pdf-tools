import { copyPdfBytes, type PdfBinary } from "./pdfBytes";

export interface PdfRedactionArea {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PdfColorMode = "invert" | "grayscale" | "high-contrast";

interface RasterOptions {
  scale?: number;
  imageType?: "png" | "jpeg";
  imageQuality?: number;
  maxCanvasPixels?: number;
  onProgress?: (completedPages: number, totalPages: number) => void;
  transform?: (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pageIndex: number,
    viewport: PdfJsViewport,
  ) => void | Promise<void>;
}

interface PdfJsViewport {
  width: number;
  height: number;
  convertToViewportRectangle(rect: [number, number, number, number]): number[];
}

function requireBrowserCanvas(): void {
  if (typeof document === "undefined") {
    throw new Error("This operation requires a browser with Canvas support.");
  }
}

async function canvasToBytes(
  canvas: HTMLCanvasElement,
  imageType: "png" | "jpeg",
  quality: number,
): Promise<Uint8Array> {
  const mime = imageType === "png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, quality);
  });

  if (blob) return new Uint8Array(await blob.arrayBuffer());

  // Older WebKit versions may not implement canvas.toBlob.
  const dataUrl = canvas.toDataURL(mime, quality);
  const response = await fetch(dataUrl);
  return new Uint8Array(await response.arrayBuffer());
}

async function rasterizePdf(
  input: PdfBinary,
  options: RasterOptions = {},
): Promise<Uint8Array> {
  requireBrowserCanvas();
  const pdfjs = await import("pdfjs-dist");
  const { PDFDocument } = await import("pdf-lib");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  // PDF.js transfers this copy to its worker. The caller's bytes stay intact.
  const loadingTask = pdfjs.getDocument({ data: copyPdfBytes(input) });
  const source = await loadingTask.promise;
  const output = await PDFDocument.create();
  const requestedScale = options.scale ?? 1.5;
  const maxPixels = options.maxCanvasPixels ?? 18_000_000;
  const imageType = options.imageType ?? "jpeg";
  const imageQuality = options.imageQuality ?? 0.86;

  try {
    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const basePixels = baseViewport.width * baseViewport.height;
      const safeScale = Math.min(
        requestedScale,
        Math.sqrt(maxPixels / Math.max(basePixels, 1)),
      );
      const effectiveScale = Math.max(0.5, safeScale);
      const viewport = page.getViewport({ scale: effectiveScale }) as unknown as PdfJsViewport;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Could not create a Canvas rendering context.");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvas,
        canvasContext: context,
        viewport: viewport as never,
        background: "#ffffff",
        annotationMode: pdfjs.AnnotationMode.ENABLE,
      }).promise;

      await options.transform?.(
        context,
        canvas,
        pageNumber - 1,
        viewport,
      );

      const imageBytes = await canvasToBytes(canvas, imageType, imageQuality);
      const image = imageType === "png"
        ? await output.embedPng(imageBytes)
        : await output.embedJpg(imageBytes);
      const outputWidth = viewport.width / effectiveScale;
      const outputHeight = viewport.height / effectiveScale;
      const outputPage = output.addPage([outputWidth, outputHeight]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: outputWidth,
        height: outputHeight,
      });

      page.cleanup();
      canvas.width = 1;
      canvas.height = 1;
      options.onProgress?.(pageNumber, source.numPages);
    }

    output.setTitle("");
    output.setAuthor("");
    output.setSubject("");
    output.setKeywords([]);
    output.setCreator("");
    output.setProducer("");
    return output.save({ useObjectStreams: true });
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Flattens the currently visible page appearance by rebuilding every page from
 * rendered pixels. AcroForm widgets, visible annotations, and the active layer
 * state become non-interactive image content. Searchable text and links are
 * intentionally removed as part of this full visual flattening.
 */
export async function flattenPdfVisually(
  input: PdfBinary,
  onProgress?: (completedPages: number, totalPages: number) => void,
): Promise<Uint8Array> {
  return rasterizePdf(input, {
    scale: 1.6,
    imageType: "png",
    maxCanvasPixels: 18_000_000,
    onProgress,
  });
}

/**
 * Securely redacts content by rebuilding every page from rendered pixels after
 * applying opaque boxes. This removes the original text/content streams rather
 * than merely covering searchable text with a rectangle.
 */
export async function secureRedactPdf(
  input: PdfBinary,
  areas: PdfRedactionArea[],
  onProgress?: (completedPages: number, totalPages: number) => void,
): Promise<Uint8Array> {
  if (areas.length === 0) return copyPdfBytes(input);

  const byPage = new Map<number, PdfRedactionArea[]>();
  for (const area of areas) {
    if (area.width <= 0 || area.height <= 0 || area.pageIndex < 0) continue;
    const current = byPage.get(area.pageIndex) ?? [];
    current.push(area);
    byPage.set(area.pageIndex, current);
  }

  return rasterizePdf(input, {
    scale: 1.75,
    imageType: "png",
    onProgress,
    transform: (context, _canvas, pageIndex, viewport) => {
      const pageAreas = byPage.get(pageIndex) ?? [];
      context.save();
      context.fillStyle = "#000000";
      for (const area of pageAreas) {
        const converted = viewport.convertToViewportRectangle([
          area.x,
          area.y,
          area.x + area.width,
          area.y + area.height,
        ]);
        const left = Math.min(converted[0], converted[2]);
        const top = Math.min(converted[1], converted[3]);
        const width = Math.abs(converted[2] - converted[0]);
        const height = Math.abs(converted[3] - converted[1]);
        context.fillRect(
          Math.max(0, left - 2),
          Math.max(0, top - 2),
          width + 4,
          height + 4,
        );
      }
      context.restore();
    },
  });
}

export async function transformPdfColors(
  input: PdfBinary,
  mode: PdfColorMode,
  onProgress?: (completedPages: number, totalPages: number) => void,
): Promise<Uint8Array> {
  return rasterizePdf(input, {
    scale: 1.6,
    imageType: "jpeg",
    imageQuality: 0.9,
    onProgress,
    transform: (context, canvas) => {
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = image.data;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];

        if (mode === "invert") {
          pixels[offset] = 255 - red;
          pixels[offset + 1] = 255 - green;
          pixels[offset + 2] = 255 - blue;
          continue;
        }

        const luminance = Math.round(0.2126 * red + 0.7152 * green + 0.0722 * blue);
        const value = mode === "high-contrast"
          ? (luminance >= 150 ? 255 : 0)
          : luminance;
        pixels[offset] = value;
        pixels[offset + 1] = value;
        pixels[offset + 2] = value;
      }
      context.putImageData(image, 0, 0);
    },
  });
}

export type PdfCompressionMode = "balanced" | "maximum" | "lossless";

export interface PdfCompressionResult {
  bytes: Uint8Array;
  originalSize: number;
  outputSize: number;
  flattened: boolean;
}

export async function compressPdfBytes(
  input: PdfBinary,
  mode: PdfCompressionMode = "balanced",
  onProgress?: (completedPages: number, totalPages: number) => void,
): Promise<PdfCompressionResult> {
  const original = copyPdfBytes(input);

  if (mode === "lossless") {
    const { PDFDocument } = await import("pdf-lib");
    const document = await PDFDocument.load(copyPdfBytes(original));
    const optimized = await document.save({ useObjectStreams: true, objectsPerTick: 100 });
    const bytes = optimized.byteLength < original.byteLength ? optimized : original;
    return {
      bytes,
      originalSize: original.byteLength,
      outputSize: bytes.byteLength,
      flattened: false,
    };
  }

  const bytes = await rasterizePdf(original, {
    scale: mode === "maximum" ? 1.1 : 1.45,
    imageType: "jpeg",
    imageQuality: mode === "maximum" ? 0.58 : 0.8,
    maxCanvasPixels: mode === "maximum" ? 10_000_000 : 16_000_000,
    onProgress,
  });

  // A compressor must never silently return a larger file. Keep the original
  // when a tiny/vector-only PDF is already more efficient than raster output.
  const output = bytes.byteLength < original.byteLength ? bytes : original;
  return {
    bytes: output,
    originalSize: original.byteLength,
    outputSize: output.byteLength,
    flattened: output === bytes,
  };
}
