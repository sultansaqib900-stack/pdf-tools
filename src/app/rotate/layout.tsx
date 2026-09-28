import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/rotate",
  title: "Rotate PDF Online Free — Rotate Pages",
  description: "Rotate PDF pages online for free. Rotate by 90, 180, or 270 degrees. Fix upside-down or sideways documents instantly in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
