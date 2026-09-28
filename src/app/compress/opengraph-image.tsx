import { makeOgImage, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return makeOgImage("Compress PDF Online", "Reduce PDF file size without uploading — free in your browser");
}
