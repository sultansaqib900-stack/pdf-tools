import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/clean-pdf-metadata",
  title: "How to Remove Metadata from PDF Online Free — Clean Your Documents",
  description: "Strip hidden metadata from PDF files before sharing documents publicly. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
