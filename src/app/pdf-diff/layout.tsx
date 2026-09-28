import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-diff",
  title: "Visual Contract & PDF Diff 2.0",
  description: "Compare two PDF files side by side or with an interactive split-screen slider. Highlight additions, deletions, and layout changes.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
