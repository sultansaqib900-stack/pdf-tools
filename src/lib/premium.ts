// === PREMIUM & USAGE STATE MANAGEMENT ===
// Uses localStorage for fast client-side checks + server-side KV for verification.
// Falls back to localStorage when API is unavailable.

const STORAGE_KEY = "pdftools_premium";
const CLIENT_ID_KEY = "pdftools_client_id";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

let _isPremiumVal: boolean | undefined;

/**
 * Cached, client-side premium flag.
 *
 * IMPORTANT: this is a UI hint, not an access control. It reads localStorage,
 * which the user can edit, so it must only ever decide what to *show* — never
 * what to allow. Anything with a real cost (an API call, a paid conversion)
 * has to verify entitlement server-side on the request itself.
 *
 * `PremiumVerifier` reconciles this value against /api/premium/verify on load,
 * in both directions, so a revoked entitlement clears on the next page view.
 */
export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  if (_isPremiumVal === undefined) {
    _isPremiumVal = localStorage.getItem(STORAGE_KEY) === "true";
  }
  return _isPremiumVal;
}

export function setPremium(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  _isPremiumVal = value;
}

/**
 * Reconcile the cached premium flag with the server.
 *
 * This is the authority for the local cache, in BOTH directions. It previously
 * only ever upgraded (`if (data.premium) setPremium(true)`), so a server answer
 * of `false` was discarded — which meant a refunded or cancelled customer kept
 * premium locally forever, no matter what the webhook did.
 *
 * A network failure leaves the cached value untouched rather than revoking, so
 * a flaky connection does not lock a paying customer out mid-session.
 */
export async function verifyPremiumServer(email?: string): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId && !email) return isPremium();
  try {
    const params = new URLSearchParams();
    if (clientId) params.set("clientId", clientId);
    if (email) params.set("email", email);
    const res = await fetch(`/api/premium/verify?${params}`);
    if (!res.ok) return isPremium();
    const data = await res.json();
    // Trust the server either way. `premium: false` is a real answer.
    setPremium(data.premium === true);
    return data.premium === true;
  } catch {
    // Offline or transient failure: keep whatever we had.
    return isPremium();
  }
}

export async function confirmPremium(nonce?: string, email?: string): Promise<boolean> {
  const clientId = getClientId();
  try {
    const res = await fetch("/api/premium/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, nonce, email }),
    });
    const data = await res.json();
    if (data.premium) setPremium(true);
    return data.premium === true;
  } catch {
    // Fail closed. Granting premium on a network error let anyone unlock the
    // paid tier simply by blocking the request.
    return false;
  }
}

export async function claimPremium(email: string): Promise<boolean> {
  const clientId = getClientId();
  try {
    const res = await fetch("/api/premium/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), clientId }),
    });
    const data = await res.json();
    if (data.premium) setPremium(true);
    return data.premium;
  } catch {
    return false;
  }
}

export async function peekUsage(): Promise<{ ok: boolean; remaining: number }> {
  const clientId = getClientId();
  try {
    const res = await fetch(`/api/usage/check?clientId=${encodeURIComponent(clientId)}`);
    const data = await res.json();
    return { ok: data.ok, remaining: data.remaining ?? 0 };
  } catch {
    return { ok: true, remaining: 5 };
  }
}

export async function trackUsage(): Promise<{ ok: boolean; remaining: number }> {
  const clientId = getClientId();
  try {
    const res = await fetch("/api/usage/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    return { ok: data.ok, remaining: data.remaining ?? 0 };
  } catch {
    return { ok: true, remaining: 5 };
  }
}

export async function getTotalProcessed(): Promise<number> {
  try {
    const res = await fetch("/api/usage/stats");
    const data = await res.json();
    return data.total || 0;
  } catch {
    return 12430;
  }
}

export const UNLIMITED_TOOLS = [
  "compress", "image-to-pdf", "split", "unlock",
] as const;

export function isUnlimited(tool: string): boolean {
  return (UNLIMITED_TOOLS as readonly string[]).includes(tool);
}

export const FREE_LIMITS = {
  maxFileSize: 10 * 1024 * 1024,
  maxDailyUses: 5,
  waitSeconds: 2,
} as const;

export const PREMIUM_LIMITS = {
  maxFileSize: 100 * 1024 * 1024,
  maxDailyUses: 9999,
  waitSeconds: 0,
} as const;

export function getLimits() {
  return isPremium() ? PREMIUM_LIMITS : FREE_LIMITS;
}

export function checkFileSize(size: number): { ok: boolean; message: string } {
  const limits = getLimits();
  if (size > limits.maxFileSize) {
    const maxMB = limits.maxFileSize / 1024 / 1024;
    return { ok: false, message: `File too large. Free tier supports up to ${maxMB}MB. Upgrade to Premium for up to 100MB.` };
  }
  return { ok: true, message: "" };
}

export function checkBatchCount(count: number): { ok: boolean; message: string } {
  if (count > 1 && !isPremium()) {
    return { ok: false, message: "Batch processing requires Premium." };
  }
  return { ok: true, message: "" };
}
