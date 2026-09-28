import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/sign",
  title: "e-Sign PDF Online Free — Draw Signature on PDF",
  description: "Sign PDF documents online for free. Draw your signature with mouse or touch and place it on your PDF. No uploads, 100% free, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
