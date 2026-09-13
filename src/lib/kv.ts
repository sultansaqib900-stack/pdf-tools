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
  premiumByUserId: (userId: string) => `${KV_PREFIX}premium:user:${userId}`,
  premiumBySubscription: (subscriptionId: string) => `${KV_PREFIX}premium:subscription:${subscriptionId}`,
  checkout: (nonce: string) => `${KV_PREFIX}checkout:${nonce}`,
  dailyUsage: (clientId: string, date: string) => `${KV_PREFIX}usage:${clientId}:${date}`,
  chatUsage: (clientId: string, date: string) => `${KV_PREFIX}chatusage:${clientId}:${date}`,
  webhookEvent: (eventHash: string) => `${KV_PREFIX}premium:webhook:${eventHash}`,
  webhookCustomerLock: (customerHash: string) => `${KV_PREFIX}premium:webhook-lock:${customerHash}`,
  totalProcessed: () => `${KV_PREFIX}stats:total_processed`,
  dailyGlobal: (date: string) => `${KV_PREFIX}stats:daily:${date}`,
};

interface PremiumEntitlement {
  active: boolean;
  source: "lemon-squeezy";
  expiresAt?: string;
  eventTimestamp?: string;
  orderId?: string;
  subscriptionId?: string;
  variantId?: string;
}

export interface PremiumSubscriptionBinding {
  email: string;
  variantId: string;
  eventTimestamp?: string;
}

export async function getPremiumSubscriptionBinding(
  subscriptionId: string,
): Promise<PremiumSubscriptionBinding | null> {
  try {
    return await kv.get<PremiumSubscriptionBinding>(keys.premiumBySubscription(subscriptionId));
  } catch {
    return null;
  }
}

export async function setPremiumSubscriptionBinding(
  subscriptionId: string,
  binding: PremiumSubscriptionBinding,
): Promise<void> {
  await kv.set(keys.premiumBySubscription(subscriptionId), binding);
}

