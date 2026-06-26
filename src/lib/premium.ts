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

export async function verifyPremiumServer(): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId) return isPremium();
  try {
    const res = await fetch(`/api/premium/verify?clientId=${encodeURIComponent(clientId)}`);
    const data = await res.json();
    if (data.premium) setPremium(true);
    return data.premium;
  } catch {
    return isPremium();
  }
}

export async function confirmPremium(nonce?: string): Promise<boolean> {
  const clientId = getClientId();
  try {
    const res = await fetch("/api/premium/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, nonce }),
    });
    const data = await res.json();
    if (data.premium) setPremium(true);
    return data.premium;
  } catch {
    setPremium(true);
    return true;
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
  waitSeconds: 5,
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
