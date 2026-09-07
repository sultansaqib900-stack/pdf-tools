/**
 * Inline SVG icon set (Lucide-style, MIT-licensed geometry).
 *
 * Hand-inlined rather than pulled from a package so there is zero runtime
 * dependency and zero bundle cost beyond the paths actually referenced.
 * Replaces the emoji that were previously used as product iconography —
 * emoji render differently per OS, can't inherit colour, and don't align to
 * a pixel grid.
 *
 * All icons are 24x24, stroke-based, and inherit `currentColor`.
 */

export type IconName =
  | "compress" | "merge" | "split" | "delete" | "organize" | "crop" | "edit"
  | "resize" | "rotate" | "reverse" | "insertPage" | "flatten" | "repair"
  | "image" | "camera" | "scan" | "fileText" | "fileWord" | "fileSheet"
  | "code" | "archive" | "type" | "annotate" | "signature" | "lock" | "unlock"
  | "shield" | "redact" | "droplet" | "search" | "sparkles" | "form" | "layers"
  | "hash" | "info" | "list" | "settings" | "diff" | "award" | "headphones"
  | "tag" | "book" | "contrast" | "vault" | "qr" | "eraser" | "bookmark"
  | "numbers" | "chevronDown" | "chevronRight" | "arrowRight" | "check"
  | "close" | "menu" | "share" | "user" | "star" | "zap" | "globe" | "upload"
  | "download" | "clock" | "grid" | "sun" | "moon" | "monitor";

const P: Record<IconName, React.ReactNode> = {
  // ── Core document operations ──
  compress: <><path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M20 8V6a2 2 0 0 0-2-2h-2" /><path d="M20 16v2a2 2 0 0 1-2 2h-2" /><path d="M8 12h8" /><path d="m11 9-3 3 3 3" /><path d="m13 9 3 3-3 3" /></>,
  merge: <><path d="M8 3H6a2 2 0 0 0-2 2v3" /><path d="M4 14v2a2 2 0 0 0 2 2h2" /><rect width="12" height="12" x="8" y="6" rx="2" /></>,
  split: <><path d="M12 3v18" strokeDasharray="3 3" /><rect width="7" height="14" x="2" y="5" rx="1.5" /><rect width="7" height="14" x="15" y="5" rx="1.5" /></>,
  delete: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
  organize: <><rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" /></>,
  crop: <><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></>,
  edit: <><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><path d="M18.4 2.6a2 2 0 0 1 2.8 2.83L12 14.5l-4 1 1-4Z" /></>,
  resize: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="M3 9h12" /></>,
  rotate: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>,
  reverse: <><path d="m17 2 4 4-4 4" /><path d="M3 6h18" /><path d="m7 22-4-4 4-4" /><path d="M21 18H3" /></>,
  insertPage: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M12 11v6" /><path d="M9 14h6" /></>,
  flatten: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  repair: <><path d="M14.7 6.3a4 4 0 0 0 5 5l3-3a7 7 0 0 1-9.9 8.5l-6 6a2.1 2.1 0 0 1-3-3l6-6A7 7 0 0 1 18.3 4l-3.6 2.3Z" /></>,

  // ── Conversion ──
  image: <><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="1.8" /><path d="m21 15-4.5-4.5L7 20" /></>,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3.5" /></>,
  scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M3 12h18" /></>,
  fileText: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  fileWord: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="m8.5 12.5 1.5 5 2-3.5 2 3.5 1.5-5" /></>,
  fileSheet: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M12 13v4" /></>,
  code: <><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>,
  archive: <><rect width="20" height="5" x="2" y="3" rx="1.5" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></>,
  type: <><path d="M4 7V5h16v2" /><path d="M12 5v14" /><path d="M9 19h6" /></>,

  // ── Markup & signing ──
  annotate: <><path d="m9 11-6 6v3h3l6-6" /><path d="m17 3 4 4-9.5 9.5-4-4L17 3Z" /></>,
  signature: <><path d="M3 17c3.5 0 3.5-10 7-10s3.5 10 7 10c1.5 0 2.5-1 2.5-1" /><path d="M3 21h18" /></>,

  // ── Security ──
  lock: <><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  unlock: <><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" /></>,
  redact: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 9h10" /><path d="M7 13h10" /><path d="M7 17h6" /></>,
  droplet: <><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z" /></>,
  vault: <><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="12" cy="12" r="4" /><path d="M12 8v1" /><path d="M12 15v1" /><path d="M16 12h-1" /><path d="M9 12H8" /></>,
  eraser: <><path d="m7 21-4-4a2 2 0 0 1 0-2.8l9-9a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8L12 21Z" /><path d="M21 21H7" /></>,

  // ── Extraction & AI ──
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  sparkles: <><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="m5.6 5.6 2.1 2.1" /><path d="m16.3 16.3 2.1 2.1" /><path d="m18.4 5.6-2.1 2.1" /><path d="m7.7 16.3-2.1 2.1" /></>,
  form: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 8h10" /><path d="M7 12h6" /><path d="M7 16h3" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  hash: <><path d="M4 9h16" /><path d="M4 15h16" /><path d="m10 3-2 18" /><path d="m16 3-2 18" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  list: <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H8a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,

  // ── Premium ──
  diff: <><path d="M12 3v18" /><path d="M5 8H2v8h3" /><path d="M19 8h3v8h-3" /><path d="M5 5h4v14H5Z" /><path d="M15 5h4v14h-4Z" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="m9 14.5-1.5 7L12 19l4.5 2.5L15 14.5" /></>,
  headphones: <><path d="M3 16v-4a9 9 0 0 1 18 0v4" /><path d="M21 17a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" /><path d="M3 17a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z" /></>,
  tag: <><path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8Z" /><circle cx="7" cy="7" r="1.3" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
  contrast: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" /></>,
  qr: <><rect width="6" height="6" x="3" y="3" rx="1" /><rect width="6" height="6" x="15" y="3" rx="1" /><rect width="6" height="6" x="3" y="15" rx="1" /><path d="M15 15h2v2h-2Z" /><path d="M19 15h2v2" /><path d="M15 19h2v2" /><path d="M19 19h2v2" /></>,
  bookmark: <><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></>,
  numbers: <><path d="M4 17V7l-2 1.5" /><path d="M9 9a3 3 0 1 1 5.2 2L9 17h6" /><path d="M18 7h3l-2 3.5a2.8 2.8 0 1 1-2 4.8" /></>,

  // ── UI chrome ──
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  share: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4" /><path d="M12 2v14" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1Z" />,
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 9 5-5 5 5" /><path d="M12 4v12" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 11 5 5 5-5" /><path d="M12 16V4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  grid: <><rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  monitor: <><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></>,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  /** Stroke width. 1.75 reads better than Lucide's default 2 at small sizes. */
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {P[name]}
    </svg>
  );
}
