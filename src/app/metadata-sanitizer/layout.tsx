import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/metadata-sanitizer",
  title: "PDF Metadata Sanitizer - Remove Hidden Data from PDF",
  description: "Strip hidden metadata, author info, creation dates, and embedded data from PDFs. Privacy cleaner. Premium.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
