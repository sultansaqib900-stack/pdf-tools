import { kv, keys } from "@/lib/kv";

/**
 * Shared lifetime free-trial store for Premium/professional tools.
 *
 * Business rules:
 *  - Basic tools are unlimited and never touch this store.
 *  - Professional (premium) tools share ONE lifetime allowance of
 *    TRIAL_FILE_LIMIT files per person — not per tool, per day, or per month.
 *  - Paid Premium accounts bypass the allowance entirely.
 *
 * The counter lives server-side in KV. The browser only supplies a stable
 * anonymous client ID; client-side counters are never trusted. Reservations
 * are atomic Redis operations (single Lua script), so parallel requests from
 * multiple tabs cannot exceed the allowance. A failed processing job can
 * refund its reservation exactly once via a single-use reservation token.
 */

export const TRIAL_FILE_LIMIT = 5;

/** Lifetime allowance — keep the key effectively forever. */
const TRIAL_TTL_SECONDS = 10 * 365 * 24 * 60 * 60;

export function trialUsageKey(identity: string): string {
  return `pdftools:trial:${identity}`;
}

export function trialReservationKey(identity: string, reservationId: string): string {
  return `pdftools:trial-res:${identity}:${reservationId}`;
}

/**
 * Atomic reserve: increment the lifetime counter and only accept it when the
 * result stays within the allowance. INCR, the limit check, the rollback and
 * the single-use reservation token all run inside one Lua script, so two tabs
 * reserving at the same time can never both consume the last trial file.
 */
const RESERVE_TRIAL_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end
if count > tonumber(ARGV[1]) then
  redis.call("DECR", KEYS[1])
  return {-1, 0}
end
redis.call("SET", KEYS[2], "1", "EX", ARGV[2])
return {count, redis.call("TTL", KEYS[1])}
`;

/**
 * Atomic refund: consumes the reservation token and decrements the counter.
 * The token is deleted before decrementing so a reservation can be refunded
 * at most once, and the counter is clamped at zero.
 */
const RELEASE_TRIAL_SCRIPT = `
if redis.call("GET", KEYS[2]) == "1" then
  redis.call("DEL", KEYS[2])
  local count = redis.call("DECR", KEYS[1])
  if count < 0 then
    redis.call("SET", KEYS[1], 0, "EX", ARGV[1])
    return {1, 0}
  end
  return {1, count}
end
return {0, -1}
`;

export interface TrialUsage {
  used: number;
  remaining: number;
}

export async function getTrialUsage(identity: string): Promise<TrialUsage> {
  try {
    const used = (await kv.get<number>(trialUsageKey(identity))) || 0;
    return { used, remaining: Math.max(0, TRIAL_FILE_LIMIT - used) };
  } catch {
    return { used: 0, remaining: TRIAL_FILE_LIMIT };
  }
}

/**
 * Reserve one file of the shared lifetime allowance.
 * Returns ok:false when the allowance is exhausted.
 */
export async function reserveTrialUse(
  identity: string,
  reservationId: string,
): Promise<{ ok: boolean } & TrialUsage> {
  try {
    const [count] = await kv.eval<string[], string[]>(
      RESERVE_TRIAL_SCRIPT,
      [trialUsageKey(identity), trialReservationKey(identity, reservationId)],
      [String(TRIAL_FILE_LIMIT), String(TRIAL_TTL_SECONDS)],
    ) as unknown as [number, number];
    if (count < 0) {
      const { used } = await getTrialUsage(identity);
      return { ok: false, used, remaining: 0 };
    }
    return { ok: true, used: count, remaining: Math.max(0, TRIAL_FILE_LIMIT - count) };
  } catch {
    // Storage unavailable: free tools stay usable (existing fail-open policy
    // for the usage counter; payment verification remains fail-closed).
    return { ok: true, used: 0, remaining: TRIAL_FILE_LIMIT };
  }
}

/** Refund one reservation after a processing failure. Idempotent per token. */
export async function releaseTrialUse(
  identity: string,
  reservationId: string,
): Promise<{ ok: boolean } & TrialUsage> {
  try {
    const [released, count] = await kv.eval<string[], string[]>(
      RELEASE_TRIAL_SCRIPT,
      [trialUsageKey(identity), trialReservationKey(identity, reservationId)],
      [String(TRIAL_TTL_SECONDS)],
    ) as unknown as [number, number];
    if (!released) {
      const { used } = await getTrialUsage(identity);
      return { ok: false, used, remaining: Math.max(0, TRIAL_FILE_LIMIT - used) };
    }
    return { ok: true, used: Math.max(0, count), remaining: Math.max(0, TRIAL_FILE_LIMIT - Math.max(0, count)) };
  } catch {
    const { used } = await getTrialUsage(identity);
    return { ok: false, used, remaining: Math.max(0, TRIAL_FILE_LIMIT - used) };
  }
}

/** Record a completed reservation in the public stats counters (best effort). */
export async function recordTrialProcessingStat(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  try {
    await kv.incr(keys.totalProcessed());
    await kv.incr(keys.dailyGlobal(date));
  } catch {
    // Analytics failures never alter the reserved allowance.
  }
}
