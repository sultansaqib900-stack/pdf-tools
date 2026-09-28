import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/split",
  title: "Split PDF Online Free — Extract Pages",
  description: "Split PDF files online for free. Extract specific pages or split every page into separate files. 100% free, no uploads, all in your browser.",
  image: "https://allaboutpdfediting.xyz/split/opengraph-image",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
