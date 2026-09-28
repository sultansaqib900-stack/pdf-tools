import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/search-and-redact-pdf",
  title: "How to Search and Redact Words in PDF Online Free",
  description: "Automatically find and redact specific words or phrases across your entire PDF document. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
