import { describe, it, expect, vi, beforeEach } from "vitest";
import { GA_CONFIG } from "@/lib/analytics";

describe("GA_CONFIG", () => {
  it("has the correct measurement ID", () => {
    expect(GA_CONFIG.measurementId).toBe("G-0YRS54VR4X");
  });
});

describe("trackEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls gtag when available", async () => {
    const mockGtag = vi.fn();
    (window as any).gtag = mockGtag;
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("test_event", { key: "value" });
    expect(mockGtag).toHaveBeenCalledWith("event", "test_event", {
      key: "value",
    });
  });

  it("does not throw when gtag is unavailable", async () => {
    delete (window as any).gtag;
    const { trackEvent } = await import("@/lib/analytics");
    expect(() => trackEvent("test_event", {})).not.toThrow();
  });
});
