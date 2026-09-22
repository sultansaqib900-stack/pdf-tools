import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdManager, { removeMonetagVignette } from "@/components/AdManager";
import { ADS_FIRST_DELAY_MS, setActiveAdScheduler } from "@/lib/ads";
import {
  MONETAG_VIGNETTE_SRC,
  MONETAG_VIGNETTE_ZONE,
} from "@/lib/monetag";
import { setPremium } from "@/lib/premium";

const SCRIPT_SELECTOR = "script[data-pdftools-monetag-vignette]";

describe("AdManager Monetag tag", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setPremium(false);
    removeMonetagVignette();
  });

  afterEach(() => {
    cleanup();
    setActiveAdScheduler(null);
    removeMonetagVignette();
    setPremium(false);
    vi.useRealTimers();
  });

  it("injects the exact tag.txt source and zone after five seconds", () => {
    render(<AdManager />);

    act(() => { vi.advanceTimersByTime(ADS_FIRST_DELAY_MS - 1); });
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();

    act(() => { vi.advanceTimersByTime(1); });
    const script = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    expect(script).not.toBeNull();
    expect(script?.dataset.zone).toBe(MONETAG_VIGNETTE_ZONE);
    expect(script?.getAttribute("src")).toBe(MONETAG_VIGNETTE_SRC);
    expect(MONETAG_VIGNETTE_ZONE).toBe("11530056");
    expect(MONETAG_VIGNETTE_SRC).toBe("https://n6wxm.com/vignette.min.js");
  });

  it("removes the injected tag immediately when Premium activates", () => {
    render(<AdManager />);
    act(() => { vi.advanceTimersByTime(ADS_FIRST_DELAY_MS); });
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeNull();

    act(() => { setPremium(true); });
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("never injects a tag for an already verified Premium member", () => {
    setPremium(true);
    render(<AdManager />);
    act(() => { vi.advanceTimersByTime(ADS_FIRST_DELAY_MS); });
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });
});
