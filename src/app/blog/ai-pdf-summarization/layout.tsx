import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/ai-pdf-summarization",
  title: "How to Summarize PDFs with AI — Free Online PDF Summary Tool",
  description: "Learn how to use AI to summarize PDF documents online free. Extract key points, generate summaries, and save hours of reading time.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
