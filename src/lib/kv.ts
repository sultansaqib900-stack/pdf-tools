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

interface PremiumGrant {
  active: boolean;
  expiresAt?: string;
  eventTimestamp: string;
  orderId?: string;
  subscriptionId?: string;
  variantId?: string;
}

interface PremiumEntitlement {
  source: "lemon-squeezy";
  grants: Record<string, PremiumGrant>;
}

interface LegacyPremiumEntitlement extends Partial<PremiumGrant> {
  source?: string;
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

const ENTITLEMENT_RETENTION_SECONDS = 2 * 370 * 24 * 60 * 60;

function grantStorageKey(details: Pick<PremiumGrant, "subscriptionId" | "orderId">): string {
  if (details.subscriptionId) return `subscription:${details.subscriptionId}`;
  if (details.orderId) return `order:${details.orderId}`;
  return "unscoped";
}

function storedEventTimestamp(value: unknown): string {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : new Date(0).toISOString();
}

function normalizeEntitlement(value: unknown): PremiumEntitlement | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<PremiumEntitlement> & LegacyPremiumEntitlement;
  // Boolean and non-Lemon records from the former self-issued confirmation
  // flow are not payment proof. Only signed-webhook records are migrated.
  if (stored.source !== "lemon-squeezy") return null;

  if (stored.grants && typeof stored.grants === "object" && !Array.isArray(stored.grants)) {
    const grants: Record<string, PremiumGrant> = {};
    for (const [key, candidate] of Object.entries(stored.grants)) {
      if (!candidate || typeof candidate !== "object") continue;
      const grant = candidate as Partial<PremiumGrant>;
      if (typeof grant.active !== "boolean") continue;
      grants[key] = {
        active: grant.active,
        eventTimestamp: storedEventTimestamp(grant.eventTimestamp),
        ...(grant.expiresAt ? { expiresAt: grant.expiresAt } : {}),
        ...(grant.orderId ? { orderId: grant.orderId } : {}),
        ...(grant.subscriptionId ? { subscriptionId: grant.subscriptionId } : {}),
        ...(grant.variantId ? { variantId: grant.variantId } : {}),
      };
    }
    return { source: "lemon-squeezy", grants };
  }

  // Transparently migrate structured records created by the immediately prior
  // webhook implementation. Their Lemon source is authoritative; raw booleans
  // and records marked as legacy remain rejected.
  if (typeof stored.active === "boolean") {
    const grant: PremiumGrant = {
      active: stored.active,
      eventTimestamp: storedEventTimestamp(stored.eventTimestamp),
      ...(stored.expiresAt ? { expiresAt: stored.expiresAt } : {}),
      ...(stored.orderId ? { orderId: stored.orderId } : {}),
      ...(stored.subscriptionId ? { subscriptionId: stored.subscriptionId } : {}),
      ...(stored.variantId ? { variantId: stored.variantId } : {}),
    };
    return {
      source: "lemon-squeezy",
      grants: { [grantStorageKey(grant)]: grant },
    };
  }

  return null;
}

