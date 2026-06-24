export const GA_CONFIG = {
  measurementId: "G-0YRS54VR4X",
  enabled: true,
};

export function trackEvent(
  action: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  try {
    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    if (w.gtag) {
      w.gtag("event", action, params);
    } else if (w.dataLayer) {
      w.dataLayer.push({ event: "ga_event", action, ...params });
    }
  } catch {
    // analytics should never break the app
  }
}
