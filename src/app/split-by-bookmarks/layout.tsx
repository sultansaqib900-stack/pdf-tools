import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/split-by-bookmarks",
  title: "Split PDF by Bookmarks - Extract Chapters",
  description: "Split PDF documents into separate files based on bookmarks and outline structure. Extract chapters, sections, and parts automatically. Premium feature.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
