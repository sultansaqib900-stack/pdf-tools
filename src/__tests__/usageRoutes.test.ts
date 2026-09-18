import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route-level behaviour of the shared lifetime trial:
 *  - basic tools never call any of these endpoints (enforced by convention;
 *    these routes exist only for professional tools),
 *  - anonymous users are keyed by client id, authenticated users by account,
 *  - premium users bypass without consuming,
 *  - invalid client ids fail closed,
 *  - concurrent reserves cannot exceed five.
 */
const mocks = vi.hoisted(() => ({
  getAuthenticatedSession: vi.fn(),
  getPremiumStatus: vi.fn(async () => false),
  getPremiumStatusByUserId: vi.fn(async () => false),
  grantConfiguredPremium: vi.fn(async () => false),
  isAdminPremiumEmail: vi.fn(async () => false),
  kv: new Map<string, unknown>(),
}));

vi.mock("@/lib/auth/request", () => ({ getAuthenticatedSession: mocks.getAuthenticatedSession }));
vi.mock("@/lib/kv", () => ({
  kv: {
    get: vi.fn(async (key: string) => mocks.kv.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      mocks.kv.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key: string) => {
      mocks.kv.delete(key);
    }),
    incr: vi.fn(async (key: string) => {
      const next = Number(mocks.kv.get(key) || 0) + 1;
      mocks.kv.set(key, next);
      return next;
    }),
    eval: vi.fn(async (script: string, keys: string[], args: string[]) => {
      // Emulate the two trial scripts with real Redis semantics so the route
      // tests exercise the counter through the same KV interface as production.
      const get = (key: string) => mocks.kv.get(key);
      const put = (key: string, value: unknown) => mocks.kv.set(key, value);
      if (script.includes('redis.call("INCR", KEYS[1])') && script.includes("DECR")) {
        const count = Number(get(keys[0]) || 0) + 1;
        put(keys[0], count);
        if (count > Number(args[0])) {
          put(keys[0], count - 1);
          return [-1, 0];
        }
        put(keys[1], "1");
        return [count, 3600];
      }
      if (script.includes('redis.call("DECR", KEYS[1])')) {
        if (get(keys[1]) === "1") {
          mocks.kv.delete(keys[1]);
          const count = Number(get(keys[0]) || 0) - 1;
          put(keys[0], Math.max(0, count));
          return [1, Math.max(0, count)];
        }
        return [0, -1];
      }
      throw new Error("Unhandled script");
    }),
  },
  keys: {
    totalProcessed: () => "pdftools:stats:total_processed",
    dailyGlobal: (date: string) => `pdftools:stats:daily:${date}`,
  },
  getPremiumStatus: mocks.getPremiumStatus,
  getPremiumStatusByUserId: mocks.getPremiumStatusByUserId,
  grantConfiguredPremium: mocks.grantConfiguredPremium,
  isAdminPremiumEmail: mocks.isAdminPremiumEmail,
  bindPremiumClientForUser: vi.fn(async () => false),
  trackChatUsage: vi.fn(async () => ({ ok: true, remaining: 1 })),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60_000 })),
  rateLimitResponse: vi.fn(),
}));

function get(path: string): NextRequest {
  return new NextRequest(`https://example.com${path}`);
}

function post(path: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.kv.clear();
  mocks.getAuthenticatedSession.mockResolvedValue(null);
  mocks.getPremiumStatus.mockResolvedValue(false);
  mocks.getPremiumStatusByUserId.mockResolvedValue(false);
  mocks.grantConfiguredPremium.mockResolvedValue(false);
  mocks.isAdminPremiumEmail.mockResolvedValue(false);
});

