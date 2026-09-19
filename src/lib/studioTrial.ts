/** Studio-only offer. This never grants site-wide Premium or file-trial quota. */
export const STUDIO_TRIAL_DAYS = 3;
export const STUDIO_TRIAL_DURATION_MS = STUDIO_TRIAL_DAYS * 24 * 60 * 60 * 1000;
export const STUDIO_TRIAL_CTA = "Try PDF Studio free for three days";
export const STUDIO_MAX_FILE_SIZE = 100 * 1024 * 1024;

export interface StudioTrialStatus {
  status: "not_started" | "active" | "expired" | "premium";
  expiresAt: number | null;
  remainingMs: number;
}

export function checkStudioFileSize(size: number): { ok: boolean; message: string } {
  return size > STUDIO_MAX_FILE_SIZE
    ? { ok: false, message: "PDF Studio supports files up to 100MB, including during the three-day trial." }
    : { ok: true, message: "" };
}
