import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADS_FIRST_DELAY_MS,
  ADS_MIN_GAP_MS,
  ADS_TASKS_PER_AD,
  createAdScheduler,
  registerAdTask,
  setActiveAdScheduler,
} from "@/lib/ads";

function setup(premium = false) {
  const show = vi.fn();
  const scheduler = createAdScheduler({
    showVignette: show,
    isPremium: () => premium,
    setTimeoutFn: (fn, ms) => setTimeout(fn, ms),
    clearTimeoutFn: (h) => clearTimeout(h),
  });
  return { show, scheduler };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  setActiveAdScheduler(null);
});

describe("Monetag vignette ad schedule", () => {
  it("fires the first vignette 5 seconds after the page opens", () => {
    expect(ADS_FIRST_DELAY_MS).toBe(5_000);
    const { show, scheduler } = setup();
    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS - 1);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it("fires one vignette per every three completed tasks", () => {
    const { show, scheduler } = setup();
    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS + ADS_MIN_GAP_MS);
    expect(show).toHaveBeenCalledTimes(1);

    for (let i = 0; i < ADS_TASKS_PER_AD - 1; i++) {
      vi.advanceTimersByTime(ADS_MIN_GAP_MS);
      scheduler.registerTask();
    }
    expect(show).toHaveBeenCalledTimes(1); // two tasks: not yet

    vi.advanceTimersByTime(ADS_MIN_GAP_MS);
    scheduler.registerTask(); // third task
    expect(show).toHaveBeenCalledTimes(2);

    // Counter resets: three more tasks trigger the next one.
    for (let i = 0; i < ADS_TASKS_PER_AD; i++) {
      vi.advanceTimersByTime(ADS_MIN_GAP_MS);
      scheduler.registerTask();
    }
    expect(show).toHaveBeenCalledTimes(3);
    scheduler.stop();
  });

  it("never shows ads to Premium members", () => {
    const { show, scheduler } = setup(true);
    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS + ADS_MIN_GAP_MS);
    for (let i = 0; i < ADS_TASKS_PER_AD * 2; i++) {
      vi.advanceTimersByTime(ADS_MIN_GAP_MS);
      scheduler.registerTask();
    }
    expect(show).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it("fires immediately when the third completed task is registered", () => {
    const { show, scheduler } = setup();
    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);

    scheduler.registerTask();
    scheduler.registerTask();
    expect(show).toHaveBeenCalledTimes(1);
    scheduler.registerTask();
    expect(show).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  it("waits for server-backed Premium verification before showing", () => {
    let ready = false;
    let premium = false;
    let notifyPremium = () => {};
    const show = vi.fn();
    const scheduler = createAdScheduler({
      showVignette: show,
      isPremium: () => premium,
      isPremiumReady: () => ready,
      subscribePremium: (listener) => {
        notifyPremium = listener;
        return () => { notifyPremium = () => {}; };
      },
    });

    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS);
    expect(show).not.toHaveBeenCalled();

    ready = true;
    notifyPremium();
    expect(show).toHaveBeenCalledTimes(1);

    premium = true;
    notifyPremium();
    scheduler.stop();
  });

  it("removes the current tag and prevents future ads after an upgrade", () => {
    let premium = false;
    let notifyPremium = () => {};
    const show = vi.fn();
    const hide = vi.fn();
    const scheduler = createAdScheduler({
      showVignette: show,
      hideVignette: hide,
      isPremium: () => premium,
      subscribePremium: (listener) => {
        notifyPremium = listener;
        return () => { notifyPremium = () => {}; };
      },
    });

    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);

    premium = true;
    notifyPremium();
    expect(hide).toHaveBeenCalled();

    for (let i = 0; i < ADS_TASKS_PER_AD; i++) scheduler.registerTask();
    expect(show).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it("registerAdTask is a safe no-op before the scheduler mounts", () => {
    expect(() => registerAdTask()).not.toThrow();
  });

  it("routes registerAdTask to the active scheduler", () => {
    const { show, scheduler } = setup();
    setActiveAdScheduler(scheduler);
    scheduler.start();
    vi.advanceTimersByTime(ADS_FIRST_DELAY_MS + ADS_MIN_GAP_MS);
    for (let i = 0; i < ADS_TASKS_PER_AD; i++) {
      vi.advanceTimersByTime(ADS_MIN_GAP_MS);
      registerAdTask();
    }
    expect(show).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });
});
