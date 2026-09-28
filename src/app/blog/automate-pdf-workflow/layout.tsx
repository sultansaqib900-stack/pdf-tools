import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/automate-pdf-workflow",
  title: "How to Automate PDF Workflows — Batch Processing & Automation",
  description: "Learn how to automate PDF processing workflows. Batch compress, watermark, merge, and rename PDFs automatically. Save hours of manual work.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
