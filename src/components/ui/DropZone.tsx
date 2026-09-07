"use client";

import { useCallback, useId, useState } from "react";
import Icon from "@/components/ui/Icon";

/**
 * Shared file drop target for tool pages.
 *
 * Replaces the per-page emoji + dashed div, each of which styled its own
 * drag state slightly differently.
 */
export default function DropZone({
  file,
  files,
  onFile,
  onFiles,
  accept = "application/pdf",
  multiple = false,
  hint = "PDF up to 10 MB",
  label = "Drop a PDF here, or click to browse",
}: {
  file?: File | null;
  files?: File[];
  onFile?: (f: File | null) => void;
  onFiles?: (f: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  label?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const id = useId();

  const emit = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      if (multiple && onFiles) onFiles(Array.from(list));
      else onFile?.(list[0]);
    },
    [multiple, onFile, onFiles]
  );

  const selected = multiple ? files ?? [] : file ? [file] : [];
  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <label
        htmlFor={id}
        onDrop={(e) => { e.preventDefault(); setDragging(false); emit(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`flex flex-col items-center justify-center gap-2.5 px-6 py-11 rounded-[var(--r-lg)] border border-dashed cursor-pointer text-center transition-colors duration-150 ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
            : "border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
            dragging
              ? "bg-[var(--surface)] border-[var(--accent-border)] text-[var(--accent)]"
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          <Icon name="upload" size={18} />
        </span>
        <span className="text-[0.875rem] font-medium text-[var(--foreground)]">{label}</span>
        <span className="text-[0.75rem] text-[var(--muted)]">{hint}</span>
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => emit(e.target.files)}
          className="sr-only"
        />
      </label>

      {selected.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {selected.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)]"
            >
              <Icon name="fileText" size={15} className="shrink-0 text-[var(--muted)]" />
              <span className="flex-1 min-w-0 truncate text-[0.8125rem] text-[var(--foreground)]">{f.name}</span>
              <span className="shrink-0 text-[0.75rem] tabular-nums text-[var(--muted)]">{fmt(f.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
