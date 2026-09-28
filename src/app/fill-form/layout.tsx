import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/fill-form",
  title: "Fill PDF Form Online Free — Complete Forms Instantly",
  description: "Fill PDF forms online for free. Detect form fields, fill text fields, check boxes, select options, and download the completed PDF. No uploads, 100% private, all in your browser.",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
