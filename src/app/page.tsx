import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import HomePage from "@/components/HomePage";

/**
 * Homepage metadata lives here (server component) because the page itself is a
 * client component and cannot export metadata. The root layout intentionally
 * carries NO page-specific title/description/canonical/og:url — every page
 * provides its own via `buildMetadata` so nothing inherits the homepage tags.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    path: "/",
    title: "PDFTools: Free Online PDF Tools",
    description:
      "38 core PDF tools that are free and unlimited, plus 14 professional tools — led by the PDF Studio pipeline — for AI, automation, secure redaction, legal, and bulk workflows. Most file processing happens locally in your browser.",
    hasEs: true,
  }),
  // The homepage title IS the brand default (no ` | PDFTools` template suffix).
  title: { absolute: "PDFTools: Free Online PDF Tools" },
};

export default function Page() {
  return <HomePage />;
}
