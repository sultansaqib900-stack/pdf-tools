import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Studio — Try Free for Three Days | PDFTools",
  description: "Try PDF Studio free for three days. Chain PDF edits in one browser session without downloading and re-uploading. Studio-only trial; Premium required afterwards.",
  alternates: {
    canonical: "https://allaboutpdfediting.xyz/studio",
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
