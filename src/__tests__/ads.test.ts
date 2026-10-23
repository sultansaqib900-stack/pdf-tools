import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADS_FIRST_DELAY_MS,
  ADS_TASKS_PER_AD,
  createAdScheduler,
  registerAdTask,
  setActiveAdScheduler,
} from "@/lib/ads";

describe("Ad scheduler disabled", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    setActiveAdScheduler(null);
  });

  it("never calls showVignette and immediately cleans up via hideVignette", () => {
    const show = vi.fn();
    const hide = vi.fn();
    const scheduler = createAdScheduler({
      showVignette: show,
      hideVignette: hide,
      isPremium: () => false,
    });

    scheduler.start();
    expect(hide).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS * 5);
    for (let i = 0; i < ADS_TASKS_PER_AD * 3; i++) {
      scheduler.registerTask();
      registerAdTask();
    }

    expect(show).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it("registerAdTask is a safe no-op", () => {
    expect(() => registerAdTask()).not.toThrow();
  });
});
