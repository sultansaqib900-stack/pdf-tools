import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/annotate-pdf-online",
  title: "How to Annotate PDF Online Free — Highlight, Comment & Markup",
  description: "Step-by-step tutorial on how to highlight, underline, and mark up PDF files online. Learn how to review documents and add comments without uploading files.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
