import { createClient } from "@vercel/kv";

const kv = createClient({
  url: process.env.pdf_tools_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.pdf_tools_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

export { kv };

const KV_PREFIX = "pdftools:";

export const keys = {
  premiumByClientId: (id: string) => `${KV_PREFIX}premium:client:${id}`,
  premiumByEmail: (email: string) => `${KV_PREFIX}premium:email:${email.toLowerCase()}`,
  /** Set of device clientIds that redeemed this email, so revocation can reach them. */
  clientsForEmail: (email: string) => `${KV_PREFIX}premium:clients:${email.toLowerCase()}`,
  dailyUsage: (clientId: string, date: string) => `${KV_PREFIX}usage:${clientId}:${date}`,
  chatUsage: (clientId: string, date: string) => `${KV_PREFIX}chatusage:${clientId}:${date}`,
  totalProcessed: () => `${KV_PREFIX}stats:total_processed`,
  dailyGlobal: (date: string) => `${KV_PREFIX}stats:daily:${date}`,
};

export async function getPremiumStatus(clientId: string): Promise<boolean> {
  try {
    const val = await kv.get(keys.premiumByClientId(clientId));
    return val === true;
  } catch {
    return false;
  }
}

export async function getPremiumStatusByEmail(email: string): Promise<boolean> {
  try {
    const val = await kv.get(keys.premiumByEmail(email));
    return val === true;
  } catch {
    return false;
  }
}

export async function setPremiumStatus(clientId: string, value: boolean) {
  try {
    if (value) {
      await kv.set(keys.premiumByClientId(clientId), true, { ex: 365 * 24 * 60 * 60 });
    } else {
      await kv.del(keys.premiumByClientId(clientId));
    }
  } catch {
    // KV not available
  }
}

export async function setPremiumByEmail(email: string, clientId?: string) {
  try {
    await kv.set(keys.premiumByEmail(email), true, { ex: 365 * 24 * 60 * 60 });
    const userKeyStr = `${KV_PREFIX}user:${email.toLowerCase()}`;
    const existingUser = await kv.get<any>(userKeyStr);
    if (existingUser) {
      await kv.set(userKeyStr, { ...existingUser, premium: true }, { ex: 365 * 24 * 60 * 60 });
    }
    if (clientId) {
      await kv.set(keys.premiumByClientId(clientId), true, { ex: 365 * 24 * 60 * 60 });
      await linkClientToEmail(email, clientId);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Record that `clientId` was granted premium via `email`.
 *
 * Entitlement is stored under two independent keys (by email and by device
 * clientId). Without this link, revoking an email would leave every device
 * that had already redeemed it premium forever, because nothing connected the
 * two. The set is what makes revocation actually reach the devices.
 */
export async function linkClientToEmail(email: string, clientId: string) {
  try {
    await kv.sadd(keys.clientsForEmail(email), clientId);
    await kv.expire(keys.clientsForEmail(email), 400 * 24 * 60 * 60);
  } catch {
    // KV not available — the email-level grant still applies.
  }
}

/**
 * Update only the `premium` flag on a stored user record.
 *
 * Used to keep the user object consistent with the authoritative entitlement
 * without touching the rest of the record.
 */
export async function setUserPremiumFlag(email: string, premium: boolean) {
  try {
    const userKeyStr = `${KV_PREFIX}user:${email.toLowerCase()}`;
    const existingUser = await kv.get<any>(userKeyStr);
    if (existingUser) {
      await kv.set(userKeyStr, { ...existingUser, premium }, { ex: 365 * 24 * 60 * 60 });
    }
  } catch {
    // KV not available
  }
}

/**
 * Revoke premium for an email and every device that redeemed it.
 *
 * Called by the LemonSqueezy webhook on refund, expiry, or cancellation.
 * Previously the webhook only ever granted access, so a refunded customer kept
 * premium indefinitely.
 */
export async function revokePremiumByEmail(email: string): Promise<{ ok: boolean; devices: number }> {
  try {
    await kv.del(keys.premiumByEmail(email));

    const userKeyStr = `${KV_PREFIX}user:${email.toLowerCase()}`;
    const existingUser = await kv.get<any>(userKeyStr);
    if (existingUser) {
      await kv.set(userKeyStr, { ...existingUser, premium: false }, { ex: 365 * 24 * 60 * 60 });
    }

    const clientIds = (await kv.smembers<string[]>(keys.clientsForEmail(email))) || [];
    for (const id of clientIds) {
      await kv.del(keys.premiumByClientId(id));
    }
    await kv.del(keys.clientsForEmail(email));

    return { ok: true, devices: clientIds.length };
  } catch {
    return { ok: false, devices: 0 };
  }
}

export async function getDailyUsage(clientId: string): Promise<{ count: number; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = (await kv.get<number>(keys.dailyUsage(clientId, date))) || 0;
    return { count, remaining: Math.max(0, 5 - count) };
  } catch {
    return { count: 0, remaining: 5 };
  }
}

export async function incrementDailyUsage(clientId: string): Promise<{ count: number; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = await kv.incr(keys.dailyUsage(clientId, date));
    await kv.expire(keys.dailyUsage(clientId, date), 86400);
    await kv.incr(keys.totalProcessed());
    await kv.incr(keys.dailyGlobal(date));
    return { count, remaining: Math.max(0, 5 - count) };
  } catch {
    return { count: 0, remaining: 5 };
  }
}

export async function getTotalProcessed(): Promise<number> {
  try {
    return (await kv.get<number>(keys.totalProcessed())) || 0;
  } catch {
    return 12430;
  }
}

interface FeedbackEntry {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  date: string;
  approved: boolean;
}

const FEEDBACK_KEY = "pdftools:feedback:list";

export async function getFeedback(): Promise<FeedbackEntry[]> {
  try {
    const list = await kv.get<FeedbackEntry[]>(FEEDBACK_KEY);
    const entries = list || [];
    return entries.filter((f) => f.approved).reverse();
  } catch {
    return [];
  }
}

export async function submitFeedback(
  entry: Omit<FeedbackEntry, "id" | "date" | "approved">
): Promise<FeedbackEntry> {
  const feedback: FeedbackEntry = {
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    date: new Date().toISOString(),
    approved: true,
  };
  try {
    const list = (await kv.get<FeedbackEntry[]>(FEEDBACK_KEY)) || [];
    list.push(feedback);
    await kv.set(FEEDBACK_KEY, list);
  } catch {
    // KV not available
  }
  return feedback;
}

const CHAT_DAILY_LIMIT = 3;

export async function getChatUsage(clientId: string): Promise<{ count: number; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = (await kv.get<number>(keys.chatUsage(clientId, date))) || 0;
    return { count, remaining: Math.max(0, CHAT_DAILY_LIMIT - count) };
  } catch {
    return { count: 0, remaining: CHAT_DAILY_LIMIT };
  }
}

export async function trackChatUsage(clientId: string): Promise<{ ok: boolean; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = await kv.incr(keys.chatUsage(clientId, date));
    await kv.expire(keys.chatUsage(clientId, date), 86400);
    return { ok: count <= CHAT_DAILY_LIMIT, remaining: Math.max(0, CHAT_DAILY_LIMIT - count) };
  } catch {
    return { ok: true, remaining: CHAT_DAILY_LIMIT };
  }
}

/**
 * Atomically consume one AI credit for a non-premium client.
 *
 * This is the server-side enforcement point for the free daily AI quota. The
 * counter was previously incremented by the client *after* a successful answer
 * via /api/chat-pdf/track, and the AI route itself checked nothing — so
 * calling the endpoint directly, or simply not calling track, gave unlimited
 * Gemini requests billed to us.
 *
 * Increment-then-compare is deliberate: it is a single atomic INCR, so two
 * concurrent requests cannot both observe the last remaining credit.
 *
 * Fails CLOSED. If KV is unreachable we cannot prove the caller has quota, and
 * an open AI proxy is a worse outcome than a temporary outage.
 */
export async function consumeChatCredit(
  clientId: string
): Promise<{ allowed: boolean; remaining: number; degraded?: boolean }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = await kv.incr(keys.chatUsage(clientId, date));
    await kv.expire(keys.chatUsage(clientId, date), 86400);
    return {
      allowed: count <= CHAT_DAILY_LIMIT,
      remaining: Math.max(0, CHAT_DAILY_LIMIT - count),
    };
  } catch {
    return { allowed: false, remaining: 0, degraded: true };
  }
}

export { CHAT_DAILY_LIMIT };
