import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/sign-pdf-without-printing",
  title: "How to Sign a PDF Without Printing – Free Online e-Sign Tool",
  description: "Learn how to sign a PDF online free without printing or scanning. Draw your signature and add it to any PDF in seconds, entirely in your browser.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
