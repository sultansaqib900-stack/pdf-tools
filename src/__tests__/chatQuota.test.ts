import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const allowance = vi.hoisted(() => vi.fn());

vi.mock("@/lib/premiumServer", () => ({
  consumeAiAllowance: allowance,
  reserveAiAllowance: allowance,
  resolveRequestEntitlement: vi.fn(async () => ({ premium: false, clientId: "client-1" })),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: true, limit: 20, remaining: 19, reset: Date.now() + 60_000 })),
  rateLimitResponse: vi.fn(),
}));

function chatRequest(): NextRequest {
  return new NextRequest("https://example.com/api/chat-pdf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientId: "client-1",
      text: "A document about secure PDF processing.",
      question: "What is this document about?",
      mode: "qna",
    }),
  });
}

function tableRequest(pages = ["/9j/AAAA"]): NextRequest {
  return new NextRequest("https://example.com/api/extract-tables", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientId: "client-1",
      pages,
    }),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
  allowance.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("Chat PDF server-side AI reservation", () => {
  it("rejects an exhausted free allowance before calling Gemini", async () => {
    allowance.mockResolvedValue({ ok: false, premium: false, remaining: 0 });
    const providerFetch = vi.fn();
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/chat-pdf/route");

    const response = await POST(chatRequest());
    expect(response.status).toBe(429);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("calls Gemini only after a successful reservation", async () => {
    allowance.mockResolvedValue({ ok: true, premium: false, remaining: 2 });
    const providerFetch = vi.fn(async (...requestArgs: Parameters<typeof fetch>) => {
      void requestArgs;
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "It is about secure PDF processing." }] } }],
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/chat-pdf/route");

    const response = await POST(chatRequest());
    expect(response.status).toBe(200);
    expect(providerFetch).toHaveBeenCalledTimes(1);
    const [providerUrl, providerInit] = providerFetch.mock.calls[0];
    expect(String(providerUrl)).not.toContain("test-gemini-key");
    expect(providerInit?.headers).toEqual(expect.objectContaining({
      "x-goog-api-key": "test-gemini-key",
    }));
    expect(await response.json()).toEqual(expect.objectContaining({ ok: true, remaining: 2 }));
  });
});

describe("AI table-extraction server-side reservation", () => {
  it("rejects oversized page batches before quota or provider use", async () => {
    const providerFetch = vi.fn();
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/extract-tables/route");

    const response = await POST(tableRequest(Array.from({ length: 4 }, () => "/9j/AAAA")));
    expect(response.status).toBe(413);
    expect(allowance).not.toHaveBeenCalled();
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("rejects an exhausted table preview before calling Gemini", async () => {
    allowance.mockResolvedValue({ ok: false, premium: false, remaining: 0 });
    const providerFetch = vi.fn();
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/extract-tables/route");

    const response = await POST(tableRequest());
    expect(response.status).toBe(429);
    expect(allowance).toHaveBeenCalledWith(
      expect.any(NextRequest),
      expect.objectContaining({ premium: false, clientId: "client-1" }),
      "table",
    );
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("makes one credential-header request after reserving a table preview", async () => {
    allowance.mockResolvedValue({ ok: true, premium: false, remaining: 0 });
    const providerFetch = vi.fn(async (...requestArgs: Parameters<typeof fetch>) => {
      void requestArgs;
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "Name,Amount\nExample,10" }] } }],
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", providerFetch);
    const { POST } = await import("@/app/api/extract-tables/route");

    const response = await POST(tableRequest());
    expect(response.status).toBe(200);
    expect(providerFetch).toHaveBeenCalledTimes(1);
    const [providerUrl, providerInit] = providerFetch.mock.calls[0];
    expect(String(providerUrl)).not.toContain("test-gemini-key");
    expect(providerInit?.headers).toEqual(expect.objectContaining({
      "x-goog-api-key": "test-gemini-key",
    }));
    expect(await response.json()).toEqual(expect.objectContaining({
      ok: true,
      csv: "Name,Amount\nExample,10",
    }));
  });
});
