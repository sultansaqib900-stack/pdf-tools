import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/bulk-rename",
  title: "Bulk Rename PDF Files - Auto-Rename by Metadata",
  description: "Package multiple PDFs with filenames based on title, author, page count, and original filename metadata. Premium.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
