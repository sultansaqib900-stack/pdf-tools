import { zipSync } from "fflate";

export interface NamedArchiveFile {
  name: string;
  bytes: Uint8Array | ArrayBuffer;
}

function normalizeArchiveName(name: string, fallbackIndex: number): string {
  const cleaned = name
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("_")
    .replace(/[\u0000-\u001f\u007f]/g, "_")
    .trim();
  return cleaned || `file-${fallbackIndex + 1}`;
}

/** Build a ZIP with safe, unique filenames. Input bytes are defensively copied. */
export function createZipArchive(files: NamedArchiveFile[]): Uint8Array {
  if (files.length === 0) throw new Error("Cannot create an empty ZIP archive.");

  const entries: Record<string, Uint8Array> = {};
  const used = new Set<string>();

  files.forEach((file, index) => {
    const requested = normalizeArchiveName(file.name, index);
    const dot = requested.lastIndexOf(".");
    const stem = dot > 0 ? requested.slice(0, dot) : requested;
    const extension = dot > 0 ? requested.slice(dot) : "";
    let unique = requested;
    let duplicate = 2;
    while (used.has(unique.toLowerCase())) {
      unique = `${stem}-${duplicate}${extension}`;
      duplicate += 1;
    }
    used.add(unique.toLowerCase());

    const source = file.bytes instanceof Uint8Array
      ? file.bytes
      : new Uint8Array(file.bytes);
    entries[unique] = new Uint8Array(source);
  });

  return zipSync(entries, { level: 6 });
}
