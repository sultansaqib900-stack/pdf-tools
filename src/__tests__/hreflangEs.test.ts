import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { buildMetadata, ES_SLUGS, SITE_URL } from "@/lib/seo";
import { spanishRoutes } from "@/lib/i18n";
import { ES_HEADER_LINKS, ES_FOOTER_LABELS, esFooterLabel } from "@/lib/es-nav";
import { existsSync } from "fs";

const ROOT = process.cwd();
const APP = join(ROOT, "src", "app");

const languagesOf = (path: string, locale: "en" | "es") => {
  const meta = buildMetadata({ path, title: "t", description: "d", locale });
  return (meta.alternates?.languages ?? {}) as Record<string, string>;
};

describe("Spanish hreflang", () => {
  it("emits en, es and x-default for the Spanish home page", () => {
    const langs = languagesOf("/es", "es");
    expect(langs.en).toBe(SITE_URL);
    expect(langs.es).toBe(`${SITE_URL}/es`);
    expect(langs["x-default"]).toBeDefined();
  });

  it("emits the same alternate set on the English and Spanish version of every translated page", () => {
    for (const route of spanishRoutes) {
      const enPath = route === "" ? "/" : `/${route}`;
      const esPath = route === "" ? "/es" : `/es/${route}`;
      const en = languagesOf(enPath, "en");
      const es = languagesOf(esPath, "es");

      for (const key of ["en", "es", "x-default"] as const) {
        expect(en[key], `${enPath} missing hreflang ${key}`).toBeDefined();
        expect(es[key], `${esPath} missing hreflang ${key}`).toBeDefined();
        // Reciprocity: both pages must point at the same pair of URLs.
        expect(es[key], `${esPath} hreflang ${key} differs from ${enPath}`).toBe(en[key]);
      }
      expect(en.es.endsWith(esPath === "/" ? "/es" : esPath)).toBe(true);
      expect(es.en.endsWith(enPath === "/" ? ".xyz" : enPath)).toBe(true);
    }
  });

  it("never advertises a Spanish alternate for an untranslated page", () => {
    for (const path of ["/blog/how-to-merge-pdf", "/premium", "/studio", "/about"]) {
      expect(languagesOf(path, "en").es).toBeUndefined();
    }
  });

  it("keeps the Spanish route registry and seo slugs in sync with disk", () => {
    for (const route of spanishRoutes) {
      const dir = route === "" ? join(APP, "es") : join(APP, "es", route);
      expect(existsSync(join(dir, "page.tsx")), `/es/${route} has no page`).toBe(true);
    }
    expect(new Set(ES_SLUGS)).toEqual(new Set(spanishRoutes));
  });

  it("sets lang=es on the Spanish subtree", () => {
    const layout = readFileSync(join(APP, "es", "layout.tsx"), "utf8");
    expect(layout).toContain('lang="es"');
    expect(layout).toContain("documentElement");
  });
});

describe("Spanish navigation labels", () => {
  it("contains Spanish text for every header label", () => {
    for (const [key, value] of Object.entries(ES_HEADER_LINKS)) {
      if (key.toLowerCase().includes("switchtospanish")) continue; // intentionally Spanish already
      if (key === "switchToEnglish") continue; // intentionally English
      expect(value.trim().length, `${key} is empty`).toBeGreaterThan(0);
    }
  });

  it("labels the core header actions in Spanish, not English", () => {
    expect(ES_HEADER_LINKS.allTools).toBe("Todas las herramientas");
    expect(ES_HEADER_LINKS.signIn).toBe("Iniciar sesión");
    expect(ES_HEADER_LINKS.goPremium).toBe("Ir a Premium");
    expect(ES_HEADER_LINKS.resources).toBe("Recursos");
    expect(ES_HEADER_LINKS.popularTools).toBe("Herramientas populares");
  });

  it("translates every footer link that has a Spanish label entry", () => {
    for (const [href, label] of Object.entries(ES_FOOTER_LABELS)) {
      expect(label.trim().length, `${href} label is empty`).toBeGreaterThan(0);
      // Brand names legitimately stay as-is.
      if (/PDF|Studio|iLovePDF|SmallPDF|Adobe|Guardian|OCR/i.test(label)) continue;
      expect(label, `${href} is still English`).not.toMatch(
        /^(All|About Us|Contact Support|Privacy Policy|Terms of Service|Q&A|Company)$/,
      );
    }
  });

  it("falls back to the English label for an unmapped footer link", () => {
    expect(esFooterLabel("/totally-unmapped", "Fallback")).toBe("Fallback");
    expect(esFooterLabel("/compress", "Compress PDF")).toBe("Comprimir PDF");
  });

  it("keeps every Spanish nav link pointing at a route that exists", () => {
    const broken: string[] = [];
    for (const href of Object.keys(ES_FOOTER_LABELS)) {
      const dir = join(APP, href.replace(/^\//, ""));
      if (!existsSync(join(dir, "page.tsx"))) broken.push(href);
    }
    // Deduplicate while preserving order for a readable failure message.
    expect([...new Set(broken)]).toEqual([]);
  });
});
