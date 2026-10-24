import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { readdirSync, statSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const APP_DIR = join(process.cwd(), "src", "app");
const BLOG_DIR = join(APP_DIR, "blog");

describe("Sitemap integrity", () => {
  it("has no duplicate URLs", () => {
    const map = sitemap();
    const urls = map.map((entry) => entry.url);
    const uniqueUrls = new Set(urls);
    const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
    expect(duplicates, `Found duplicate URLs in sitemap: ${JSON.stringify(duplicates)}`).toEqual([]);
    expect(urls.length).toBe(uniqueUrls.size);
  });

  it("every URL is valid and uses the canonical https scheme", () => {
    const map = sitemap();
    for (const entry of map) {
      expect(entry.url.startsWith("https://allaboutpdfediting.xyz")).toBe(true);
      expect(entry.url.endsWith("/")).toBe(entry.url === "https://allaboutpdfediting.xyz/");
    }
  });

  it("every sitemap entry corresponds to an existing route on disk", () => {
    const map = sitemap();
    for (const entry of map) {
      const path = entry.url.replace("https://allaboutpdfediting.xyz", "") || "/";
      if (path.startsWith("/error/")) continue;
      const diskPath = path === "/" ? APP_DIR : join(APP_DIR, path.replace(/^\//, ""));
      const hasPage = existsSync(join(diskPath, "page.tsx"));
      expect(hasPage, `Sitemap URL ${entry.url} has no page.tsx at ${diskPath}`).toBe(true);
    }
  });

  it("every blog directory has a corresponding sitemap entry", () => {
    const map = sitemap();
    const urls = new Set(map.map((e) => e.url));
    const blogEntries = readdirSync(BLOG_DIR).filter((f) => statSync(join(BLOG_DIR, f)).isDirectory());
    for (const slug of blogEntries) {
      const url = `https://allaboutpdfediting.xyz/blog/${slug}`;
      expect(urls.has(url), `Blog post ${slug} is missing from sitemap`).toBe(true);
    }
  });
});

describe("Robots.txt rules", () => {
  it("disallows private and client-only utility routes", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallowed = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    expect(disallowed).toContain("/api/");
    expect(disallowed).toContain("/vault");
    expect(disallowed).toContain("/dashboard");
    expect(disallowed).toContain("/login");
    expect(disallowed).toContain("/signup");
    expect(disallowed).toContain("/embed");
  });

  it("points to the canonical sitemap URL", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://allaboutpdfediting.xyz/sitemap.xml");
  });
});

describe("Metadata & SEO Standards", () => {
  it("ensures all blog posts have metadata defined", () => {
    const blogEntries = readdirSync(BLOG_DIR).filter((f) => statSync(join(BLOG_DIR, f)).isDirectory());
    for (const slug of blogEntries) {
      const dir = join(BLOG_DIR, slug);
      const pageFile = join(dir, "page.tsx");
      const layoutFile = join(dir, "layout.tsx");

      const hasLayoutMeta = existsSync(layoutFile) && readFileSync(layoutFile, "utf8").includes("buildMetadata");
      const hasPageMeta = existsSync(pageFile) && readFileSync(pageFile, "utf8").includes("buildMetadata");

      expect(
        hasLayoutMeta || hasPageMeta,
        `Blog post /blog/${slug} has neither layout.tsx metadata nor page.tsx metadata`
      ).toBe(true);
    }
  });

  it("checks for unique titles and descriptions across metadata files", () => {
    function walk(dir: string): string[] {
      return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry === "for") return []; // programmatic matrix
          return walk(full);
        }
        return full.endsWith(".tsx") || full.endsWith(".ts") ? [full] : [];
      });
    }

    const files = walk(APP_DIR);
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    const duplicateTitles: string[] = [];
    const duplicateDescriptions: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (!content.includes("buildMetadata")) continue;

      const titleMatch = content.match(/title:\s*["'`]([^"'`]+)["'`]/);
      const descMatch = content.match(/description:\s*["'`]([^"'`]+)["'`]/);

      if (titleMatch) {
        const title = titleMatch[1].trim();
        if (titles.has(title) && titles.get(title) !== file) {
          const prevFile = titles.get(title)!;
          const sameDir = join(file, "..") === join(prevFile, "..");
          if (!sameDir) {
            duplicateTitles.push(`"${title}" in ${file} and ${prevFile}`);
          }
        } else {
          titles.set(title, file);
        }
      }

      if (descMatch) {
        const desc = descMatch[1].trim();
        if (descriptions.has(desc) && descriptions.get(desc) !== file) {
          const prevFile = descriptions.get(desc)!;
          const sameDir = join(file, "..") === join(prevFile, "..");
          if (!sameDir) {
            duplicateDescriptions.push(`"${desc}" in ${file} and ${prevFile}`);
          }
        } else {
          descriptions.set(desc, file);
        }
      }
    }

    expect(duplicateTitles, `Found duplicate titles: ${JSON.stringify(duplicateTitles, null, 2)}`).toEqual([]);
    expect(duplicateDescriptions, `Found duplicate descriptions: ${JSON.stringify(duplicateDescriptions, null, 2)}`).toEqual([]);
  });

  it("verifies all internal href links point to real routes", () => {
    function walk(dir: string): string[] {
      return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) return walk(full);
        return full.endsWith(".tsx") || full.endsWith(".ts") ? [full] : [];
      });
    }

    const files = walk(join(process.cwd(), "src"));
    const internalLinks = new Set<string>();
    for (const f of files) {
      if (f.includes(".test.")) continue;
      const content = readFileSync(f, "utf8");
      for (const match of content.matchAll(/href\s*[:=]\s*["'](\/[a-zA-Z0-9_\-\/]+)["']/g)) {
        internalLinks.add(match[1]);
      }
    }

    const brokenLinks: string[] = [];
    for (const link of internalLinks) {
      if (
        link.startsWith("/api/") ||
        link === "/" ||
        link === "/feed.xml" ||
        link === "/sitemap.xml" ||
        link === "/manifest.json" ||
        link === "/icon.svg" ||
        link === "/opengraph-image" ||
        link.startsWith("/for/") ||
        link.startsWith("/error/")
      ) {
        continue;
      }
      const clean = link.replace(/\/$/, "");
      const dirPath = join(APP_DIR, clean.replace(/^\//, ""));
      const hasPage = existsSync(join(dirPath, "page.tsx")) || existsSync(dirPath + ".tsx");
      if (!hasPage) {
        brokenLinks.push(link);
      }
    }

    expect(brokenLinks, `Found broken internal links: ${JSON.stringify(brokenLinks)}`).toEqual([]);
  });
});
