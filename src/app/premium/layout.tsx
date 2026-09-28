import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/premium",
  title: "Premium Pricing & Plans",
  description: "Compare PDFTools Premium plans for heavy and professional workflows. Free core tools stay unlimited; Premium unlocks higher file-size limits and pro pipelines.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
