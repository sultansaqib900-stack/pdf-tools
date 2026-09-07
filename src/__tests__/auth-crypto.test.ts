import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { hashPassword, verifyPassword, generateToken, isLegacyHash } from "@/lib/auth/crypto";

describe("hashPassword", () => {
  it("produces a scrypt-prefixed hash with a random salt", () => {
    const { hash, salt } = hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(salt).toHaveLength(32);
    expect(isLegacyHash(hash)).toBe(false);
  });

  it("generates a different salt and hash each call", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });

  it("is deterministic for a fixed salt", () => {
    const { salt } = hashPassword("pw");
    expect(hashPassword("pw", salt).hash).toBe(hashPassword("pw", salt).hash);
  });

  it("does not store the plaintext password", () => {
    const { hash } = hashPassword("supersecret123");
    expect(hash).not.toContain("supersecret123");
  });
});

describe("verifyPassword", () => {
  it("accepts the correct password", () => {
    const { hash, salt } = hashPassword("hunter2!");
    expect(verifyPassword("hunter2!", hash, salt)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const { hash, salt } = hashPassword("hunter2!");
    expect(verifyPassword("hunter3!", hash, salt)).toBe(false);
  });

  it("rejects a wrong salt", () => {
    const { hash } = hashPassword("hunter2!");
    expect(verifyPassword("hunter2!", hash, "deadbeef")).toBe(false);
  });

  it("rejects empty hash or salt without throwing", () => {
    expect(verifyPassword("x", "", "")).toBe(false);
    expect(verifyPassword("x", "scrypt$abc", "")).toBe(false);
  });

  it("still verifies legacy sha256(salt + password) hashes", () => {
    const salt = "a".repeat(32);
    const legacy = createHash("sha256").update(salt + "oldpw").digest("hex");
    expect(isLegacyHash(legacy)).toBe(true);
    expect(verifyPassword("oldpw", legacy, salt)).toBe(true);
    expect(verifyPassword("wrong", legacy, salt)).toBe(false);
  });
});

describe("generateToken", () => {
  it("returns 64 hex chars (256 bits of entropy)", () => {
    const t = generateToken();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does not repeat across many calls", () => {
    const seen = new Set(Array.from({ length: 500 }, () => generateToken()));
    expect(seen.size).toBe(500);
  });
});
