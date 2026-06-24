import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat with PDF Online Free — AI-Powered PDF Assistant | PDFTools",
  description: "Chat with any PDF document using AI. Upload a PDF and ask questions about its content. Free daily limit, no uploads, works in your browser.",
  openGraph: {
    title: "Chat with PDF — AI-Powered PDF Assistant",
    description: "Upload any PDF and ask questions about its content. Free daily limit, premium for unlimited.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
