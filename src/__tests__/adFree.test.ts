import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const PUBLIC = join(ROOT, "public");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(SRC).filter(
  (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes("__tests__"),
);

/** Files whose *comments* legitimately name the removed ad vendor. */
const DOC_ALLOWLIST = new Set<string>([join(SRC, "__tests__", "adFree.test.ts")]);

describe("The site is 100% ad-free", () => {
  it("has no ad-network module, component, or vendored script left", () => {
    for (const path of [
      join(SRC, "lib", "ads.ts"),
      join(SRC, "lib", "monetag.ts"),
      join(SRC, "components", "AdManager.tsx"),
      join(PUBLIC, "tag.txt"),
    ]) {
      expect(existsSync(path), `${path} should have been deleted`).toBe(false);
    }
  });

  it("never references an advertising network in shipping source", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles) {
      if (DOC_ALLOWLIST.has(file)) continue;
      const source = readFileSync(file, "utf8");
      if (/monetag|vignette|adsbygoogle|googlesyndication|propellerads|popads/i.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not ship an ad-network service worker", () => {
    const sw = readFileSync(join(PUBLIC, "sw.js"), "utf8");
    expect(sw).not.toMatch(/monetag|vignette|adsbygoogle|googlesyndication/i);
    // Cache version must be bumped past the ad-era bundles.
    expect(sw).toMatch(/pdftools-v[6-9]"/);
  });

  it("keeps ad hosts out of the Content-Security-Policy", () => {
    const layout = readFileSync(join(SRC, "app", "layout.tsx"), "utf8");
    const csp = layout.match(/Content-Security-Policy[^>]*content="([^"]+)"/)?.[1] ?? "";
    expect(csp).not.toMatch(/monetag|googlesyndication|doubleclick|adservice/i);
    for (const dangerous of ["unsafe-inline", "script-src"]) {
      expect(csp).toContain(dangerous);
    }
  });

  it("does not sell 'ad-free' as a paid-only perk", () => {
    const files = [
      join(SRC, "components", "HomePage.tsx"),
      join(SRC, "lib", "pricing.ts"),
      join(SRC, "app", "premium", "page.tsx"),
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} should not promise an ad-free tier`).not.toMatch(
        /100% Ad-Free experience|Ad-Free experience|no ads with Premium/i,
      );
    }
  });

  it("states the no-advertising policy in the shared footer everywhere", () => {
    const footer = readFileSync(join(SRC, "components", "Footer.tsx"), "utf8");
    expect(footer).toContain("FOOTER_PRIVACY_LINE");
    const site = readFileSync(join(SRC, "lib", "site.ts"), "utf8");
    expect(site).toMatch(/No advertising, no third-party ad scripts, and no ad tracking/);
    expect(site).toMatch(/100% client-side/i);
  });

  it("positions the pricing cards on privacy and larger file limits", () => {
    const home = readFileSync(join(SRC, "components", "HomePage.tsx"), "utf8");
    expect(home).toContain("AD_POLICY.pricingClaim");
    expect(home).toMatch(/Larger \{PREMIUM_FILE_LIMIT_LABEL\} file limits/);
  });
});
