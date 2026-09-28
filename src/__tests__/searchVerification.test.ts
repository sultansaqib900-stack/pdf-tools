import { afterEach, describe, expect, it } from "vitest";
import { getSearchVerificationMetadata } from "@/lib/search-verification";

describe("search-engine verification metadata", () => {
  const originalGoogle = process.env.GOOGLE_SITE_VERIFICATION;
  const originalBing = process.env.BING_SITE_VERIFICATION;

  afterEach(() => {
    if (originalGoogle === undefined) delete process.env.GOOGLE_SITE_VERIFICATION;
    else process.env.GOOGLE_SITE_VERIFICATION = originalGoogle;
    if (originalBing === undefined) delete process.env.BING_SITE_VERIFICATION;
    else process.env.BING_SITE_VERIFICATION = originalBing;
  });

  it("keeps the existing Google verification token when no override is configured", () => {
    delete process.env.GOOGLE_SITE_VERIFICATION;
    delete process.env.BING_SITE_VERIFICATION;

    expect(getSearchVerificationMetadata()).toEqual({
      google: "N8odpQukXkhYSNhTcTrnMKWHWTi5D5h_Cre96ZVGlTw",
    });
  });

  it("uses configured Google and Bing tokens in their provider-specific metadata fields", () => {
    process.env.GOOGLE_SITE_VERIFICATION = "  google-token  ";
    process.env.BING_SITE_VERIFICATION = "  bing-token  ";

    expect(getSearchVerificationMetadata()).toEqual({
      google: "google-token",
      other: { "msvalidate.01": "bing-token" },
    });
  });

  it("omits Bing verification when its token is blank", () => {
    process.env.BING_SITE_VERIFICATION = "  ";

    expect(getSearchVerificationMetadata()).toEqual({
      google: "N8odpQukXkhYSNhTcTrnMKWHWTi5D5h_Cre96ZVGlTw",
    });
  });
});
