/**
 * One-off codemod: replace hardcoded Tailwind palette colours with the design
 * system tokens defined in globals.css.
 *
 * Ordered deliberately: compound multi-class patterns (success box, error box,
 * premium gradient button) are matched BEFORE single colour tokens, otherwise
 * the single-token rules would shred them into an unrecognisable mix.
 *
 * Run: node scripts/codemod-design-tokens.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const DRY = process.argv.includes("--dry");

const files = execSync(
  "git ls-files 'src/**/*.tsx' 'src/**/*.ts'",
  { encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean);

/** @type {[RegExp, string, string][]} [pattern, replacement, label] */
const RULES = [
  // ---------------------------------------------------------------------
  // 1. Compound blocks — match whole class strings first.
  // ---------------------------------------------------------------------
  // Success banner
  [
    /bg-emerald-50 dark:bg-emerald-950\/20 border border-emerald-200 dark:border-emerald-800/g,
    "bg-[var(--success-subtle)] border border-[var(--success)]/25",
    "success-box",
  ],
  [
    /bg-emerald-50 dark:bg-emerald-950\/20 border border-emerald-200 dark:border-emerald-900/g,
    "bg-[var(--success-subtle)] border border-[var(--success)]/25",
    "success-box",
  ],
  [
    /bg-emerald-900\/20 border border-emerald-700\/30/g,
    "bg-[var(--success-subtle)] border border-[var(--success)]/25",
    "success-box",
  ],
  // Error banner
  [
    /bg-red-50 dark:bg-red-950\/20 border border-red-200 dark:border-red-800/g,
    "bg-[var(--danger-subtle)] border border-[var(--danger)]/25",
    "error-box",
  ],
  [
    /bg-red-50 dark:bg-red-950\/20 border border-red-200 dark:border-red-900/g,
    "bg-[var(--danger-subtle)] border border-[var(--danger)]/25",
    "error-box",
  ],
  // Accent info panel
  [
    /bg-indigo-50 dark:bg-indigo-950\/30 border border-indigo-200 dark:border-indigo-800/g,
    "bg-[var(--accent-subtle)] border border-[var(--accent-border)]",
    "accent-box",
  ],
  [
    /bg-indigo-50 dark:bg-indigo-950\/20 border border-indigo-200 dark:border-indigo-800/g,
    "bg-[var(--accent-subtle)] border border-[var(--accent-border)]",
    "accent-box",
  ],
  [
    /bg-indigo-50 dark:bg-indigo-950\/30/g,
    "bg-[var(--accent-subtle)]",
    "accent-box",
  ],
  [
    /bg-indigo-50 dark:bg-indigo-950\/20/g,
    "bg-[var(--accent-subtle)]",
    "accent-box",
  ],
  // Premium gradient button -> flat premium token
  [
    /bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700/g,
    "bg-[var(--premium)] hover:opacity-90",
    "premium-btn",
  ],
  [
    /bg-gradient-to-r from-amber-600 to-orange-700/g,
    "bg-[var(--premium)]",
    "premium-btn",
  ],
  [
    /bg-gradient-to-r from-amber-500 to-orange-600/g,
    "bg-[var(--premium)]",
    "premium-btn",
  ],
  [
    /bg-gradient-to-br from-amber-500 to-orange-600/g,
    "bg-[var(--premium)]",
    "premium-btn",
  ],
  // File input styling
  [
    /file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300/g,
    "file:bg-[var(--accent-subtle)] file:text-[var(--accent)]",
    "file-input",
  ],

  // ---------------------------------------------------------------------
  // 2. Legacy card tokens -> current surface tokens.
  // ---------------------------------------------------------------------
  [/--card-border/g, "--border", "card-border"],
  [/bg-\[var\(--card\)\]/g, "bg-[var(--surface)]", "card-bg"],

  // ---------------------------------------------------------------------
  // 3. Single colour tokens.
  // ---------------------------------------------------------------------
  // Accent (indigo)
  [/hover:bg-indigo-700/g, "hover:bg-[var(--accent-hover)]", "accent"],
  [/hover:bg-indigo-600/g, "hover:bg-[var(--accent-hover)]", "accent"],
  [/hover:text-indigo-(?:300|500|600|700)/g, "hover:text-[var(--accent)]", "accent"],
  [/bg-indigo-(?:500|600|700)/g, "bg-[var(--accent)]", "accent"],
  [/text-indigo-(?:300|400|500|600|700)/g, "text-[var(--accent)]", "accent"],
  [/border-indigo-(?:200|300|500|600)(?:\/[0-9]+)?/g, "border-[var(--accent-border)]", "accent"],
  [/dark:border-indigo-800/g, "border-[var(--accent-border)]", "accent"],
  [/bg-indigo-50(?:\/[0-9]+)?/g, "bg-[var(--accent-subtle)]", "accent"],
  [/ring-indigo-500(?:\/[0-9]+)?/g, "ring-[var(--accent)]", "accent"],
  [/focus:border-indigo-500(?:\/[0-9]+)?/g, "focus:border-[var(--accent)]", "accent"],

  // Danger (red)
  [/hover:bg-red-(?:600|700)/g, "hover:opacity-90", "danger"],
  [/hover:text-red-(?:600|700)/g, "hover:text-[var(--danger)]", "danger"],
  [/bg-red-(?:500|600)/g, "bg-[var(--danger)]", "danger"],
  [/text-red-(?:400|500|600|700)/g, "text-[var(--danger)]", "danger"],
  [/border-red-(?:200|300|800)/g, "border-[var(--danger)]/25", "danger"],
  [/bg-red-50(?:\/[0-9]+)?/g, "bg-[var(--danger-subtle)]", "danger"],

  // Success (emerald)
  [/hover:bg-emerald-(?:600|700)/g, "hover:opacity-90", "success"],
  [/bg-emerald-(?:500|600|700)/g, "bg-[var(--success)]", "success"],
  [/text-emerald-(?:400|500|600|700)/g, "text-[var(--success)]", "success"],
  [/border-emerald-(?:200|300|800|900)/g, "border-[var(--success)]/25", "success"],
  [/bg-emerald-50(?:\/[0-9]+)?/g, "bg-[var(--success-subtle)]", "success"],

  // Premium (amber / orange)
  [/hover:bg-amber-(?:600|700)/g, "hover:opacity-90", "premium"],
  [/hover:bg-orange-50/g, "hover:bg-[var(--premium-subtle)]", "premium"],
  [/bg-amber-(?:500|600)/g, "bg-[var(--premium)]", "premium"],
  [/text-amber-(?:400|500|600|700)/g, "text-[var(--premium)]", "premium"],
  [/text-orange-(?:500|600|700)/g, "text-[var(--premium)]", "premium"],
  [/border-amber-(?:200|300|800)/g, "border-[var(--premium-border)]", "premium"],
  [/bg-amber-50(?:\/[0-9]+)?/g, "bg-[var(--premium-subtle)]", "premium"],
  [/bg-orange-50(?:\/[0-9]+)?/g, "bg-[var(--premium-subtle)]", "premium"],

  // Radii -> token scale
  [/rounded-xl/g, "rounded-[var(--r-lg)]", "radius"],
  [/rounded-2xl/g, "rounded-[var(--r-xl)]", "radius"],
];

const counts = {};
let changedFiles = 0;

for (const file of files) {
  const before = readFileSync(file, "utf8");
  let after = before;

  for (const [pattern, replacement, label] of RULES) {
    const hits = after.match(pattern);
    if (hits) {
      counts[label] = (counts[label] || 0) + hits.length;
      after = after.replace(pattern, replacement);
    }
  }

  if (after !== before) {
    changedFiles++;
    if (!DRY) writeFileSync(file, after);
  }
}

console.log(DRY ? "DRY RUN" : "APPLIED");
console.log("files changed:", changedFiles);
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(4)}  ${k}`);
}
