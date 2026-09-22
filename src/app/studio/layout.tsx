import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Studio — Try Free for Three Days | PDFTools",
  description: "PDF Studio is included with Premium. Chain PDF edits in one browser session without downloading and re-uploading.",
  alternates: {
    canonical: "https://allaboutpdfediting.xyz/studio",
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
