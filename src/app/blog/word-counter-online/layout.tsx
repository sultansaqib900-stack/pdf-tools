import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/word-counter-online",
  title: "Word Counter Online — Free Character & Word Count Tool",
  description: "Count words, characters, sentences, and paragraphs online for free. A fast word counter tool that works entirely in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
