import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/chat-pdf",
  title: "Chat with PDF Online Free — AI-Powered PDF Assistant",
  description: "Chat with any PDF document using AI. Upload a PDF and ask questions about its content. Free daily limit, no uploads, works in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
