export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

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
    "usage.remaining": "Free uses remaining today",
    "usage.unlimited": "Unlimited",
    "usage.upgrade": "Upgrade for unlimited access",
    "premium.badge": "Premium",
    "premium.feature": "Premium Feature",
    "premium.cta": "Upgrade to Premium",
    "search.placeholder": "Search tools...",
    "ad.label": "Advertisement",
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
    "ad.label": "Anuncio",
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
