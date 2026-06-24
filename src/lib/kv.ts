import { createClient } from "@vercel/kv";

const kv = createClient({
  url: process.env.pdf_tools_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.pdf_tools_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

const KV_PREFIX = "pdftools:";

export const keys = {
  premiumByClientId: (id: string) => `${KV_PREFIX}premium:client:${id}`,
  premiumByEmail: (email: string) => `${KV_PREFIX}premium:email:${email.toLowerCase()}`,
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
    if (clientId) {
      await kv.set(keys.premiumByClientId(clientId), true, { ex: 365 * 24 * 60 * 60 });
    }
    return true;
  } catch {
    return false;
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
