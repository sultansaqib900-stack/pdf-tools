/**
 * HowTo structured data is deprecated by Google (and never rendered visibly).
 * Kept as a no-op so existing call sites compile; it emits NO JSON-LD.
 * Do not reintroduce HowTo markup — use the visible step-by-step sections in
 * the page body instead (see docs/seo-audit.md Phase 4).
 */
export default function HowToJsonLd(_props: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return null;
}