function grantIsActive(grant: PremiumGrant): boolean {
  if (!grant.active) return false;
  if (!grant.expiresAt) return true;
  const expiresAt = Date.parse(grant.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function entitlementIsActive(value: unknown): boolean {
  const entitlement = normalizeEntitlement(value);
  return Boolean(entitlement && Object.values(entitlement.grants).some(grantIsActive));
}

function matchingGrantKey(
  grants: Record<string, PremiumGrant>,
  details: Pick<PremiumGrant, "subscriptionId" | "orderId">,
): string {
  const exactKey = grantStorageKey(details);
  if (grants[exactKey]) return exactKey;

  for (const [key, grant] of Object.entries(grants)) {
    if (details.subscriptionId && grant.subscriptionId === details.subscriptionId) return key;
    if (details.orderId && grant.orderId === details.orderId) return key;
  }
  return exactKey;
}

function eventTime(value?: string): number {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

async function writeEntitlement(key: string, entitlement: PremiumEntitlement): Promise<void> {
  const latestExpiry = Object.values(entitlement.grants).reduce((latest, grant) => {
    const parsed = grant.expiresAt ? Date.parse(grant.expiresAt) : Number.NaN;
    return Number.isFinite(parsed) ? Math.max(latest, parsed) : latest;
  }, 0);
  const expiryRetention = latestExpiry > 0
    ? Math.ceil((latestExpiry - Date.now()) / 1000) + 370 * 24 * 60 * 60
    : 0;
  await kv.set(key, entitlement, {
    ex: Math.max(ENTITLEMENT_RETENTION_SECONDS, expiryRetention, 60),
  });
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
    if (!email) return null;
    // The stored pointer can reference a paid entitlement or a server-
    // configured owner grant; both are valid Premium sources.
    if (isAdminPremiumEmail(email) || (await getPremiumStatusByEmail(email))) {
      return email;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPremiumStatusByUserId(userId: string): Promise<boolean> {
  return (await getPremiumEmailByUserId(userId)) !== null;
}

/**
 * Server-configured owner/support grants. Keep the email in Vercel only;
 * never commit account identifiers or payment overrides to source control.
 */
export function isAdminPremiumEmail(email: string): boolean {
  const configured = (process.env.PREMIUM_ADMIN_EMAILS || "")
    .split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

/**
 * Grant a configured (env) Premium account. Returns true when the account
 * matches PREMIUM_ADMIN_EMAILS; the entitlement is persisted so device
 * binding and cross-device login also see it.
 */
export async function grantConfiguredPremium(userId: string, email: string): Promise<boolean> {
  if (!isAdminPremiumEmail(email)) return false;
  await kv.set(keys.premiumByUserId(userId), email.trim().toLowerCase());
  return true;
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
    // entitlement (or a server-configured owner grant). Direct booleans from
    // the former confirmation flow are intentionally rejected because they
    // were forgeable without payment.
    if (typeof binding !== "string") return false;
    if (isAdminPremiumEmail(binding)) return true;
    if (!(await getPremiumStatusByEmail(binding))) return false;
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
    // A configured owner/support email is a valid entitlement source too, so
    // the env-granted account can bind devices like any paid subscription.
    if (!(await getPremiumStatusByEmail(email)) && !isAdminPremiumEmail(email)) return false;
    await kv.set(keys.premiumByClientId(clientId), email.trim().toLowerCase());
    return true;
  } catch {
    return false;
  }
}

type PremiumGrantDetails = Partial<Omit<PremiumGrant, "active">>;

export async function setPremiumByEmail(
  email: string,
  clientId?: string,
  details: PremiumGrantDetails = {},
): Promise<boolean> {
  try {
    const key = keys.premiumByEmail(email);
    const rawExisting = await kv.get<unknown>(key);
    const entitlement = normalizeEntitlement(rawExisting) || {
      source: "lemon-squeezy" as const,
      grants: {},
    };
    const timestamp = details.eventTimestamp || new Date().toISOString();
    const incomingTime = eventTime(timestamp);

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
          eventTimestamp: timestamp,
        } satisfies PremiumSubscriptionBinding);
      }
    }

    const existingKey = matchingGrantKey(entitlement.grants, details);
    const existingGrant = entitlement.grants[existingKey];
    const existingTime = existingGrant
      ? eventTime(existingGrant.eventTimestamp)
      : Number.NEGATIVE_INFINITY;

    // Ordering is scoped to this purchase. A late event for one subscription
    // must not overwrite a newer, independent subscription on the same email.
    // At an equal timestamp, a revocation tombstone wins.
    if (
      incomingTime < existingTime
      || (incomingTime === existingTime && existingGrant && !existingGrant.active)
    ) {
      return true;
    }

    const targetKey = details.subscriptionId
      ? grantStorageKey({ subscriptionId: details.subscriptionId })
      : existingKey;
    const nextGrant: PremiumGrant = {
      ...existingGrant,
      active: true,
      eventTimestamp: timestamp,
      ...(details.expiresAt ? { expiresAt: details.expiresAt } : {}),
      ...(details.orderId ? { orderId: details.orderId } : {}),
      ...(details.subscriptionId ? { subscriptionId: details.subscriptionId } : {}),
      ...(details.variantId ? { variantId: details.variantId } : {}),
    };
    if (targetKey !== existingKey) delete entitlement.grants[existingKey];
    // A subscription event carrying its order ID upgrades the provisional
    // order grant instead of counting one purchase twice.
    if (details.orderId) {
      for (const [candidateKey, candidate] of Object.entries(entitlement.grants)) {
        if (candidateKey !== targetKey && candidate.orderId === details.orderId) {
          delete entitlement.grants[candidateKey];
        }
      }
    }
    entitlement.grants[targetKey] = nextGrant;
    await writeEntitlement(key, entitlement);

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
  details: PremiumGrantDetails = {},
): Promise<void> {
  const key = keys.premiumByEmail(email);
  const rawExisting = await kv.get<unknown>(key);
  const entitlement = normalizeEntitlement(rawExisting) || {
    source: "lemon-squeezy" as const,
    grants: {},
  };
  const timestamp = details.eventTimestamp || new Date().toISOString();
  const incomingTime = eventTime(timestamp);
  const existingKey = matchingGrantKey(entitlement.grants, details);
  const existingGrant = entitlement.grants[existingKey];
  const existingTime = existingGrant
    ? eventTime(existingGrant.eventTimestamp)
    : Number.NEGATIVE_INFINITY;
  if (incomingTime < existingTime) return;

  const targetKey = details.subscriptionId
    ? grantStorageKey({ subscriptionId: details.subscriptionId })
    : existingKey;
  const tombstone: PremiumGrant = {
    ...existingGrant,
    active: false,
    eventTimestamp: timestamp,
    ...(details.orderId ? { orderId: details.orderId } : {}),
    ...(details.subscriptionId ? { subscriptionId: details.subscriptionId } : {}),
    ...(details.variantId ? { variantId: details.variantId } : {}),
  };
  if (targetKey !== existingKey) delete entitlement.grants[existingKey];
  if (details.orderId) {
    for (const [candidateKey, candidate] of Object.entries(entitlement.grants)) {
      if (candidateKey !== targetKey && candidate.orderId === details.orderId) {
        delete entitlement.grants[candidateKey];
      }
    }
  }
  entitlement.grants[targetKey] = tombstone;
  // Keep terminal purchase state long enough to reject delayed paid events.
  await writeEntitlement(key, entitlement);
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
