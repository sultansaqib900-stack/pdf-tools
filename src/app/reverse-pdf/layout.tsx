import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/reverse-pdf",
  title: "Reverse PDF Order Online Free — Flip PDF Pages",
  description: "Reverse the page order of any PDF file online for free. Flip your PDF upside down or reverse page sequence. No uploads, 100% private, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
