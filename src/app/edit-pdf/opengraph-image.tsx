import { makeOgImage, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return makeOgImage("Edit PDF Online", "Add text, images and annotations — 100% in your browser");
}
