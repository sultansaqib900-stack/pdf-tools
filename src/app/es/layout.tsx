import Script from "next/script";

/**
 * Spanish-section layout.
 *
 * Per-page metadata (canonical, hreflang, titles) is provided by each Spanish
 * page's own layout via `buildMetadata` so nothing inherits a wrong canonical.
 * `/es` home metadata lives in `./page.tsx`.
 *
 * Note: this layout deliberately exports NO metadata — an `absolute` title
 * here would suppress the root `title.template` for every /es child.
 *
 * The root `<html lang="en">` cannot be changed from a nested layout, so this
 * layout sets `lang="es"` on the rendered subtree and syncs the document
 * element for assistive tech and search engines once the route is active. The
 * inline script runs before paint so the attribute is correct on first render.
 */
export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" data-locale="es">
      <Script id="es-document-lang" strategy="beforeInteractive">
        {`(function(){try{var h=document.documentElement;h.setAttribute('lang','es');}catch(e){}})();`}
      </Script>
      {children}
    </div>
  );
}
