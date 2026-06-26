import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Word Counter Online — Free Character & Word Count Tool | PDFTools",
  description: "Count words, characters, sentences, and paragraphs online for free. A fast word counter tool that works entirely in your browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
