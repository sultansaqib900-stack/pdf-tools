export type FileProgress = (percent: number) => void;

/** Read a local file without blocking the UI and report real browser read progress. */
export function readFileWithProgress(file: File, onProgress?: FileProgress): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) return reject(new Error("Could not read file."));
      onProgress?.(100);
      resolve(new Uint8Array(reader.result));
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.onabort = () => reject(new Error("File read was cancelled."));
    reader.readAsArrayBuffer(file);
  });
}
