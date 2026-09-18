export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/**
 * Every route that has a hand-written Spanish page under `src/app/es`.
 *
 * This is the single source of truth for locale routing: nothing outside this
 * list may be emitted as `/es/...`, because those URLs do not exist and would
 * resolve to a 404. Untranslated pages fall back to the Spanish home page.
 *
 * `src/__tests__/i18nRoutes.test.ts` asserts this list stays in sync with the
 * actual directories in `src/app/es`.
 */
export const spanishRoutes = [
  "",
  "tools",
  "compress",
  "merge",
  "split",
  "image-to-pdf",
  "edit-pdf",
] as const;

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

type TranslationDict = Record<string, string>;

const translations: Record<Locale, TranslationDict> = {
  en: {
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.premium": "Premium",
    "nav.blog": "Blog",
    "hero.title": "Free Online PDF Tools",
    "hero.subtitle": "40+ free PDF tools. Compress, merge, split, edit, and more. All in your browser — no uploads, no servers.",
    "hero.cta": "Explore Tools",
    "hero.cta.premium": "Go Premium",
    "compress.title": "Compress PDF",
    "compress.desc": "Reduce PDF file size while maintaining quality.",
    "merge.title": "Merge PDF",
    "merge.desc": "Combine multiple PDFs into one document.",
    "split.title": "Split PDF",
    "split.desc": "Extract pages or split into separate files.",
    "footer.copyright": "© 2024 PDFTools. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact",
    "theme.midnight": "Midnight",
    "theme.amber": "Amber",
    "theme.ocean": "Ocean",
    "usage.remaining": "Free trial files remaining (professional tools)",
    "usage.unlimited": "Unlimited",
    "usage.upgrade": "Upgrade for unlimited access",
    "premium.badge": "Premium",
    "premium.feature": "Premium Feature",
    "premium.cta": "Upgrade to Premium",
    "search.placeholder": "Search tools...",
  },
  es: {
    "nav.home": "Inicio",
    "nav.tools": "Herramientas",
    "nav.premium": "Premium",
    "nav.blog": "Blog",
    "hero.title": "Herramientas PDF Gratuitas",
    "hero.subtitle": "Más de 40 herramientas PDF gratuitas. Comprime, une, divide, edita y más. Todo en tu navegador — sin subidas, sin servidores.",
    "hero.cta": "Explorar Herramientas",
    "hero.cta.premium": "Ir a Premium",
    "compress.title": "Comprimir PDF",
    "compress.desc": "Reduce el tamaño del PDF sin perder calidad.",
    "merge.title": "Unir PDF",
    "merge.desc": "Combina varios PDF en un solo documento.",
    "split.title": "Dividir PDF",
    "split.desc": "Extrae páginas o divide en archivos separados.",
    "footer.copyright": "© 2024 PDFTools. Todos los derechos reservados.",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos del Servicio",
    "footer.contact": "Contacto",
    "theme.midnight": "Medianoche",
    "theme.amber": "Ámbar",
    "theme.ocean": "Océano",
    "usage.remaining": "Usos gratuitos restantes hoy",
    "usage.unlimited": "Ilimitado",
    "usage.upgrade": "Actualiza para acceso ilimitado",
    "premium.badge": "Premium",
    "premium.feature": "Función Premium",
    "premium.cta": "Actualizar a Premium",
    "search.placeholder": "Buscar herramientas...",
  },
};

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key;
}

export function t(locale: Locale, key: string): string {
  return getTranslation(locale, key);
}

export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale;
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred === "es") return "es";
  return defaultLocale;
}

/**
 * Normalize an app-router pathname to its canonical English form: no query or
 * hash, no trailing slash, and no `/es` locale prefix.
 *
 * `/es/` -> `/`, `/es/merge/` -> `/merge`, `/merge?x=1` -> `/merge`.
 */
export function normalizePath(pathname?: string | null): string {
  if (!pathname) return "/";
  const pathOnly = pathname.split("?")[0].split("#")[0];
  const withoutLocale =
    pathOnly === "/es" || pathOnly.startsWith("/es/") ? pathOnly.slice(3) : pathOnly;
  const collapsed = withoutLocale.replace(/\/+$/, "");
  return collapsed === "" ? "/" : collapsed;
}

/** Whether a Spanish translation exists for the given (English) pathname. */
export function hasSpanishVersion(pathname?: string | null): boolean {
  const clean = normalizePath(pathname);
  if (clean === "/") return true;
  return (spanishRoutes as readonly string[]).includes(clean.slice(1));
}

/**
 * Resolve the URL of `pathname` (in either locale) for the requested locale.
 *
 * Spanish URLs are only produced for routes that actually exist; anything else
 * falls back to `/es` so a language switch can never lead to a 404.
 */
export function localizePath(pathname: string | null | undefined, locale: Locale): string {
  const clean = normalizePath(pathname);
  if (locale === defaultLocale) return clean;
  if (!hasSpanishVersion(clean)) return "/es";
  return clean === "/" ? "/es" : `/es${clean}`;
}

/** Target URL for switching the language toggle on the current page. */
export function localeSwitchHref(pathname: string | null | undefined, current: Locale): string {
  return localizePath(pathname, current === "es" ? defaultLocale : "es");
}

/** The locale a pathname belongs to, based on its `/es` prefix. */
export function pathLocale(pathname?: string | null): Locale {
  if (!pathname) return defaultLocale;
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : defaultLocale;
}
