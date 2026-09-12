// === UNIFIED PDF PIPELINE STORE & ENGINE ===
// Stores active PDF in IndexedDB and memory so users can chain operations
// (e.g. Delete pages -> Rotate -> Sign -> Watermark -> Compress) without re-uploading.

import { saveFile, getFile, StoredFile } from "./fileStore";

const ACTIVE_SESSION_KEY = "pdftools_active_pipeline_id";

export interface PipelineStep {
  id: string;
  name: string;
  timestamp: number;
  description: string;
}

export interface PipelineState {
  fileId: string;
  name: string;
  size: number;
  steps: PipelineStep[];
  data?: ArrayBuffer;
}

let inMemoryPdfBytes: Uint8Array | null = null;
let inMemoryPdfName = "document.pdf";
let inMemoryHistory: { name: string; bytes: Uint8Array; timestamp: number }[] = [];

export function hasActivePipelineDoc(): boolean {
  return inMemoryPdfBytes !== null;
}

export async function setPipelineDocument(
  data: Uint8Array | ArrayBuffer | File,
  filename?: string
): Promise<string> {
  let arrayBuf: ArrayBuffer;
  let name = filename || "document.pdf";

  if (data instanceof Uint8Array) {
    arrayBuf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else if (data instanceof ArrayBuffer) {
    arrayBuf = data;
  } else {
    arrayBuf = await (data as File).arrayBuffer();
    if (!filename && (data as File).name) {
      name = (data as File).name;
    }
  }

  inMemoryPdfBytes = new Uint8Array(arrayBuf);
  inMemoryPdfName = name;
  inMemoryHistory = [{ name: "Original Document", bytes: new Uint8Array(arrayBuf), timestamp: Date.now() }];

  const fileId = "pipeline_active_doc";
  if (typeof indexedDB !== "undefined") {
    try {
      const stored: StoredFile = {
        id: fileId,
        name,
        size: arrayBuf.byteLength,
        type: "application/pdf",
        date: new Date().toISOString(),
        data: arrayBuf,
      };
      await saveFile(stored);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(ACTIVE_SESSION_KEY, fileId);
        localStorage.setItem("pdftools_pipeline_filename", name);
      }
    } catch {
      // IndexedDB fallback to memory
    }
  }

  return fileId;
}

export async function getPipelineDocument(): Promise<{ bytes: Uint8Array; name: string } | null> {
  if (inMemoryPdfBytes) {
    return { bytes: inMemoryPdfBytes, name: inMemoryPdfName };
  }

  if (typeof indexedDB !== "undefined") {
    try {
      const stored = await getFile("pipeline_active_doc");
      if (stored && stored.data) {
        inMemoryPdfBytes = new Uint8Array(stored.data);
        inMemoryPdfName = stored.name;
        return { bytes: inMemoryPdfBytes, name: inMemoryPdfName };
      }
    } catch {
      // IndexedDB unavailable
    }
  }

  return null;
}

export async function pushPipelineStep(
  stepName: string,
  newBytes: Uint8Array | ArrayBuffer
): Promise<void> {
  const bytes = newBytes instanceof Uint8Array ? newBytes : new Uint8Array(newBytes);
  inMemoryPdfBytes = bytes;
  inMemoryHistory.push({ name: stepName, bytes, timestamp: Date.now() });

  if (typeof indexedDB !== "undefined") {
    try {
      const stored: StoredFile = {
        id: "pipeline_active_doc",
        name: inMemoryPdfName,
        size: bytes.byteLength,
        type: "application/pdf",
        date: new Date().toISOString(),
        data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      };
      await saveFile(stored);
    } catch {
      // Ignore
    }
  }
}

export const recordPipelineStep = pushPipelineStep;

export function getPipelineHistory() {
  return inMemoryHistory.map((h, i) => ({
    index: i,
    name: h.name,
    timestamp: h.timestamp,
  }));
}

export function revertPipelineToStep(index: number): Uint8Array | null {
  if (index >= 0 && index < inMemoryHistory.length) {
    inMemoryPdfBytes = inMemoryHistory[index].bytes;
    inMemoryHistory = inMemoryHistory.slice(0, index + 1);
    return inMemoryPdfBytes;
  }
  return null;
}

export function clearPipelineSession(): void {
  inMemoryPdfBytes = null;
  inMemoryHistory = [];
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem("pdftools_pipeline_filename");
  }
}

export const clearPipelineDocument = clearPipelineSession;
