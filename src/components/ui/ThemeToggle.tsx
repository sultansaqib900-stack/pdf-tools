"use client";

import { useEffect, useState, useRef } from "react";
import Icon from "@/components/ui/Icon";

type Mode = "light" | "dark" | "system";

const OPTIONS: { id: Mode; label: string; icon: "sun" | "moon" | "monitor" }[] = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
  { id: "system", label: "System", icon: "monitor" },
];

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setMode(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  // Track OS changes while in system mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (m: Mode) => {
    setMode(m);
    localStorage.setItem("theme", m);
    apply(m);
    setOpen(false);
  };

  const current = OPTIONS.find((o) => o.id === mode) ?? OPTIONS[2];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--r-md)] text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
      >
        <Icon name={current.icon} size={17} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-36 p-1 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-scaleIn origin-top-right z-50"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              role="menuitem"
              onClick={() => pick(o.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] transition-colors ${
                mode === o.id
                  ? "text-[var(--foreground)] bg-[var(--surface-hover)] font-medium"
                  : "text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <Icon name={o.icon} size={15} />
              {o.label}
              {mode === o.id && <Icon name="check" size={14} className="ml-auto text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
