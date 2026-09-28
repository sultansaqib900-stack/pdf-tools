import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/search-redact",
  title: "Search & Redact PDF - Auto-Redact Multiple Words",
  description: "Search for specific words or phrases in a PDF and redact all occurrences automatically. Bulk redaction tool. Premium.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
