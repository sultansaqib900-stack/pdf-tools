import { describe, it, expect } from "vitest";
import {
  isPremium,
  setPremium,
  getClientId,
  UNLIMITED_TOOLS,
  FREE_LIMITS,
  PREMIUM_LIMITS,
  getLimits,
  checkFileSize,
  checkBatchCount,
} from "@/lib/premium";

describe("getClientId", () => {
  it("returns a UUID string", () => {
    const id = getClientId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });
  it("returns the same ID on subsequent calls", () => {
    const id1 = getClientId();
    const id2 = getClientId();
    expect(id1).toBe(id2);
  });
});

describe("isPremium / setPremium", () => {
  it("returns false by default on server", () => {
    expect(isPremium()).toBe(false);
  });

  it("setPremium updates the module state", () => {
    setPremium(true);
    expect(isPremium()).toBe(true);
    setPremium(false);
    expect(isPremium()).toBe(false);
  });
});

describe("UNLIMITED_TOOLS", () => {
  it("includes compress, image-to-pdf, split, unlock (not merge)", () => {
    expect(UNLIMITED_TOOLS).toContain("compress");
    expect(UNLIMITED_TOOLS).not.toContain("merge");
    expect(UNLIMITED_TOOLS).toContain("image-to-pdf");
    expect(UNLIMITED_TOOLS).toContain("split");
    expect(UNLIMITED_TOOLS).toContain("unlock");
  });
});

describe("getLimits", () => {
  it("returns free limits by default (not premium)", () => {
    const limits = getLimits();
    expect(limits.maxFileSize).toBe(FREE_LIMITS.maxFileSize);
    expect(limits.maxDailyUses).toBe(FREE_LIMITS.maxDailyUses);
  });
});

describe("checkFileSize", () => {
  it("accepts files under free limit", () => {
    const result = checkFileSize(5 * 1024 * 1024);
    expect(result.ok).toBe(true);
  });
  it("rejects files over free limit", () => {
    const result = checkFileSize(50 * 1024 * 1024);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Free tier");
  });
});

describe("checkBatchCount", () => {
  it("rejects batch processing for free users", () => {
    const result = checkBatchCount(2);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Premium");
  });
  it("allows single file processing for free users", () => {
    const result = checkBatchCount(1);
    expect(result.ok).toBe(true);
  });
});
