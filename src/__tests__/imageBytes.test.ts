import { describe, expect, it } from "vitest";
import { dataUrlToBytes } from "@/lib/imageBytes";

describe("dataUrlToBytes", () => {
  it("decodes base64 binary without making a network request", () => {
    expect([...dataUrlToBytes("data:image/png;base64,AAECA/8=")]).toEqual([0, 1, 2, 3, 255]);
  });

  it("decodes percent-encoded data", () => {
    expect(new TextDecoder().decode(dataUrlToBytes("data:text/plain,hello%20world"))).toBe("hello world");
  });

  it("rejects malformed input", () => {
    expect(() => dataUrlToBytes("https://example.com/image.png")).toThrow(/invalid image data url/i);
    expect(() => dataUrlToBytes("data:image/png;base64,%%%" )).toThrow(/invalid base64/i);
  });
});
