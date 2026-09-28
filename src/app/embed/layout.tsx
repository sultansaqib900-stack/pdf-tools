import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/embed",
  title: "PDFTools Embeddable Widget",
  description: "Embed the PDFTools widget on your own site. Tool UI only — not indexed.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
