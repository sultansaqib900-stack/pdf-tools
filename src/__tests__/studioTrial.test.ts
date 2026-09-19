import { NextRequest } from "next/server";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { STUDIO_TRIAL_DURATION_MS, checkStudioFileSize } from "@/lib/studioTrial";

const mocks = vi.hoisted(() => ({
  records: new Map<string, number>(),
  identity: vi.fn(),
  rateLimit: vi.fn(),
  eval: vi.fn(),
}));
vi.mock("@/lib/kv", () => ({ kv: { eval: mocks.eval } }));
vi.mock("@/lib/usageIdentity", () => ({
  resolveUsageIdentity: mocks.identity,
  sanitizeClientId: (raw: unknown) => typeof raw === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(raw) ? raw : null,
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  rateLimitResponse: () => new Response("rate limited", { status: 429 }),
}));
import { GET, POST } from "@/app/api/studio/trial/route";
import { studioTrialKey } from "@/lib/studioTrialStore";

function get(clientId = "test-client-123") {
  return new NextRequest(`https://example.com/api/studio/trial?clientId=${clientId}`);
}
function post(body: unknown = { clientId: "test-client-123" }, origin = "https://example.com") {
  return new NextRequest("https://example.com/api/studio/trial", {
    method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-19T00:00:00Z"));
  vi.clearAllMocks();
  mocks.records.clear();
  mocks.identity.mockImplementation(async (_req, id) => ({ identity: `client:${id}`, premium: false }));
  mocks.rateLimit.mockResolvedValue({ success: true, reset: Date.now() + 60_000 });
  // Emulate the script's atomic read/earliest-write using Redis server time.
  mocks.eval.mockImplementation(async (_script: string, keys: string[], args: string[]) => {
    let started = 0;
    const now = Date.now();
    for (const key of keys) {
      if (!mocks.records.has(key)) continue;
      const value = mocks.records.get(key)!;
      if (!Number.isFinite(value) || value <= 0 || value > now) return [-1, now];
      started = started ? Math.min(started, value) : value;
    }
    if (!started && args[0] === "1") started = now;
    if (started) for (const key of keys) mocks.records.set(key, started);
    return [started, now];
  });
});
afterEach(() => vi.useRealTimers());

describe("Studio-only 72-hour trial", () => {
  it("does not start on a page/status visit and is never cached", async () => {
    const response = await GET(get());
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ ok: true, status: "not_started", expiresAt: null, remainingMs: 0 });
    expect(mocks.records.size).toBe(0);
  });

  it("starts explicitly, remains active just before 72 hours, and expires exactly at the boundary", async () => {
    const now = Date.now();
    expect(await (await POST(post())).json()).toEqual({ ok: true, status: "active", expiresAt: now + STUDIO_TRIAL_DURATION_MS, remainingMs: STUDIO_TRIAL_DURATION_MS });
    vi.setSystemTime(now + STUDIO_TRIAL_DURATION_MS - 1);
    expect(await (await GET(get())).json()).toMatchObject({ status: "active", remainingMs: 1 });
    vi.setSystemTime(now + STUDIO_TRIAL_DURATION_MS);
    expect(await (await GET(get())).json()).toMatchObject({ status: "expired", remainingMs: 0 });
  });

  it("cannot extend or restart on repeated activation, reload, or concurrent tabs", async () => {
    const first = await (await POST(post())).json();
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    const concurrent = await Promise.all([POST(post()), POST(post()), GET(get())]);
    for (const response of concurrent) expect(await response.json()).toMatchObject({ expiresAt: first.expiresAt, remainingMs: STUDIO_TRIAL_DURATION_MS - 24 * 60 * 60 * 1000 });
    vi.advanceTimersByTime(STUDIO_TRIAL_DURATION_MS);
    expect(await (await POST(post())).json()).toMatchObject({ status: "expired", expiresAt: first.expiresAt });
    expect(mocks.records.size).toBe(1);
  });

  it("links the earliest device activation to an account without restarting on login or another device", async () => {
    const first = await (await POST(post())).json();
    vi.advanceTimersByTime(3600_000);
    mocks.identity.mockResolvedValue({ identity: "user:account-1", premium: false });
    expect(await (await GET(get())).json()).toMatchObject({ expiresAt: first.expiresAt });
    expect(await (await POST(post({ clientId: "second-device" }))).json()).toMatchObject({ expiresAt: first.expiresAt });
    expect(mocks.records.get(studioTrialKey("client:second-device"))).toBe(first.expiresAt - STUDIO_TRIAL_DURATION_MS);
  });

  it("does not let signing out extend an earlier account trial", async () => {
    mocks.identity.mockResolvedValue({ identity: "user:account-1", premium: false });
    const first = await (await POST(post())).json();
    vi.advanceTimersByTime(STUDIO_TRIAL_DURATION_MS);
    mocks.identity.mockResolvedValue({ identity: "client:test-client-123", premium: false });
    expect(await (await POST(post())).json()).toMatchObject({ status: "expired", expiresAt: first.expiresAt });
  });

  it("lets Premium users through without starting, changing, or consuming a trial", async () => {
    mocks.identity.mockResolvedValue({ identity: "user:paid", premium: true });
    for (const response of [await GET(get()), await POST(post())]) {
      expect(await response.json()).toEqual({ ok: true, status: "premium", expiresAt: null, remainingMs: 0 });
    }
    expect(mocks.eval).not.toHaveBeenCalled();
  });

  it("keeps Studio state in its own namespace, separate from Premium and the five-file allowance", async () => {
    await POST(post());
    expect([...mocks.records.keys()]).toEqual(["pdftools:studio-trial:client:test-client-123"]);
  });

  it("does not trust client-supplied dates or membership", async () => {
    const response = await POST(post({ clientId: "test-client-123", premium: true, startedAt: 0, expiresAt: Number.MAX_SAFE_INTEGER }));
    expect(await response.json()).toMatchObject({ status: "active", expiresAt: Date.now() + STUDIO_TRIAL_DURATION_MS });
  });

  it("fails closed on unavailable or corrupted trial storage", async () => {
    mocks.eval.mockRejectedValueOnce(new Error("KV unavailable"));
    expect((await POST(post())).status).toBe(503);
    mocks.records.set(studioTrialKey("client:test-client-123"), Number.NaN);
    expect((await GET(get())).status).toBe(503);
    mocks.records.set(studioTrialKey("client:test-client-123"), Date.now() + 5000);
    expect((await POST(post())).status).toBe(503);
  });

  it("rejects invalid identities, malformed bodies, and cross-origin activation", async () => {
    expect((await GET(get("bad"))).status).toBe(400);
    expect((await POST(post(null))).status).toBe(400);
    const malformed = new NextRequest("https://example.com/api/studio/trial", { method: "POST", body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    expect((await POST(post(undefined, "https://other.example"))).status).toBe(403);
    expect(mocks.eval).not.toHaveBeenCalled();
  });

  it("rate limits status and activation without touching trial state", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, reset: Date.now() + 60_000 });
    expect((await GET(get())).status).toBe(429);
    expect((await POST(post())).status).toBe(429);
    expect(mocks.eval).not.toHaveBeenCalled();
  });

  it("allows the Studio 100MB size limit without changing free-tool limits", () => {
    expect(checkStudioFileSize(100 * 1024 * 1024).ok).toBe(true);
    expect(checkStudioFileSize(100 * 1024 * 1024 + 1).ok).toBe(false);
  });
});
