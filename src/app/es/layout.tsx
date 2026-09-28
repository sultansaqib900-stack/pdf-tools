/**
 * Spanish-section layout. Per-page metadata (canonical, hreflang, titles) is
 * provided by each Spanish page's own layout via `buildMetadata` so nothing
 * inherits a wrong canonical. `/es` home metadata lives in `./page.tsx`.
 *
 * Note: this layout deliberately exports NO metadata — an `absolute` title
 * here would suppress the root `title.template` for every /es child.
 */

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
