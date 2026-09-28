import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/certificate-generator",
  title: "PDF Certificate Generator - Bulk Certificate Creator",
  description: "Generate personalized PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and event participation. Premium.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
