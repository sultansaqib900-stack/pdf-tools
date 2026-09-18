import type { Metadata } from "next";

export const metadata: Metadata = {"title": "PDF Text-to-Speech Reader | PDFTools", "description": "Extract text from a PDF and read it aloud with voices provided by your browser. Playback only; no MP3 export."};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
