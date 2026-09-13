import { copyPdfBytes, type PdfBinary } from "./pdfBytes";

export interface PdfPoint {
  x: number;
  y: number;
}

export interface PdfPointViewport {
  width: number;
  height: number;
  convertToPdfPoint(x: number, y: number): number[];
}

export interface PdfSignaturePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Counter-clockwise rotation in PDF user space. */
  rotation: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Maps a horizontal rectangle from a PDF.js viewport into PDF user space.
 *
 * `centerXPercent` and `centerYPercent` use the preview's natural convention:
 * origin at its top-left. PDF user space normally starts at the bottom-left and
 * can also be affected by CropBox and page rotation. Asking PDF.js to convert
 * the display rectangle's lower corners handles all of those cases and gives
 * pdf-lib an origin and rotation that reproduce the preview placement.
 */
export function mapSignatureFromViewport(
  viewport: PdfPointViewport,
  centerXPercent: number,
  centerYPercent: number,
  displayWidth: number,
  displayHeight: number,
): PdfSignaturePlacement {
  if (
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0 ||
    displayWidth <= 0 ||
    displayHeight <= 0
  ) {
    throw new Error("The signature placement dimensions are invalid.");
  }

  const width = Math.min(displayWidth, viewport.width);
  const height = Math.min(displayHeight, viewport.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const centerX = clamp((centerXPercent / 100) * viewport.width, halfWidth, viewport.width - halfWidth);
  const centerY = clamp((centerYPercent / 100) * viewport.height, halfHeight, viewport.height - halfHeight);

  const displayLeft = centerX - halfWidth;
  const displayRight = centerX + halfWidth;
  const displayBottom = centerY + halfHeight;
  const displayTop = centerY - halfHeight;
  const [originX, originY] = viewport.convertToPdfPoint(displayLeft, displayBottom);
  const [rightX, rightY] = viewport.convertToPdfPoint(displayRight, displayBottom);
  const [topX, topY] = viewport.convertToPdfPoint(displayLeft, displayTop);
  const widthVectorX = rightX - originX;
  const widthVectorY = rightY - originY;

  return {
    x: originX,
    y: originY,
    width: Math.hypot(widthVectorX, widthVectorY),
    height: Math.hypot(topX - originX, topY - originY),
    rotation: Math.atan2(widthVectorY, widthVectorX) * 180 / Math.PI,
  };
}

/**
 * Reads real page geometry with PDF.js and maps a preview placement onto that
 * page. This handles inherited CropBox values and intrinsic /Rotate entries.
 */
export async function locateSignatureOnPdfPage(
  input: PdfBinary,
  pageIndex: number,
  centerXPercent: number,
  centerYPercent: number,
  displayWidth: number,
  displayHeight: number,
  additionalRotation = 0,
): Promise<PdfSignaturePlacement> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const loadingTask = pdfjs.getDocument({ data: copyPdfBytes(input) });
  try {
    const document = await loadingTask.promise;
    if (pageIndex < 0 || pageIndex >= document.numPages) {
      throw new Error("The selected signature page does not exist.");
    }
    const page = await document.getPage(pageIndex + 1);
    const rotation = ((page.rotate + additionalRotation) % 360 + 360) % 360;
    const viewport = page.getViewport({ scale: 1, rotation });
    const placement = mapSignatureFromViewport(
      viewport,
      centerXPercent,
      centerYPercent,
      displayWidth,
      displayHeight,
    );
    page.cleanup();
    return placement;
  } finally {
    await loadingTask.destroy();
  }
}
