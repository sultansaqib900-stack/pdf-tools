/**
 * Ad scheduling disabled — all third-party Monetag vignette ads have been removed.
 * Tool pages calling registerAdTask() receive a safe no-op.
 */

export const ADS_FIRST_DELAY_MS = 5_000;
export const ADS_TASKS_PER_AD = 3;
export const ADS_MIN_GAP_MS = 0;

export interface AdSchedulerDeps {
  showVignette: () => void;
  hideVignette?: () => void;
  isPremium: () => boolean;
  isPremiumReady?: () => boolean;
  subscribePremium?: (listener: () => void) => () => void;
  now?: () => number;
  setTimeoutFn?: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn?: (handle: ReturnType<typeof setTimeout>) => void;
}

export interface AdScheduler {
  start: () => void;
  stop: () => void;
  registerTask: () => void;
}

export function createAdScheduler(deps: AdSchedulerDeps): AdScheduler {
  return {
    start() {
      deps.hideVignette?.();
    },
    stop() {
      deps.hideVignette?.();
    },
    registerTask() {
      // Disabled — ads never fire.
    },
  };
}

export function setActiveAdScheduler(_scheduler: AdScheduler | null): void {
  void _scheduler;
}

export function registerAdTask(): void {
  // Safe no-op — ads removed.
}
