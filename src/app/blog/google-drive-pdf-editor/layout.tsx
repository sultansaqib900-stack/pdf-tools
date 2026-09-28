import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/google-drive-pdf-editor",
  title: "How to Edit PDFs from Google Drive — Free Online PDF Editor",
  description: "Edit PDFs stored in Google Drive directly from your browser. No downloads, no uploads to third-party servers. Compress, merge, split, and more.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
