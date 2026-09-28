import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-to-audio",
  title: "PDF Text-to-Speech Reader",
  description: "Extract text from a PDF and read it aloud with voices provided by your browser. Playback only; no MP3 export.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
