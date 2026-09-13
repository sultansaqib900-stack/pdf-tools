// === UNIFIED PDF PIPELINE STORE & ENGINE ===
// Stores the active PDF in IndexedDB and memory so users can chain operations
// without downloading and re-uploading between tools.

import { deleteFile, getFile, saveFile, type StoredFile } from "./fileStore";
import { copyPdfBytes, type PdfBinary } from "./pdfBytes";

const ACTIVE_SESSION_KEY = "pdftools_active_pipeline_id";
const ACTIVE_FILE_ID = "pipeline_active_doc";
const ACTIVE_FILENAME_KEY = "pdftools_pipeline_filename";

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

interface PipelineHistoryEntry {
  name: string;
  bytes: Uint8Array;
  timestamp: number;
}

let inMemoryPdfBytes: Uint8Array | null = null;
let inMemoryPdfName = "document.pdf";
let inMemoryHistory: PipelineHistoryEntry[] = [];
let stateGeneration = 0;

function canUseIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function persistSessionMarker(name: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACTIVE_SESSION_KEY, ACTIVE_FILE_ID);
  localStorage.setItem(ACTIVE_FILENAME_KEY, name);
}

function clearSessionMarker(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  localStorage.removeItem(ACTIVE_FILENAME_KEY);
}

async function persistDocument(bytes: Uint8Array, name: string): Promise<void> {
  if (!canUseIndexedDb()) return;

  const safeBytes = copyPdfBytes(bytes);
  const stored: StoredFile = {
    id: ACTIVE_FILE_ID,
    name,
    size: safeBytes.byteLength,
    type: "application/pdf",
    date: new Date().toISOString(),
    data: safeBytes.buffer as ArrayBuffer,
  };
  await saveFile(stored);
  persistSessionMarker(name);
}

export function hasActivePipelineDoc(): boolean {
  if (inMemoryPdfBytes?.byteLength) return true;
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(ACTIVE_SESSION_KEY) === ACTIVE_FILE_ID;
}

export async function setPipelineDocument(
  data: PdfBinary | File,
  filename?: string,
): Promise<string> {
  let bytes: Uint8Array;
  let name = filename || "document.pdf";

  if (typeof File !== "undefined" && data instanceof File) {
    bytes = new Uint8Array(await data.arrayBuffer());
    if (!filename && data.name) name = data.name;
  } else {
    bytes = copyPdfBytes(data as PdfBinary);
  }

  if (bytes.byteLength === 0) {
    throw new Error("Cannot add an empty PDF to the pipeline.");
  }

  stateGeneration += 1;
  inMemoryPdfBytes = copyPdfBytes(bytes);
  inMemoryPdfName = name;
  inMemoryHistory = [{
    name: "Original Document",
    bytes: copyPdfBytes(bytes),
    timestamp: Date.now(),
  }];

  // The in-memory pipeline remains usable when private browsing blocks IDB.
  try {
    await persistDocument(bytes, name);
  } catch {
    // In-memory operation still works for this tab. Do not leave a persistence
    // marker when IndexedDB rejected the write.
    clearSessionMarker();
  }

  return ACTIVE_FILE_ID;
}

export async function getPipelineDocument(): Promise<{ bytes: Uint8Array; name: string } | null> {
  // Never expose the store's own typed array. PDF.js transfers buffers to its
  // worker and would otherwise detach the pipeline's only in-memory copy.
  if (inMemoryPdfBytes?.byteLength) {
    return { bytes: copyPdfBytes(inMemoryPdfBytes), name: inMemoryPdfName };
  }

  if (!canUseIndexedDb()) return null;
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(ACTIVE_SESSION_KEY) !== ACTIVE_FILE_ID
  ) {
    return null;
  }

  const generationAtStart = stateGeneration;
  try {
    const stored = await getFile(ACTIVE_FILE_ID);
    // Ignore a read that finished after the session was cleared/replaced.
    if (generationAtStart !== stateGeneration || !stored?.data?.byteLength) {
      return null;
    }

    const bytes = new Uint8Array(stored.data.slice(0));
    inMemoryPdfBytes = copyPdfBytes(bytes);
    inMemoryPdfName = stored.name || "document.pdf";
    if (inMemoryHistory.length === 0) {
      inMemoryHistory = [{
        name: "Restored Document",
        bytes: copyPdfBytes(bytes),
        timestamp: Date.now(),
      }];
    }
    persistSessionMarker(inMemoryPdfName);
    return { bytes: copyPdfBytes(bytes), name: inMemoryPdfName };
  } catch {
    return null;
  }
}

export async function pushPipelineStep(
  stepName: string,
  newBytes: PdfBinary,
): Promise<void> {
  const bytes = copyPdfBytes(newBytes);
  if (bytes.byteLength === 0) {
    throw new Error("A pipeline step produced an empty PDF.");
  }

  stateGeneration += 1;
  inMemoryPdfBytes = copyPdfBytes(bytes);
  inMemoryHistory.push({
    name: stepName,
    bytes: copyPdfBytes(bytes),
    timestamp: Date.now(),
  });

  try {
    await persistDocument(bytes, inMemoryPdfName);
  } catch {
    // Keep the in-memory step even when browser storage is unavailable.
    clearSessionMarker();
  }
}

export const recordPipelineStep = pushPipelineStep;

export function getPipelineHistory() {
  return inMemoryHistory.map((entry, index) => ({
    index,
    name: entry.name,
    timestamp: entry.timestamp,
  }));
}

export function revertPipelineToStep(index: number): Uint8Array | null {
  if (index < 0 || index >= inMemoryHistory.length) return null;

  const restored = copyPdfBytes(inMemoryHistory[index].bytes);
  stateGeneration += 1;
  inMemoryPdfBytes = copyPdfBytes(restored);
  inMemoryHistory = inMemoryHistory.slice(0, index + 1);
  void persistDocument(restored, inMemoryPdfName).catch(() => undefined);
  return copyPdfBytes(restored);
}

export async function clearPipelineSession(): Promise<void> {
  stateGeneration += 1;
  inMemoryPdfBytes = null;
  inMemoryPdfName = "document.pdf";
  inMemoryHistory = [];
  clearSessionMarker();

  if (canUseIndexedDb()) {
    try {
      await deleteFile(ACTIVE_FILE_ID);
    } catch {
      // Memory and the session marker are already cleared. An inaccessible IDB
      // entry cannot be restored because getPipelineDocument checks the marker.
    }
  }
}

export const clearPipelineDocument = clearPipelineSession;