function entitlementIsActive(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const entitlement = value as Partial<PremiumEntitlement>;
  // Old boolean records could be created by the former self-issued-nonce and
  // arbitrary-email flows, so they are not payment proof. Only structured
  // records written from a verified Lemon Squeezy webhook are authoritative.
  if (entitlement.active !== true || entitlement.source !== "lemon-squeezy") return false;
  if (!entitlement.expiresAt) return true;
  const expiresAt = Date.parse(entitlement.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function getPremiumStatusByEmail(email: string): Promise<boolean> {
  try {
    return entitlementIsActive(await kv.get(keys.premiumByEmail(email)));
  } catch {
    return false;
  }
}

export async function getPremiumEmailByUserId(userId: string): Promise<string | null> {
  try {
    const email = await kv.get<string>(keys.premiumByUserId(userId));
    if (!email || !(await getPremiumStatusByEmail(email))) return null;
    return email;
  } catch {
    return null;
  }
}

export async function getPremiumStatusByUserId(userId: string): Promise<boolean> {
  return (await getPremiumEmailByUserId(userId)) !== null;
}

/** Link an authenticated account only from a verified paid checkout record. */
export async function bindPremiumUser(userId: string, email: string): Promise<boolean> {
  try {
    if (!(await getPremiumStatusByEmail(email))) return false;
    await kv.set(keys.premiumByUserId(userId), email.toLowerCase());
    return true;
  } catch {
    return false;
  }
}

export async function bindPremiumClientForUser(userId: string, clientId: string): Promise<boolean> {
  const email = await getPremiumEmailByUserId(userId);
  return email ? bindPremiumClient(clientId, email) : false;
}

export async function getPremiumStatus(clientId: string): Promise<boolean> {
  try {
    const bindingKey = keys.premiumByClientId(clientId);
    const binding = await kv.get<unknown>(bindingKey);
    // A device record is only a pointer to a webhook-verified email
    // entitlement. Direct booleans from the former confirmation flow are
    // intentionally rejected because they were forgeable without payment.
    if (typeof binding !== "string" || !(await getPremiumStatusByEmail(binding))) return false;
    // Migrate older expiring pointers. The entitlement itself carries the
    // expiry, while this relationship must survive legitimate renewals.
    await kv.persist(bindingKey).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

export async function bindPremiumClient(clientId: string, email: string): Promise<boolean> {
  try {
    if (!(await getPremiumStatusByEmail(email))) return false;
    await kv.set(keys.premiumByClientId(clientId), email.toLowerCase());
    return true;
  } catch {
    return false;
  }
}

export async function setPremiumByEmail(
  email: string,
  clientId?: string,
  details: Omit<PremiumEntitlement, "active" | "source"> = {},
): Promise<boolean> {
  try {
    const key = keys.premiumByEmail(email);
    const existing = await kv.get<PremiumEntitlement | boolean>(key);
    const incomingTime = details.eventTimestamp ? Date.parse(details.eventTimestamp) : Date.now();
    const existingTime = typeof existing === "object" && existing?.eventTimestamp
      ? Date.parse(existing.eventTimestamp)
      : Number.NEGATIVE_INFINITY;

    if (details.subscriptionId && details.variantId) {
      const bindingKey = keys.premiumBySubscription(details.subscriptionId);
      const existingBinding = await kv.get<PremiumSubscriptionBinding>(bindingKey);
      const normalizedEmail = email.toLowerCase();
      if (existingBinding && existingBinding.email !== normalizedEmail) return false;
      const existingBindingTime = existingBinding?.eventTimestamp
        ? Date.parse(existingBinding.eventTimestamp)
        : Number.NEGATIVE_INFINITY;
      // Persist a missing subscription mapping even when this state event is
      // older, so later invoice-only renewal/refund events remain resolvable.
      if (!existingBinding || !Number.isFinite(existingBindingTime) || incomingTime >= existingBindingTime) {
        await kv.set(bindingKey, {
          email: normalizedEmail,
          variantId: details.variantId,
          eventTimestamp: details.eventTimestamp || new Date().toISOString(),
        } satisfies PremiumSubscriptionBinding);
      }
    }

    // Ignore delayed activation events older than a state already received.
    // At an equal timestamp, a revocation tombstone wins.
    if (Number.isFinite(existingTime) && (
      incomingTime < existingTime
      || (incomingTime === existingTime && existing && typeof existing === "object" && !existing.active)
    )) {
      return true;
    }

    const entitlement: PremiumEntitlement = {
      active: true,
      source: "lemon-squeezy",
      ...details,
      eventTimestamp: details.eventTimestamp || new Date().toISOString(),
    };
    let ttlSeconds = 370 * 24 * 60 * 60;
    if (entitlement.expiresAt) {
      ttlSeconds = Math.max(60, Math.ceil((Date.parse(entitlement.expiresAt) - Date.now()) / 1000));
    }
    // Keep ordering history beyond access expiry so a delayed older event
    // cannot reactivate a lapsed subscription after this record disappears.
    const orderingTtlSeconds = Math.max(
      2 * 370 * 24 * 60 * 60,
      ttlSeconds + 370 * 24 * 60 * 60,
    );
    await kv.set(key, entitlement, { ex: orderingTtlSeconds });

    if (clientId) {
      await kv.set(keys.premiumByClientId(clientId), email.toLowerCase());
    }
    return true;
  } catch {
    return false;
  }
}

export async function revokePremiumByEmail(
  email: string,
  clientId?: string,
  details: Pick<PremiumEntitlement, "eventTimestamp" | "orderId" | "subscriptionId" | "variantId"> = {},
): Promise<void> {
  const key = keys.premiumByEmail(email);
  const existing = await kv.get<PremiumEntitlement | boolean>(key);
  const incomingTime = details.eventTimestamp ? Date.parse(details.eventTimestamp) : Date.now();
  const existingTime = typeof existing === "object" && existing?.eventTimestamp
    ? Date.parse(existing.eventTimestamp)
    : Number.NEGATIVE_INFINITY;
  if (Number.isFinite(existingTime) && incomingTime < existingTime) return;

  const tombstone: PremiumEntitlement = {
    active: false,
    source: "lemon-squeezy",
    ...details,
    eventTimestamp: details.eventTimestamp || new Date().toISOString(),
  };
  // Keep a terminal state long enough to reject delayed or replayed paid events.
  await kv.set(key, tombstone, { ex: 2 * 370 * 24 * 60 * 60 });
  if (clientId) await kv.set(keys.premiumByClientId(clientId), email.toLowerCase());
}

export interface CheckoutRecord {
  clientId: string;
  plan: "monthly" | "yearly";
  paid: boolean;
  used: boolean;
  accountUserId?: string;
  accountEmail?: string;
  email?: string;
  orderId?: string;
}

export async function getCheckoutRecord(nonce: string): Promise<CheckoutRecord | null> {
  try {
    const raw = await kv.get<CheckoutRecord | string>(keys.checkout(nonce));
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) as CheckoutRecord : raw;
  } catch {
    return null;
  }
}

export async function setCheckoutRecord(
  nonce: string,
  record: CheckoutRecord,
  ttlSeconds = 24 * 60 * 60,
): Promise<void> {
  await kv.set(keys.checkout(nonce), record, { ex: ttlSeconds });
}

const COMPARE_DELETE_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  end
  return 0
`;

const COMPLETE_WEBHOOK_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    redis.call("SET", KEYS[1], "processed")
    return 1
  end
  return 0
`;

export async function beginPremiumWebhook(
  eventHash: string,
  ownerToken: string,
): Promise<"acquired" | "processed" | "busy"> {
  const key = keys.webhookEvent(eventHash);
  const existing = await kv.get<string>(key);
  if (existing === "processed") return "processed";
  const acquired = await kv.set(key, ownerToken, { nx: true, ex: 300 });
  return acquired ? "acquired" : "busy";
}

export async function completePremiumWebhook(eventHash: string, ownerToken: string): Promise<boolean> {
  return Boolean(await kv.eval<[string], number>(
    COMPLETE_WEBHOOK_SCRIPT,
    [keys.webhookEvent(eventHash)],
    [ownerToken],
  ));
}

export async function abandonPremiumWebhook(eventHash: string, ownerToken: string): Promise<void> {
  await kv.eval<[string], number>(
    COMPARE_DELETE_SCRIPT,
    [keys.webhookEvent(eventHash)],
    [ownerToken],
  );
}

export async function acquirePremiumCustomerLock(
  customerHash: string,
  ownerToken: string,
): Promise<boolean> {
  return Boolean(await kv.set(
    keys.webhookCustomerLock(customerHash),
    ownerToken,
    { nx: true, ex: 300 },
  ));
}

export async function releasePremiumCustomerLock(
  customerHash: string,
  ownerToken: string,
): Promise<void> {
  // Compare-and-delete must be one Redis operation: a separate GET followed by
  // DEL could erase a lock acquired by another worker after TTL expiry.
  await kv.eval<[string], number>(
    COMPARE_DELETE_SCRIPT,
    [keys.webhookCustomerLock(customerHash)],
    [ownerToken],
  );
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

export async function incrementDailyUsage(clientId: string): Promise<{ ok: boolean; count: number; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  let count: number;
  try {
    count = await kv.incr(keys.dailyUsage(clientId, date));
  } catch {
    // Local tools remain usable if quota storage is unavailable.
    return { ok: true, count: 0, remaining: 5 };
  }

  try {
    await kv.expire(keys.dailyUsage(clientId, date), 86400);
    if (count <= 5) {
      await kv.incr(keys.totalProcessed());
      await kv.incr(keys.dailyGlobal(date));
    }
  } catch {
    // Analytics failure does not alter the already-reserved allowance.
  }
  return { ok: count <= 5, count, remaining: Math.max(0, 5 - count) };
}

export async function getTotalProcessed(): Promise<number> {
  try {
    return (await kv.get<number>(keys.totalProcessed())) || 0;
  } catch {
    return 0;
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

export async function getChatUsage(clientId: string, limit = CHAT_DAILY_LIMIT): Promise<{ count: number; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = (await kv.get<number>(keys.chatUsage(clientId, date))) || 0;
    return { count, remaining: Math.max(0, limit - count) };
  } catch {
    return { count: limit, remaining: 0 };
  }
}

export async function trackChatUsage(clientId: string, limit = CHAT_DAILY_LIMIT): Promise<{ ok: boolean; remaining: number }> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const count = await kv.incr(keys.chatUsage(clientId, date));
    await kv.expire(keys.chatUsage(clientId, date), 86400);
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    // AI usage fails closed so an unavailable counter cannot create unbounded API cost.
    return { ok: false, remaining: 0 };
  }
}
