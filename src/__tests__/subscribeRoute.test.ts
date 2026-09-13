import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  rateLimit,
  rateLimitResponse: vi.fn(),
}));

function subscribeRequest(email: unknown): NextRequest {
  return new NextRequest("https://example.com/api/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("BUTTONDOWN_API_KEY", "test-buttondown-key");
  rateLimit.mockReset();
  rateLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000 });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("newsletter subscription route", () => {
  it("fails visibly when Buttondown is not configured", async () => {
    vi.stubEnv("BUTTONDOWN_API_KEY", "");
    const providerFetch = vi.fn();
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/subscribe/route");

    const response = await POST(subscribeRequest("reader@example.com"));

    expect(response.status).toBe(503);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("rejects an invalid address before contacting Buttondown", async () => {
    const providerFetch = vi.fn();
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/subscribe/route");

    const response = await POST(subscribeRequest("not-an-email"));

    expect(response.status).toBe(400);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("rate-limits signups and sends credentials only in a header", async () => {
    const providerFetch = vi.fn(async (...requestArgs: Parameters<typeof fetch>) => {
      void requestArgs;
      return new Response(null, { status: 201 });
    });
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/subscribe/route");

    const request = subscribeRequest(" Reader@Example.com ");
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(rateLimit).toHaveBeenCalledWith(request, {
      limit: 5,
      window: 60 * 60,
      identifier: "newsletter-subscribe",
      failClosed: true,
    });
    expect(providerFetch).toHaveBeenCalledTimes(1);
    const [providerUrl, providerInit] = providerFetch.mock.calls[0];
    expect(providerUrl).toBe("https://api.buttondown.email/v1/subscribers");
    expect(String(providerUrl)).not.toContain("test-buttondown-key");
    expect(providerInit?.headers).toEqual(expect.objectContaining({
      Authorization: "Token test-buttondown-key",
      "X-Buttondown-Collision-Behavior": "add",
    }));
    expect(JSON.parse(String(providerInit?.body))).toEqual({
      email_address: "reader@example.com",
      tags: ["pdftools-website"],
    });
  });
});
