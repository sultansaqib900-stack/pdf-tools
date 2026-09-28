import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/invert-pdf-colors",
  title: "How to Invert PDF Colors Online Free — Dark Mode & High Contrast",
  description: "Convert PDF colors to dark mode, grayscale, or high-contrast for better readability. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
