import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { BLOG_TOOL_CTAS } from "@/lib/blog-tools";

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, "src", "app", "blog");
const APP_DIR = join(ROOT, "src", "app");

const blogSlugs = readdirSync(BLOG_DIR).filter((entry) =>
  statSync(join(BLOG_DIR, entry)).isDirectory(),
);

describe("Blog → tool CTAs", () => {
  it("maps every blog post to a tool route", () => {
    const missing = blogSlugs.filter((slug) => !BLOG_TOOL_CTAS[slug]);
    expect(missing, `Blog posts without a tool CTA mapping: ${missing.join(", ")}`).toEqual([]);
  });

  it("has no stale mapping for a deleted post", () => {
    const stale = Object.keys(BLOG_TOOL_CTAS).filter((slug) => !blogSlugs.includes(slug));
    expect(stale, `Mappings without a blog post: ${stale.join(", ")}`).toEqual([]);
  });

  it("only links to tool routes that exist on disk", () => {
    const broken: string[] = [];
    for (const [slug, cta] of Object.entries(BLOG_TOOL_CTAS)) {
      expect(cta.href.startsWith("/"), `${slug}: ${cta.href}`).toBe(true);
      expect(cta.href.startsWith("/blog"), `${slug} must link to a tool, not a blog`).toBe(false);
      const dir = join(APP_DIR, cta.href.replace(/^\//, ""));
      if (!existsSync(join(dir, "page.tsx"))) broken.push(`${slug} -> ${cta.href}`);
    }
    expect(broken).toEqual([]);
  });

  it("gives every post a non-empty blurb and at least two bullets", () => {
    const weak = Object.entries(BLOG_TOOL_CTAS)
      .filter(([, cta]) => cta.blurb.trim().length < 20 || cta.bullets.length < 2)
      .map(([slug]) => slug);
    expect(weak).toEqual([]);
  });

  it("renders both a top and a bottom CTA in every article", () => {
    const offenders: string[] = [];
    for (const slug of blogSlugs) {
      const source = readFileSync(join(BLOG_DIR, slug, "page.tsx"), "utf8");
      if (!source.includes(`<BlogToolCta slug="${slug}" variant="top" />`)) {
        offenders.push(`${slug}: missing top CTA`);
      }
      if (!source.includes(`<BlogToolCta slug="${slug}" variant="bottom" />`)) {
        offenders.push(`${slug}: missing bottom CTA`);
      }
      if (!source.includes('from "@/components/BlogToolCta"')) {
        offenders.push(`${slug}: missing import`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("places the top CTA after the title, before the first body paragraph", () => {
    const offenders: string[] = [];
    for (const slug of blogSlugs) {
      const source = readFileSync(join(BLOG_DIR, slug, "page.tsx"), "utf8");
      const h1 = source.indexOf("<h1");
      const top = source.indexOf(`variant="top"`);
      expect(h1, `${slug} has no <h1>`).toBeGreaterThan(-1);
      if (top < h1) offenders.push(`${slug}: top CTA rendered before the title`);
    }
    expect(offenders).toEqual([]);
  });
});
