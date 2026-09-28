import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/redact-pdf-for-foia-request",
  title: "How to Redact a PDF for a FOIA Request — Step-by-Step",
  description: "A careful PDF redaction workflow for FOIA records: preserve originals, mark authorized material, apply real redactions, and inspect every page before release.",
  type: "article",
  publishedTime: "2026-09-28",
  modifiedTime: "2026-09-28",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
