import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/compare-pdfs-online",
  title: "How to Compare Two PDF Files Online Free — Spot Differences Instantly",
  description: "Compare two PDF files side by side and spot text differences instantly. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
