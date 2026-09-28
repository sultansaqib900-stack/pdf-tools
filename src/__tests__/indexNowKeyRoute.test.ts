import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/indexnow-key.txt/route";

describe("IndexNow verification file", () => {
  const originalKey = process.env.INDEXNOW_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.INDEXNOW_KEY;
    else process.env.INDEXNOW_KEY = originalKey;
  });

  it("returns 404 when no valid key is configured", async () => {
    delete process.env.INDEXNOW_KEY;

    const response = GET();

    expect(response.status).toBe(404);
    expect(await response.text()).toContain("Not found");
  });

  it("serves the configured key as a public plain-text verification file", async () => {
    process.env.INDEXNOW_KEY = "0123456789abcdef0123456789abcdef";

    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(await response.text()).toBe("0123456789abcdef0123456789abcdef\n");
  });

  it("does not publish malformed keys", async () => {
    process.env.INDEXNOW_KEY = "not a valid key";

    expect(GET().status).toBe(404);
  });
});
