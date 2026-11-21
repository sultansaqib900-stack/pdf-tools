import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { CORE_TOOL_COUNT, PROFESSIONAL_TOOL_COUNT, TOTAL_TOOL_COUNT } from "@/lib/site";
import { FREE_TOOL_COUNT, PREMIUM_TOOL_COUNT, TOOL_CATALOG } from "@/lib/toolCatalog";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__") continue;
        walk(full);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        out.push(full);
      }
    }
  };
  walk(SRC);
  return out;
}

describe("Canonical tool counts", () => {
  it("derives 38 core and 14 professional tools from the catalog", () => {
    expect(CORE_TOOL_COUNT).toBe(38);
    expect(PROFESSIONAL_TOOL_COUNT).toBe(14);
    expect(TOTAL_TOOL_COUNT).toBe(52);
    expect(CORE_TOOL_COUNT).toBe(FREE_TOOL_COUNT);
    expect(PROFESSIONAL_TOOL_COUNT).toBe(PREMIUM_TOOL_COUNT);
    expect(TOOL_CATALOG).toHaveLength(TOTAL_TOOL_COUNT);
  });

  it("has no stale '29 tools' or '13 professional tools' copy anywhere in src", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const source = readFileSync(file, "utf8");
      const patterns = [
        /\b29 (free |core |PDF |professional |premium )?tools\b/i,
        /\b13 (professional|advanced|premium|exclusive|Premium) tools\b/i,
        /\b13-tool\b/i,
        /\b24\+ tools\b/i,
        /\b40\+ (free )?(PDF )?tools\b/i,
        /\b51 (client-side|PDF) tools\b/i,
      ];
      for (const pattern of patterns) {
        if (pattern.test(source)) offenders.push(`${file} matches ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("renders the exact counts on /about", () => {
    const about = readFileSync(join(SRC, "app", "about", "page.tsx"), "utf8");
    expect(about).toContain("CORE_TOOL_COUNT");
    expect(about).toContain("PROFESSIONAL_TOOL_COUNT");
    expect(about).not.toMatch(/\b29\b/);
  });

  it("renders the professional count on the homepage pricing card and the header", () => {
    const home = readFileSync(join(SRC, "components", "HomePage.tsx"), "utf8");
    expect(home).toContain("{PROFESSIONAL_TOOL_COUNT} Professional Tools");
    expect(home).toContain("{CORE_TOOL_COUNT} core tools");

    const header = readFileSync(join(SRC, "components", "Header.tsx"), "utf8");
    expect(header).toContain("PROFESSIONAL_TOOL_COUNT");
    expect(header).not.toMatch(/\b13 Premium Tools\b/);
  });

  it("keeps the 404 and OG image copy on the canonical total", () => {
    const notFound = readFileSync(join(SRC, "app", "not-found.tsx"), "utf8");
    expect(notFound).toContain("TOTAL_TOOL_COUNT");
    expect(notFound).not.toMatch(/\b29\b/);

    const og = readFileSync(join(SRC, "app", "opengraph-image.tsx"), "utf8");
    expect(og).toContain("38 Free Core PDF Tools");
    expect(og).not.toMatch(/\b29 Free PDF Tools\b/);
  });

  it("keeps the Spanish pages on the canonical counts", () => {
    const esHome = readFileSync(join(SRC, "app", "es", "page.tsx"), "utf8");
    const esTools = readFileSync(join(SRC, "app", "es", "tools", "page.tsx"), "utf8");
    for (const source of [esHome, esTools]) {
      expect(source).not.toMatch(/40\+|Más de 40/);
      expect(source).toContain("38");
      expect(source).toContain("14");
    }
  });

  it("has every advertised tool route on disk", () => {
    const missing = TOOL_CATALOG.filter(
      (tool) => !existsSync(join(SRC, "app", tool.href.replace(/^\//, ""), "page.tsx")),
    ).map((tool) => tool.href);
    expect(missing).toEqual([]);
  });
});
