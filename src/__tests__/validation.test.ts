import { describe, it, expect } from "vitest";
import {
  validateString,
  validateNumber,
  validateEmail,
  validateUrl,
  validateArray,
  sanitizeHtml,
} from "@/lib/validation";

describe("validateString", () => {
  it("accepts valid strings", () => {
    expect(validateString("hello")).toBe("hello");
  });
  it("rejects non-strings", () => {
    expect(validateString(123)).toBeNull();
    expect(validateString(null)).toBeNull();
    expect(validateString(undefined)).toBeNull();
  });
  it("trims whitespace", () => {
    expect(validateString("  hello  ")).toBe("hello");
  });
  it("rejects strings exceeding maxLength", () => {
    expect(validateString("a".repeat(100), 10)).toBeNull();
  });
});

describe("validateNumber", () => {
  it("accepts valid numbers", () => {
    expect(validateNumber(42)).toBe(42);
  });
  it("rejects NaN", () => {
    expect(validateNumber(NaN)).toBeNull();
  });
  it("rejects values outside range", () => {
    expect(validateNumber(-1, 0)).toBeNull();
    expect(validateNumber(11, 0, 10)).toBeNull();
  });
  it("rejects non-numbers", () => {
    expect(validateNumber("abc")).toBeNull();
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe("user@example.com");
  });
  it("rejects invalid emails", () => {
    expect(validateEmail("not-an-email")).toBeNull();
    expect(validateEmail("")).toBeNull();
  });
});

describe("validateUrl", () => {
  it("accepts valid URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com");
  });
  it("rejects invalid URLs", () => {
    expect(validateUrl("not-a-url")).toBeNull();
  });
});

describe("validateArray", () => {
  it("accepts valid arrays", () => {
    expect(validateArray([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it("rejects non-arrays", () => {
    expect(validateArray("abc")).toBeNull();
  });
  it("rejects oversized arrays", () => {
    expect(validateArray([1, 2, 3], 2)).toBeNull();
  });
});

describe("sanitizeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });
  it("handles ampersands", () => {
    expect(sanitizeHtml("a & b")).toBe("a &amp; b");
  });
});
