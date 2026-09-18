import { beforeEach, describe, expect, it } from "vitest";
import {
  checkBatchCount,
  checkFileSize,
  FREE_LIMITS,
  getClientId,
  getLimits,
  getPremiumSnapshot,
  isPremium,
  PREMIUM_LIMITS,
  setPremium,
  UNLIMITED_TOOLS,
} from "@/lib/premium";

beforeEach(() => {
  setPremium(false);
  localStorage.clear();
});

describe("anonymous client identity", () => {
  it("creates and reuses a UUID without persisting entitlement proof", () => {
    const first = getClientId();
    const second = getClientId();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(Object.keys(localStorage)).toEqual(["pdftools_client_id"]);
  });

  it("does not trust a browser-set premium flag", () => {
    localStorage.setItem("pdftools_premium", "true");
    expect(isPremium()).toBe(false);
  });
});

describe("verified in-memory Premium snapshot", () => {
  it("fails closed until a trusted server response updates it", () => {
    setPremium(false, false);
    expect(getPremiumSnapshot()).toEqual({ premium: false, ready: false });
    expect(isPremium()).toBe(false);
  });

  it("reacts to a verified Premium result", () => {
    setPremium(true);
    expect(isPremium()).toBe(true);
    expect(getLimits()).toBe(PREMIUM_LIMITS);
  });
});

describe("tier limits", () => {
  it("uses consistent free limits with no artificial wait", () => {
    expect(UNLIMITED_TOOLS).toEqual([]);
    expect(getLimits()).toBe(FREE_LIMITS);
    expect(FREE_LIMITS.maxFileSize).toBe(10 * 1024 * 1024);
    expect(FREE_LIMITS.waitSeconds).toBe(0);
    // The free tier's file allowance is a LIFETIME shared trial, not per day.
    expect(FREE_LIMITS.trialFiles).toBe(5);
    expect(PREMIUM_LIMITS.maxFileSize).toBe(100 * 1024 * 1024);
    expect(PREMIUM_LIMITS.waitSeconds).toBe(0);
  });

  it("enforces file size against the active tier", () => {
    expect(checkFileSize(5 * 1024 * 1024).ok).toBe(true);
    const rejected = checkFileSize(50 * 1024 * 1024);
    expect(rejected.ok).toBe(false);
    expect(rejected.message).toContain("up to 10MB");

    setPremium(true);
    expect(checkFileSize(50 * 1024 * 1024).ok).toBe(true);
    expect(checkFileSize(101 * 1024 * 1024).ok).toBe(false);
  });

  it("reserves multi-file batch processing for Premium", () => {
    expect(checkBatchCount(1).ok).toBe(true);
    expect(checkBatchCount(2).ok).toBe(false);
    setPremium(true);
    expect(checkBatchCount(20).ok).toBe(true);
  });
});
