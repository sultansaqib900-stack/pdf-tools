/**
 * Browser image helpers that do not rely on fetching `data:` URLs.
 *
 * The site's Content Security Policy intentionally limits network connections.
 * Treating an in-memory data URL as a Fetch request is therefore both
 * unnecessary and blocked in conforming browsers. Decode it directly instead.
 */

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(",");
  if (!dataUrl.startsWith("data:") || commaIndex < 0) {
    throw new Error("Invalid image data URL.");
  }

  const metadata = dataUrl.slice(5, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  if (/;base64(?:;|$)/i.test(metadata)) {
    let decoded: string;
    try {
      decoded = atob(payload.replace(/\s/g, ""));
    } catch {
      throw new Error("Invalid base64 image data.");
    }

    const bytes = new Uint8Array(decoded.length);
    for (let index = 0; index < decoded.length; index += 1) {
      bytes[index] = decoded.charCodeAt(index);
    }
    return bytes;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(payload.replace(/\+/g, "%20"));
  } catch {
    throw new Error("Invalid percent-encoded image data.");
  }
  return new TextEncoder().encode(decoded);
}

export async function canvasToImageBytes(
  canvas: HTMLCanvasElement,
  mimeType: "image/png" | "image/jpeg" = "image/png",
  quality?: number,
): Promise<Uint8Array> {
  if (typeof canvas.toBlob === "function") {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });
    if (blob) return new Uint8Array(await blob.arrayBuffer());
  }

  // Older WebKit releases may not provide toBlob. Direct decoding keeps this
  // fallback compatible with a CSP that excludes data: from connect-src.
  return dataUrlToBytes(canvas.toDataURL(mimeType, quality));
}
