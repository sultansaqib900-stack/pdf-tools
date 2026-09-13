import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bindPremiumClient: vi.fn(async () => true),
  bindPremiumClientForUser: vi.fn(async () => true),
  getCheckoutRecord: vi.fn(),
  getPremiumStatus: vi.fn(async () => false),
  getPremiumStatusByUserId: vi.fn(async () => false),
  setCheckoutRecord: vi.fn(async () => undefined),
  getAuthenticatedSession: vi.fn(),
}));

vi.mock("@/lib/kv", () => ({
  bindPremiumClient: mocks.bindPremiumClient,
  bindPremiumClientForUser: mocks.bindPremiumClientForUser,
  getCheckoutRecord: mocks.getCheckoutRecord,
  getPremiumStatus: mocks.getPremiumStatus,
  getPremiumStatusByUserId: mocks.getPremiumStatusByUserId,
  setCheckoutRecord: mocks.setCheckoutRecord,
}));
vi.mock("@/lib/auth/request", () => ({ getAuthenticatedSession: mocks.getAuthenticatedSession }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: true, limit: 20, remaining: 19, reset: Date.now() + 60_000 })),
  rateLimitResponse: vi.fn(),
}));

function post(path: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`https://example.com${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("LEMONSQUEEZY_WEBHOOK_SECRET", "test-secret");
  mocks.bindPremiumClient.mockResolvedValue(true);
  mocks.bindPremiumClientForUser.mockResolvedValue(true);
  mocks.getPremiumStatus.mockResolvedValue(false);
  mocks.getPremiumStatusByUserId.mockResolvedValue(false);
  mocks.getAuthenticatedSession.mockResolvedValue(null);
});

describe("Premium confirmation and recovery routes", () => {
  it("does not treat a server-issued pending nonce as payment proof", async () => {
    mocks.getCheckoutRecord.mockResolvedValue({
      clientId: "client-1",
      plan: "monthly",
      paid: false,
      used: false,
    });
    const { POST } = await import("@/app/api/premium/confirm/route");
    const response = await POST(post("/api/premium/confirm", { clientId: "client-1", nonce: "nonce-1" }));
    expect(response.status).toBe(409);
    expect(mocks.bindPremiumClient).not.toHaveBeenCalled();
  });

  it("binds a device only after the webhook marked the checkout paid", async () => {
    mocks.getCheckoutRecord.mockResolvedValue({
      clientId: "client-1",
      plan: "monthly",
      paid: true,
      used: false,
      email: "buyer@example.com",
    });
    const { POST } = await import("@/app/api/premium/confirm/route");
    const response = await POST(post("/api/premium/confirm", { clientId: "client-1", nonce: "nonce-1" }));
    expect(response.status).toBe(200);
    expect(mocks.bindPremiumClient).toHaveBeenCalledWith("client-1", "buyer@example.com");
  });

  it("rejects arbitrary email recovery without an authenticated linked account", async () => {
    const { POST } = await import("@/app/api/premium/claim/route");
    const response = await POST(post("/api/premium/claim", {
      clientId: "client-1",
      email: "victim@example.com",
    }));
    expect(response.status).toBe(401);
    expect(mocks.bindPremiumClientForUser).not.toHaveBeenCalled();
  });

  it("stores authenticated account identity with a pending checkout", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue({ userId: "user-1", email: "buyer@example.com" });
    const { POST } = await import("@/app/api/premium/init-checkout/route");
    const response = await POST(post("/api/premium/init-checkout", { clientId: "client-1", plan: "yearly" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.email).toBe("buyer@example.com");
    expect(mocks.setCheckoutRecord).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        clientId: "client-1",
        plan: "yearly",
        paid: false,
        accountUserId: "user-1",
        accountEmail: "buyer@example.com",
      }),
    );
  });
});
