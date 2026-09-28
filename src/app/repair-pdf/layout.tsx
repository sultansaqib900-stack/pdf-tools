import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/repair-pdf",
  title: "Repair PDF Online Free — Rebuild Broken PDF Structure",
  description: "Re-serialize and repair readable PDF files that show structure errors. Rebuilds object streams and cross-reference tables in your browser — free and private.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
