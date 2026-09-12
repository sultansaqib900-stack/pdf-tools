import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Studio - Unified Multi-Step PDF Pipeline & Editor | PDFTools",
  description: "Chain multiple PDF actions in one session: delete pages, rotate, reorder, add signature, watermark, and compress without re-uploading every time. 100% private in-browser pipeline.",
  alternates: {
    canonical: "https://allaboutpdfediting.xyz/studio",
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
