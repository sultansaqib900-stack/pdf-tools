import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/resize",
  title: "Resize PDF Pages Online Free — Change PDF Size",
  description: "Change page size of PDF documents online for free. Choose A4, Letter, Legal, or custom dimensions. No uploads, 100% free, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
