import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdManager, {
  removeMonetagVignette,
  showMonetagVignette,
} from "@/components/AdManager";
import { ADS_FIRST_DELAY_MS, registerAdTask } from "@/lib/ads";
import {
  isMonetagConfigured,
  MONETAG_VIGNETTE_SRC,
  MONETAG_VIGNETTE_ZONE,
  monetagVignetteUrl,
} from "@/lib/monetag";

const SCRIPT_SELECTOR = "script[data-pdftools-monetag-vignette]";

describe("Monetag ads disabled", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    removeMonetagVignette();
  });

  afterEach(() => {
    cleanup();
    removeMonetagVignette();
    vi.useRealTimers();
  });

  it("has Monetag configuration disabled with empty URL and zone", () => {
    expect(isMonetagConfigured()).toBe(false);
    expect(MONETAG_VIGNETTE_SRC).toBe("");
    expect(MONETAG_VIGNETTE_ZONE).toBe("");
    expect(monetagVignetteUrl()).toBe("");
  });

  it("never injects any Monetag script on mount, timer elapse, or task completion", () => {
    render(<AdManager />);
    act(() => {
      vi.advanceTimersByTime(ADS_FIRST_DELAY_MS * 10);
      showMonetagVignette();
      for (let i = 0; i < 10; i++) registerAdTask();
    });
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("removes any residual Monetag script element on mount", () => {
    const stale = document.createElement("script");
    stale.setAttribute("data-pdftools-monetag-vignette", "true");
    document.body.appendChild(stale);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeNull();

    render(<AdManager />);
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });
});
