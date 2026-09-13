import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import {
  generateToken,
  hashPassword,
  passwordHashNeedsUpgrade,
  verifyPassword,
} from "@/lib/auth/crypto";

describe("authentication cryptography", () => {
  it("stores new passwords with salted scrypt and verifies them", () => {
    const first = hashPassword("correct horse battery staple");
    const second = hashPassword("correct horse battery staple");

    expect(first.hash).toMatch(/^scrypt\$/);
    expect(first.hash).not.toBe(second.hash);
    expect(first.salt).not.toBe(second.salt);
    expect(verifyPassword("correct horse battery staple", first.hash, first.salt)).toBe(true);
    expect(verifyPassword("wrong password", first.hash, first.salt)).toBe(false);
    expect(passwordHashNeedsUpgrade(first.hash)).toBe(false);
  });

  it("accepts a legacy SHA-256 hash only so login can upgrade it", () => {
    const salt = "legacy-salt";
    const hash = createHash("sha256").update(`${salt}old-password`).digest("hex");
    expect(verifyPassword("old-password", hash, salt)).toBe(true);
    expect(verifyPassword("wrong", hash, salt)).toBe(false);
    expect(passwordHashNeedsUpgrade(hash)).toBe(true);
  });

  it("generates high-entropy URL-safe session tokens", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateToken()));
    expect(tokens.size).toBe(20);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});
