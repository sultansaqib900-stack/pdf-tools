import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/compress-scanned-pdf-under-1mb",
  title: "How to Compress a Scanned PDF Under 1MB — Keep Text Legible",
  description: "Need a scanned PDF under 1 MB? Learn practical scan settings, compression trade-offs, a browser workflow, and checks to keep text readable before upload.",
  type: "article",
  publishedTime: "2026-09-28",
  modifiedTime: "2026-09-28",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
