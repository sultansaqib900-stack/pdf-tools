"use client";

import { useRef } from "react";

interface ToolSearchProps {
  tools: { name: string; href: string }[];
  onResult: (tool: { name: string; href: string } | null) => void;
}

export default function ToolSearch({ tools, onResult }: ToolSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = inputRef.current?.value?.toLowerCase().trim() || "";
      if (!q) {
        onResult(null);
        return;
      }
      const match = tools.find(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.href.replace("/", "").replace(/-/g, " ").includes(q)
      );
      onResult(match || null);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      const q = inputRef.current?.value?.toLowerCase().trim() || "";
      if (!q) return;
      const match = tools.find(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.href.replace("/", "").replace(/-/g, " ").includes(q)
      );
      if (match) {
        window.location.href = match.href;
      }
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search tools..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
