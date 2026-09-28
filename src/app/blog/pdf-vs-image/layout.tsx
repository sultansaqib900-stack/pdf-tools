import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/blog/pdf-vs-image",
  title: "PDF vs Image – When to Use Each Format for Your Documents",
  description: "Understanding when to use PDF vs image formats like JPG and PNG. Learn how to convert between formats with our free online tools.",
  type: "article",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
