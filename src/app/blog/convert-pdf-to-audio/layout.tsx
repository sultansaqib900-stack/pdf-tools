import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/blog/convert-pdf-to-audio",
  title: "How to Convert PDF to Audio Online Free — Listen Instead of Read",
  description: "Convert PDF documents to audio files with natural-sounding text-to-speech. No signup or uploads — the file is processed in your browser.",
  type: "article",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
