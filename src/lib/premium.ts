// === PREMIUM & USAGE STATE MANAGEMENT ===
// Premium entitlement is verified by the server. Browser storage contains only
// an anonymous device ID and is never trusted as proof of payment.

const CLIENT_ID_KEY = "pdftools_client_id";

export interface PremiumSnapshot {
  premium: boolean;
  ready: boolean;
}

const SERVER_PREMIUM_SNAPSHOT: PremiumSnapshot = { premium: false, ready: false };
let premiumSnapshot: PremiumSnapshot = SERVER_PREMIUM_SNAPSHOT;
let premiumRequestVersion = 0;
const premiumListeners = new Set<() => void>();

function emitPremiumChange(): void {
  for (const listener of premiumListeners) listener();
}

export function subscribePremium(listener: () => void): () => void {
  premiumListeners.add(listener);
  return () => premiumListeners.delete(listener);
}

export function getPremiumSnapshot(): PremiumSnapshot {
  return premiumSnapshot;
}

export function getServerPremiumSnapshot(): PremiumSnapshot {
  return SERVER_PREMIUM_SNAPSHOT;
}

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function isPremium(): boolean {
  return premiumSnapshot.ready && premiumSnapshot.premium;
}

/** Update the in-memory UI cache after a trusted server response. */
export function setPremium(value: boolean, ready = true): void {
  const next = { premium: value, ready };
  if (next.premium === premiumSnapshot.premium && next.ready === premiumSnapshot.ready) return;
  premiumSnapshot = next;
  emitPremiumChange();
}

export function markPremiumChecking(): void {
  setPremium(false, false);
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function verifyPremiumServer(token?: string): Promise<boolean> {
  const requestVersion = ++premiumRequestVersion;
  const clientId = getClientId();
  if (!clientId) {
    if (requestVersion === premiumRequestVersion) setPremium(false);
    return false;
  }

  if (!premiumSnapshot.ready) markPremiumChecking();
  try {
    const res = await fetch(`/api/premium/verify?clientId=${encodeURIComponent(clientId)}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });
    if (!res.ok) {
      if (requestVersion === premiumRequestVersion) setPremium(false);
      return false;
    }
    const data = await res.json();
    const premium = data.premium === true;
    if (requestVersion === premiumRequestVersion) setPremium(premium);
    return premium;
  } catch {
    // Payment state fails closed. A network failure must never grant access.
    if (requestVersion === premiumRequestVersion) setPremium(false);
    return false;
  }
}

export async function confirmPremium(nonce?: string, token?: string): Promise<boolean> {
  const requestVersion = ++premiumRequestVersion;
  const clientId = getClientId();
  if (!clientId || !nonce) {
    if (requestVersion === premiumRequestVersion) setPremium(false);
    return false;
  }

  try {
    const res = await fetch("/api/premium/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ clientId, nonce }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const premium = data.premium === true;
    if (premium && requestVersion === premiumRequestVersion) setPremium(true);
    return premium;
  } catch {
    return false;
  }
}

/** Bind this device to the authenticated user's verified purchase. */
export async function claimPremium(token?: string): Promise<boolean> {
  const requestVersion = ++premiumRequestVersion;
  const clientId = getClientId();
  if (!clientId || !token) return false;

  try {
    const res = await fetch("/api/premium/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ clientId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const premium = data.premium === true;
    if (premium && requestVersion === premiumRequestVersion) setPremium(true);
    return premium;
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
    return { ok: true, remaining: FREE_LIMITS.maxDailyUses };
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
    return { ok: true, remaining: FREE_LIMITS.maxDailyUses };
  }
}

export async function getTotalProcessed(): Promise<number> {
  try {
    const res = await fetch("/api/usage/stats");
    const data = await res.json();
    return typeof data.total === "number" && data.total >= 0 ? data.total : 0;
  } catch {
    return 0;
  }
}

// Every free tool uses the same transparent daily allowance. Premium removes it.
export const UNLIMITED_TOOLS = [] as const;

export function isUnlimited(tool: string): boolean {
  return (UNLIMITED_TOOLS as readonly string[]).includes(tool);
}

export const FREE_LIMITS = {
  maxFileSize: 10 * 1024 * 1024,
  maxDailyUses: 5,
  waitSeconds: 0,
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
    return { ok: false, message: `File too large. This tier supports up to ${maxMB}MB. Premium supports up to 100MB.` };
  }
  return { ok: true, message: "" };
}

export function checkBatchCount(count: number): { ok: boolean; message: string } {
  if (count > 1 && !isPremium()) {
    return { ok: false, message: "Batch processing requires Premium." };
  }
  return { ok: true, message: "" };
}
