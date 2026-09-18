import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * In-memory Redis emulation with the exact semantics the trial store relies
 * on: INCR/DECR, SET with EX, GET, DEL, and atomic Lua evaluation. The Lua
 * emulation executes each script synchronously against the same store, which
 * is precisely the interleaving semantics Redis guarantees for concurrent
 * clients: scripts are atomic, so any interleaving is equivalent to a serial
 * execution of whole scripts.
 */
const store = new Map<string, { value: string | number; expiresAt?: number }>();

function now(): number {
  return Date.now();
}

function get(key: string): string | number | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt !== undefined && entry.expiresAt < now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value as string | number;
}

function set(key: string, value: string | number, options?: { ex?: number }): void {
  store.set(key, { value, expiresAt: options?.ex ? now() + options.ex * 1000 : undefined });
}

function incr(key: string): number {
  const next = Number(get(key) ?? 0) + 1;
  set(key, next);
  return next;
}

function decr(key: string): number {
  const next = Number(get(key) ?? 0) - 1;
  set(key, next);
  return next;
}

function evalScript(script: string, keys: string[], args: string[]): unknown[] {
  // RESERVE: INCR KEYS[1], reject-and-roll-back above ARGV[1], set token KEYS[2].
  if (script.includes('redis.call("INCR", KEYS[1])') && script.includes("DECR")) {
    const count = incr(keys[0]);
    if (count === 1) {
      const entry = store.get(keys[0]);
      if (entry) entry.expiresAt = now() + Number(args[1]) * 1000;
    }
    if (count > Number(args[0])) {
      decr(keys[0]);
      return [-1, 0];
    }
    set(keys[1], "1", { ex: Number(args[1]) });
    return [count, 3600];
  }
  // RELEASE: single-use token, decrement once, clamp at zero.
  if (script.includes('redis.call("DECR", KEYS[1])')) {
    if (get(keys[1]) === "1") {
      store.delete(keys[1]);
      const count = decr(keys[0]);
      if (count < 0) {
        set(keys[0], "0", { ex: Number(args[0]) });
        return [1, 0];
      }
      return [1, count];
    }
    return [0, -1];
  }
  throw new Error(`Unhandled script in test mock: ${script.slice(0, 60)}`);
}

vi.mock("@vercel/kv", () => ({
  createClient: () => ({
    get: vi.fn(async (key: string) => get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown, options?: { ex?: number; nx?: boolean }) => {
      if (options?.nx && get(key) !== undefined) return null;
      set(key, String(value), options);
      return "OK";
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
    incr: vi.fn(async (key: string) => incr(key)),
    expire: vi.fn(async () => 1),
    persist: vi.fn(async () => 1),
    ttl: vi.fn(async () => 60),
    eval: vi.fn(async (script: string, keys: string[], args: string[]) => evalScript(script, keys, args)),
  }),
}));

import {
  getTrialUsage,
  releaseTrialUse,
  reserveTrialUse,
  TRIAL_FILE_LIMIT,
} from "@/lib/usageStore";

beforeEach(() => store.clear());

describe("shared lifetime professional-tools trial", () => {
  it("allows exactly five files for an anonymous identity — lifetime, not per day", async () => {
    for (let index = 0; index < TRIAL_FILE_LIMIT; index += 1) {
      const result = await reserveTrialUse("client:device-1", `res-${index}`);
      expect(result.ok).toBe(true);
    }
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 5, remaining: 0 });

    const blocked = await reserveTrialUse("client:device-1", "res-late");
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    // The rejected reservation must not have consumed anything.
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 5, remaining: 0 });
  });

  it("shares ONE counter across different professional tools", async () => {
    // The counter is shared: 2 diff + 1 Bates + 1 Certificate + 1 Redact = 5.
    const tools = ["pdf-diff", "pdf-diff", "bates-numbering", "certificate-generator", "search-redact"];
    for (const [index, tool] of tools.entries()) {
      const result = await reserveTrialUse("client:device-1", `${tool}-${index}`);
      expect(result.ok).toBe(true);
    }
    const usage = await getTrialUsage("client:device-1");
    expect(usage.used).toBe(5);
    expect(usage.remaining).toBe(0);

    // A sixth call on any professional tool is refused.
    expect((await reserveTrialUse("client:device-1", "pdf-diff-late")).ok).toBe(false);
  });

  it("does not count failed processing: a refunded reservation is reusable", async () => {
    const first = await reserveTrialUse("client:device-1", "res-1");
    expect(first.ok).toBe(true);
    expect((await getTrialUsage("client:device-1")).used).toBe(1);

    // Processing failed → refund. The release is single-use and idempotent.
    const release = await releaseTrialUse("client:device-1", "res-1");
    expect(release.ok).toBe(true);
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 0, remaining: 5 });

    // Replaying the same release token must not manufacture extra allowance.
    expect((await releaseTrialUse("client:device-1", "res-1")).ok).toBe(false);
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 0, remaining: 5 });

    // The refunded file is available again.
    expect((await reserveTrialUse("client:device-1", "res-2")).ok).toBe(true);
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 1, remaining: 4 });
  });

  it("keeps identities isolated: another browser/device gets its own trial", async () => {
    for (let index = 0; index < TRIAL_FILE_LIMIT; index += 1) {
      await reserveTrialUse("client:device-1", `res-${index}`);
    }
    expect((await reserveTrialUse("client:device-1", "blocked")).ok).toBe(false);
    // A different anonymous client is a different trial.
    const other = await reserveTrialUse("client:device-2", "fresh");
    expect(other.ok).toBe(true);
    expect(await getTrialUsage("client:device-2")).toEqual({ used: 1, remaining: 4 });
  });

  it("prevents multiple tabs from bypassing the limit with concurrent requests", async () => {
    // Five tabs race to reserve the same last file. Every reservation is a
    // complete atomic script, so exactly five may succeed — never six.
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, index) => reserveTrialUse("client:device-1", `tab-${index}`)),
    );
    const ok = results.filter((result) => result.ok).length;
    expect(ok).toBe(TRIAL_FILE_LIMIT);
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 5, remaining: 0 });
  });

  it("handles double-release and out-of-order refunds without corruption", async () => {
    await reserveTrialUse("client:device-1", "res-a");
    await reserveTrialUse("client:device-1", "res-b");
    expect((await getTrialUsage("client:device-1")).used).toBe(2);

    await releaseTrialUse("client:device-1", "res-a");
    await releaseTrialUse("client:device-1", "res-a"); // duplicate — ignored
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 1, remaining: 4 });

    // Refunding an unknown token is a no-op.
    expect((await releaseTrialUse("client:device-1", "unknown")).ok).toBe(false);
    expect(await getTrialUsage("client:device-1")).toEqual({ used: 1, remaining: 4 });
  });
});
