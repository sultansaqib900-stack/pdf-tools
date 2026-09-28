import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  path: "/blog/rotate-pdf-pages-online",
  title: "How to Rotate PDF Pages Online Free — Fix Upside-Down Documents",
  description: "Rotate PDF pages online for free. Fix upside-down or sideways PDF pages by rotating 90, 180, or 270 degrees — all in your browser, no uploads.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
