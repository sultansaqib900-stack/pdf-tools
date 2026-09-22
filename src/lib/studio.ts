/**
 * PDF Studio is a Premium workspace — included with Premium forever.
 * The former three-day trial was removed: Premium members keep Studio
 * permanently, and the 38 core tools remain free and unlimited for everyone.
 */
export const STUDIO_MAX_FILE_SIZE = 100 * 1024 * 1024;

export function checkStudioFileSize(size: number): { ok: boolean; message: string } {
  return size > STUDIO_MAX_FILE_SIZE
    ? { ok: false, message: "PDF Studio supports files up to 100MB." }
    : { ok: true, message: "" };
}
