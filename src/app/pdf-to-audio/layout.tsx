import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Audio — Listen to PDFs with Text to Speech",
  description: "Convert any PDF into spoken audio with natural text-to-speech. Choose voice and speed, then listen or download. Free and private.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
