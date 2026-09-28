import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/bates-numbering",
  title: "Add Bates Numbering to PDF - Sequential Page Numbers",
  description: "Add sequential Bates numbers, letters, or custom labels to every page of your PDF. Perfect for legal documents, discovery, and document indexing. Premium feature.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
