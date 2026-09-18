import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  hasSpanishVersion,
  localeSwitchHref,
  locales,
  localizePath,
  normalizePath,
  pathLocale,
  spanishRoutes,
} from "@/lib/i18n";

const APP_DIR = join(process.cwd(), "src", "app");
const ES_DIR = join(APP_DIR, "es");

/** Directory names inside src/app/es — i.e. the pages that really exist. */
function existingSpanishRoutes(): string[] {
  return readdirSync(ES_DIR)
    .filter((entry) => statSync(join(ES_DIR, entry)).isDirectory())
    .sort();
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".tsx") || full.endsWith(".ts") ? [full] : [];
  });
}

describe("Spanish route registry", () => {
  it("matches the pages that actually exist under src/app/es", () => {
    const declared = spanishRoutes.filter((route) => route !== "").slice().sort();
    expect(declared).toEqual(existingSpanishRoutes());
  });

  it("recognizes the home page as translated", () => {
    expect(hasSpanishVersion("/")).toBe(true);
    expect(hasSpanishVersion("/es")).toBe(true);
  });

  it("lists only locales that have translations wired up", () => {
    expect(locales).toContain("es");
    expect(pathLocale("/es/merge")).toBe("es");
    expect(pathLocale("/merge")).toBe("en");
  });
});

describe("normalizePath", () => {
  it("canonicalizes locale prefixes, trailing slashes and query strings", () => {
    expect(normalizePath("/es")).toBe("/");
    expect(normalizePath("/es/")).toBe("/");
    expect(normalizePath("/es/merge/")).toBe("/merge");
    expect(normalizePath("/merge?src=nav")).toBe("/merge");
    expect(normalizePath("/merge#top")).toBe("/merge");
    expect(normalizePath(undefined)).toBe("/");
  });

  it("leaves non-locale paths that merely start with 'es' alone", () => {
    expect(normalizePath("/espanol-tools")).toBe("/espanol-tools");
  });
});

describe("localizePath", () => {
  it("never generates a Spanish URL that has no page", () => {
    for (const route of spanishRoutes) {
      const href = localizePath(route === "" ? "/" : `/${route}`, "es");
      expect(hasSpanishVersion(href), `${href} has no Spanish page`).toBe(true);
    }
  });

  it("falls back to /es when no translation exists", () => {
    expect(localizePath("/studio", "es")).toBe("/es");
    expect(localizePath("/blog/some-post", "es")).toBe("/es");
    expect(localizePath("/for/lawyers", "es")).toBe("/es");
    expect(localizePath("/premium", "es")).toBe("/es");
  });

  it("maps translated pages to their Spanish counterpart", () => {
    expect(localizePath("/", "es")).toBe("/es");
    expect(localizePath("/merge", "es")).toBe("/es/merge");
    expect(localizePath("/tools", "es")).toBe("/es/tools");
  });

  it("resolves Spanish pages back to English", () => {
    expect(localizePath("/es/merge", "en")).toBe("/merge");
    expect(localizePath("/es", "en")).toBe("/");
  });
});

describe("localeSwitchHref", () => {
  it("never links to a missing Spanish page from any English page", () => {
    const englishRoutes = [
      "/",
      "/tools",
      "/studio",
      "/premium",
      "/blog",
      "/blog/some-post",
      "/for/lawyers",
      "/vs/adobe-acrobat",
      "/qa",
      "/merge",
    ];
    for (const route of englishRoutes) {
      const href = localeSwitchHref(route, "en");
      expect(href.startsWith("/es"), `${route} -> ${href}`).toBe(true);
      expect(hasSpanishVersion(href), `${route} -> ${href} is a 404`).toBe(true);
    }
  });

  it("always links Spanish pages back to a real English page", () => {
    for (const route of spanishRoutes) {
      const path = route === "" ? "/es" : `/es/${route}`;
      const href = localeSwitchHref(path, "es");
      expect(href.startsWith("/es")).toBe(false);
      expect(href === "/" || href.startsWith("/")).toBe(true);
    }
  });
});

describe("hard-coded locale links in source", () => {
  it("only points /es/... links at translated routes", () => {
    const offenders: string[] = [];
    for (const file of walk(join(process.cwd(), "src"))) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
      const source = readFileSync(file, "utf8");
      // Matches both JSX attributes (`href="/es/x"`) and route objects
      // (`href: "/es/x"`).
      for (const match of source.matchAll(/href\s*[:=]\s*["'](\/es(?:\/[^"'`]*)?)["']/g)) {
        if (!hasSpanishVersion(match[1])) offenders.push(`${file}: ${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
