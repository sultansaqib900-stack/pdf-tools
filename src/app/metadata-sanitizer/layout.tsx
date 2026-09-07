import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Metadata Sanitizer — Strip Hidden Data Free",
  description: "Remove hidden PDF metadata: author, software, timestamps and GPS traces. Clean documents before sharing, privately in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
