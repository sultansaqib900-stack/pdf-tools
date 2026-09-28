import type { Metadata } from "next";

// Preserve the already-deployed Google URL-prefix verification tag while
// allowing tokens to be managed in Vercel without editing source code.
const EXISTING_GOOGLE_VERIFICATION = "N8odpQukXkhYSNhTcTrnMKWHWTi5D5h_Cre96ZVGlTw";

/** Build Next.js metadata tags from server-only deployment configuration. */
export function getSearchVerificationMetadata(): NonNullable<Metadata["verification"]> {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim() || EXISTING_GOOGLE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION?.trim();

  return {
    google,
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}
