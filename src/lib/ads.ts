/**
 * Ad scheduling rules (Monetag vignette banners).
 *
 * Policy requested by the site owner:
 *  - The first vignette appears 10 seconds after the visitor opens the site.
 *  - After that, a vignette appears once per every 3 completed tasks
 *    (a task = a finished tool job, tracked via trackExport).
 *  - Premium members NEVER see ads. Ads already scheduled are skipped the
 *    moment the account is recognized as Premium.
 *
 * The scheduler is dependency-injected so it can be unit-tested with fake
 * timers; the live wiring lives in components/AdManager.tsx.
 */

export const ADS_FIRST_DELAY_MS = 10_000;
export const ADS_TASKS_PER_AD = 3;
/** Never fire two vignettes back-to-back (page hops, rapid exports). */
export const ADS_MIN_GAP_MS = 45_000;

export interface AdSchedulerDeps {
  showVignette: () => void;
  isPremium: () => boolean;
  subscribePremium?: (listener: () => void) => () => void;
  now?: () => number;
  setTimeoutFn?: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn?: (handle: ReturnType<typeof setTimeout>) => void;
}

export interface AdScheduler {
  start: () => void;
  stop: () => void;
  /** Count one completed user task; fires a vignette every ADS_TASKS_PER_AD. */
  registerTask: () => void;
}

export function createAdScheduler(deps: AdSchedulerDeps): AdScheduler {
  const now = deps.now ?? (() => Date.now());
  const setTimeoutFn = deps.setTimeoutFn ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimeoutFn = deps.clearTimeoutFn ?? ((h) => clearTimeout(h));

  let tasksSinceLastAd = 0;
  let lastShownAt: number | null = null;
  let firstTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribePremium: (() => void) | null = null;
  let running = false;

  function fire(): void {
    // Premium members never see ads — checked at show time, not at schedule time.
    if (!running || deps.isPremium()) return;
    const timestamp = now();
    if (lastShownAt !== null && timestamp - lastShownAt < ADS_MIN_GAP_MS) return;
    lastShownAt = timestamp;
    deps.showVignette();
  }

  return {
    start() {
      if (running) return;
      running = true;
      firstTimer = setTimeoutFn(() => {
        firstTimer = null;
        fire();
      }, ADS_FIRST_DELAY_MS);
      if (deps.subscribePremium) {
        unsubscribePremium = deps.subscribePremium(() => {
          // Nothing to undo: fire() re-checks premium on every trigger.
        });
      }
    },
    stop() {
      running = false;
      if (firstTimer !== null) {
        clearTimeoutFn(firstTimer);
        firstTimer = null;
      }
      unsubscribePremium?.();
      unsubscribePremium = null;
    },
    registerTask() {
      if (!running) return;
      tasksSinceLastAd += 1;
      if (tasksSinceLastAd >= ADS_TASKS_PER_AD) {
        tasksSinceLastAd = 0;
        fire();
      }
    },
  };
}

/**
 * Live scheduler singleton. Tools report completed tasks through
 * registerAdTask(); the scheduler is created by <AdManager /> in the root
 * layout. Before AdManager mounts (SSR/tests) this is a safe no-op.
 */
let activeScheduler: AdScheduler | null = null;

export function setActiveAdScheduler(scheduler: AdScheduler | null): void {
  activeScheduler = scheduler;
}

export function registerAdTask(): void {
  activeScheduler?.registerTask();
}
