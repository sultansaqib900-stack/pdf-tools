import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/recipes",
  title: "PDF Recipes & Macros - 1-Click Multi-Step Workflows",
  description: "Chain multi-step PDF operations together into 1-click recipes. Legal e-filing, board prep, peer-review macros with 100% client-side privacy.",
});
export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
