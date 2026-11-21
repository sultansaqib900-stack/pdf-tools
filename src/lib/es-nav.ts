/**
 * Spanish navigation dictionary for `/es` routes.
 *
 * The root `Header` and `Footer` are shared by both locales, so they read their
 * labels from here when `pathLocale(pathname) === "es"`. Every link points at a
 * route that really exists (English tool routes for untranslated tools, `/es/...`
 * for the hand-written Spanish pages) — `src/__tests__/spanishNav.test.ts`
 * enforces both the labels and the link targets.
 */
export interface EsNavLink {
  href: string;
  es: string;
  en: string;
}

/** Primary header links (desktop + mobile). */
export const ES_HEADER_LINKS = {
  allTools: "Todas las herramientas",
  toolsMenuTitle: "Suite completa de herramientas PDF",
  toolsMenuSubtitle: "Las herramientas principales se procesan en tu navegador.",
  viewAllTools: "Ver las 52 herramientas",
  studio: "⚡ PDF Studio",
  premium: "⭐ Premium",
  comparePlans: "Comparar planes",
  premiumActive: "✓ Premium activo — Ir al panel",
  viewPremiumPlans: "Ver planes y precios →",
  resources: "Recursos",
  blog: "Blog",
  guides: "Guías",
  vsAdobe: "vs Adobe",
  signIn: "Iniciar sesión",
  goPremium: "Ir a Premium",
  switchToEnglish: "Ver esta página en inglés",
  switchToSpanish: "Ver esta página en español",
  toggleMenu: "Abrir o cerrar el menú de navegación",
  popularTools: "Herramientas populares",
  premiumTools: "Herramientas profesionales",
  qa: "Preguntas frecuentes",
  spanishHome: "🇪🇸 Inicio en español",
  spanishTools: "🇪🇸 Herramientas en español",
  languageLabel: "Idioma",
} as const;

/** Footer column headings. */
export const ES_FOOTER_HEADINGS = {
  coreTools: "Herramientas principales",
  editSecurity: "Editar y proteger",
  premium: "⭐ Suite profesional",
  workflows: "Flujos de trabajo y guías",
  company: "Empresa",
} as const;

/** Footer link labels, keyed by href. Falls back to the English label. */
export const ES_FOOTER_LABELS: Record<string, string> = {
  "/recipes": "⚡ Recetas PDF (macros)",
  "/pii-guardian": "🛡️ PII Guardian",
  "/compress": "Comprimir PDF",
  "/merge": "Unir PDF",
  "/split": "Dividir PDF",
  "/image-to-pdf": "Imagen a PDF",
  "/pdf-to-images": "PDF a imágenes",
  "/pdf-to-word": "PDF a Word",
  "/word-to-pdf": "Word a PDF",
  "/pdf-to-excel": "PDF a Excel",
  "/ocr-pdf": "OCR PDF",
  "/edit-pdf": "Editar PDF",
  "/sign": "Firmar PDF",
  "/protect": "Proteger PDF",
  "/unlock": "Desbloquear PDF",
  "/watermark": "Marca de agua",
  "/redact": "Redactar PDF",
  "/delete-pages": "Eliminar páginas",
  "/organize": "Organizar páginas",
  "/rotate": "Rotar PDF",
  "/crop": "Recortar PDF",
  "/studio": "⚡ PDF Studio (flujo de trabajo)",
  "/pdf-diff": "Comparar PDF (Diff)",
  "/bates-numbering": "Numeración Bates",
  "/certificate-generator": "Generador de certificados",
  "/pdf-to-audio": "PDF a audio (TTS)",
  "/form-data-extract": "Datos de formulario a CSV",
  "/bulk-rename": "Renombrar en lote",
  "/booklet": "Creador de folletos",
  "/search-redact": "Buscar y redactar",
  "/vault": "Bóveda cifrada",
  "/split-by-bookmarks": "Dividir por marcadores",
  "/pdf-tools-for-students": "Para estudiantes",
  "/pdf-tools-for-lawyers": "Para abogados",
  "/pdf-tools-for-teachers": "Para docentes",
  "/pdf-tools-for-business": "Para empresas",
  "/blog": "Todas las guías del blog",
  "/ultimate-guide-to-pdf-editing": "Guía definitiva de PDF",
  "/vs/adobe-acrobat": "⚔️ vs Adobe Acrobat Pro",
  "/vs/ilovepdf": "⚔️ vs iLovePDF",
  "/vs/smallpdf": "⚔️ vs SmallPDF",
  "/es": "🇪🇸 Español (Inicio)",
  "/es/tools": "🇪🇸 Herramientas PDF",
  "/about": "Sobre nosotros",
  "/contact": "Contacto y soporte",
  "/qa": "Preguntas frecuentes",
  "/privacy": "Política de privacidad",
  "/terms": "Términos del servicio",
  "/sitemap": "Mapa del sitio",
  "/embed": "Widget integrable",
  "/premium": "⭐ Actualizar a Premium",
  "/dashboard": "✓ Premium activo",
};

/** Footer trust/legal copy per locale. */
export const ES_FOOTER_COPY = {
  trustBadge: "🛡️ 100% privado desde el primer uso y sin rastreo publicitario",
  trustDetail:
    "38 herramientas PDF gratuitas + 14 herramientas profesionales · el procesamiento principal ocurre en tu navegador",
  privacyLine:
    "Sin publicidad, sin scripts publicitarios de terceros y sin rastreo publicitario. Las herramientas PDF principales se ejecutan 100% en tu navegador — tus archivos nunca se suben a nuestros servidores.",
  privacyPolicy: "Política de privacidad",
  rights: "Todos los derechos reservados.",
  browseTools: "Ver herramientas",
} as const;

/** Look up a Spanish footer label, falling back to the supplied English one. */
export function esFooterLabel(href: string, fallback: string): string {
  return ES_FOOTER_LABELS[href] ?? fallback;
}
