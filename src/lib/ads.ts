/**
 * Ad scheduling rules (Monetag vignette banners).
 *
 * Policy requested by the site owner:
 *  - The first vignette appears 5 seconds after the visitor opens the site.
 *  - After that, a vignette appears once per every 3 completed tool tasks.
 *  - Premium members NEVER see ads. A pending or currently loaded ad is
 *    cancelled as soon as the account is recognized as Premium.
 *
 * The scheduler is dependency-injected so it can be unit-tested with fake
 * timers; the live wiring lives in components/AdManager.tsx.
 */

export const ADS_FIRST_DELAY_MS = 5_000;
export const ADS_TASKS_PER_AD = 3;
/**
 * Kept as a public compatibility constant. The requested cadence has no extra
 * cooldown: the third completed task is itself the trigger.
 */
export const ADS_MIN_GAP_MS = 0;

export interface AdSchedulerDeps {
  showVignette: () => void;
  hideVignette?: () => void;
  isPremium: () => boolean;
  /**
   * Server entitlement starts unresolved in the browser. When supplied, ads
   * wait for that trusted check instead of briefly showing to a paid member.
   */
  isPremiumReady?: () => boolean;
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
  const clearTimeoutFn = deps.clearTimeoutFn ?? ((handle) => clearTimeout(handle));
  const premiumReady = deps.isPremiumReady ?? (() => true);

  let tasksSinceLastAd = 0;
  let lastShownAt: number | null = null;
  let pendingAd = false;
  let firstTimer: ReturnType<typeof setTimeout> | null = null;
  let deferredTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribePremium: (() => void) | null = null;
  let running = false;

  function clearDeferredTimer(): void {
    if (deferredTimer === null) return;
    clearTimeoutFn(deferredTimer);
    deferredTimer = null;
  }

  function suppressForPremium(): void {
    tasksSinceLastAd = 0;
    pendingAd = false;
    clearDeferredTimer();
    // Removing the injected tag immediately prevents any further ad activity
    // after checkout confirmation or account restoration.
    deps.hideVignette?.();
  }

  function requestAd(): void {
    if (!running) return;

    // Never guess while the server-backed Premium state is unresolved. Keep
    // the request pending and flush it when verification reports a free user.
    if (!premiumReady()) {
      pendingAd = true;
      return;
    }

    if (deps.isPremium()) {
      suppressForPremium();
      return;
    }

    const timestamp = now();
    if (lastShownAt !== null) {
      const remainingGap = ADS_MIN_GAP_MS - (timestamp - lastShownAt);
      if (remainingGap > 0) {
        pendingAd = true;
        if (deferredTimer === null) {
          deferredTimer = setTimeoutFn(() => {
            deferredTimer = null;
            requestAd();
          }, remainingGap);
        }
        return;
      }
    }

    clearDeferredTimer();
    pendingAd = false;
    lastShownAt = timestamp;
    deps.showVignette();
  }

  function handlePremiumChange(): void {
    if (!running || !premiumReady()) return;
    if (deps.isPremium()) {
      suppressForPremium();
    } else if (pendingAd) {
      requestAd();
    }
  }

  return {
    start() {
      if (running) return;
      running = true;
      if (deps.subscribePremium) {
        unsubscribePremium = deps.subscribePremium(handlePremiumChange);
      }
      firstTimer = setTimeoutFn(() => {
        firstTimer = null;
        pendingAd = true;
        requestAd();
      }, ADS_FIRST_DELAY_MS);

      // A Premium snapshot may already be available before this component
      // mounts (for example after client-side navigation).
      handlePremiumChange();
    },
    stop() {
      running = false;
      pendingAd = false;
      if (firstTimer !== null) {
        clearTimeoutFn(firstTimer);
        firstTimer = null;
      }
      clearDeferredTimer();
      unsubscribePremium?.();
      unsubscribePremium = null;
      deps.hideVignette?.();
    },
    registerTask() {
      if (!running) return;
      if (premiumReady() && deps.isPremium()) {
        suppressForPremium();
        return;
      }
      tasksSinceLastAd += 1;
      if (tasksSinceLastAd >= ADS_TASKS_PER_AD) {
        tasksSinceLastAd = 0;
        requestAd();
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
