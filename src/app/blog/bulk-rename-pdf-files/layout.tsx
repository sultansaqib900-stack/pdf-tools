import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/bulk-rename-pdf-files",
  title: "How to Bulk Rename PDF Files by Metadata Online Free",
  description: "Rename multiple PDF files at once using embedded metadata. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
