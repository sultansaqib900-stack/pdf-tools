import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/studio",
  title: "PDF Studio — Try Free for Three Days",
  description: "PDF Studio is included with Premium. Chain PDF edits in one browser session without downloading and re-uploading.",
});

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