describe("GET /api/usage/check", () => {
  it("reports the shared lifetime allowance for an anonymous client", async () => {
    const { GET } = await import("@/app/api/usage/check/route");
    const response = await GET(get("/api/usage/check?clientId=abcd1234-client"));
    const data = await response.json();
    expect(data).toEqual(expect.objectContaining({ ok: true, premium: false, remaining: 5, used: 0, limit: 5 }));
  });

  it("rejects invalid client ids instead of failing open", async () => {
    const { GET } = await import("@/app/api/usage/check/route");
    const response = await GET(get("/api/usage/check?clientId=bad%20id%20with%20spaces"));
    expect(response.status).toBe(400);
  });

  it("lets premium users bypass the trial without a remaining count", async () => {
    mocks.getPremiumStatus.mockResolvedValue(true);
    const { GET } = await import("@/app/api/usage/check/route");
    const response = await GET(get("/api/usage/check?clientId=abcd1234-client"));
    const data = await response.json();
    expect(data).toEqual(expect.objectContaining({ ok: true, premium: true, remaining: null }));
  });

  it("keys the allowance to the signed-in account, not the device", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue({ userId: "user-1", email: "free@example.com" });
    const { GET } = await import("@/app/api/usage/check/route");
    const first = await GET(get("/api/usage/check?clientId=abcd1234-client"));
    const data = await first.json();
    // Whatever device id was sent, an authenticated identity wins; nothing is
    // recorded under the client namespace for a signed-in request.
    expect(mocks.kv.has("pdftools:trial:client:abcd1234-client")).toBe(false);
    expect(data.premium).toBe(false);
  });
});

describe("POST /api/usage/reserve + /api/usage/release", () => {
  it("reserves atomically and never grants a sixth file across racing tabs", async () => {
    const { POST } = await import("@/app/api/usage/reserve/route");
    const attempts = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        POST(post("/api/usage/reserve", { clientId: "abcd1234-client", reservationId: `reservation-${index}` })),
      ),
    );
    const bodies = await Promise.all(attempts.map((response) => response.json()));
    expect(bodies.filter((body: { ok: boolean }) => body.ok)).toHaveLength(5);
    expect(bodies.filter((body: { ok: boolean }) => body.ok === false)).toHaveLength(3);

    const { GET } = await import("@/app/api/usage/check/route");
    const data = await (await GET(get("/api/usage/check?clientId=abcd1234-client"))).json();
    expect(data.used).toBe(5);
    expect(data.remaining).toBe(0);
  });

  it("does not count failed processing: release refunds the reservation once", async () => {
    const { POST: reserve } = await import("@/app/api/usage/reserve/route");
    const { POST: release } = await import("@/app/api/usage/release/route");
    await reserve(post("/api/usage/reserve", { clientId: "abcd1234-client", reservationId: "reservation-1" }));

    const refunded = await (await release(post("/api/usage/release", { clientId: "abcd1234-client", reservationId: "reservation-1" }))).json();
    expect(refunded.ok).toBe(true);

    // Replaying the token cannot mint additional allowance.
    const replay = await (await release(post("/api/usage/release", { clientId: "abcd1234-client", reservationId: "reservation-1" }))).json();
    expect(replay.ok).toBe(false);

    const { GET } = await import("@/app/api/usage/check/route");
    const data = await (await GET(get("/api/usage/check?clientId=abcd1234-client"))).json();
    expect(data.used).toBe(0);
    expect(data.remaining).toBe(5);
  });

  it("premium users reserve without consuming the shared counter", async () => {
    mocks.getPremiumStatus.mockResolvedValue(true);
    const { POST } = await import("@/app/api/usage/reserve/route");
    const data = await (await POST(post("/api/usage/reserve", { clientId: "abcd1234-client", reservationId: "reservation-1" }))).json();
    expect(data).toEqual(expect.objectContaining({ ok: true, premium: true, remaining: null }));
    expect(mocks.kv.has("pdftools:trial:client:abcd1234-client")).toBe(false);
  });

  it("applies the configured server-side owner grant to authenticated sessions", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue({ userId: "user-1", email: "owner@example.com" });
    mocks.isAdminPremiumEmail.mockResolvedValue(true);
    const { POST } = await import("@/app/api/usage/reserve/route");
    const data = await (await POST(post("/api/usage/reserve", { clientId: "abcd1234-client", reservationId: "reservation-1" }))).json();
    expect(data).toEqual(expect.objectContaining({ ok: true, premium: true }));
  });

  it("fails closed on malformed reservations", async () => {
    const { POST } = await import("@/app/api/usage/reserve/route");
    const response = await POST(post("/api/usage/reserve", { clientId: "abcd1234-client", reservationId: "not valid!" }));
    expect(response.status).toBe(400);
  });
});
