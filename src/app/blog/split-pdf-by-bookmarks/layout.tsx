import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/split-pdf-by-bookmarks",
  title: "How to Split a PDF by Bookmarks — Extract Chapters and Sections",
  description: "Learn how to split a PDF into separate files using bookmarks and outline structure. Extract chapters, sections, and parts automatically.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
