import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt$";
const SCRYPT_KEY_LENGTH = 64;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || randomBytes(16).toString("hex");
  const derived = scryptSync(password, s, SCRYPT_KEY_LENGTH).toString("hex");
  return { hash: `${SCRYPT_PREFIX}${derived}`, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (hash.startsWith(SCRYPT_PREFIX)) {
    const expected = hash.slice(SCRYPT_PREFIX.length);
    const actual = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
    return safeEqual(actual, expected);
  }

  // One-time compatibility for accounts created by the previous SHA-256
  // implementation. Login upgrades these records to scrypt immediately.
  const legacy = createHash("sha256").update(salt + password).digest("hex");
  return safeEqual(legacy, hash);
}

export function passwordHashNeedsUpgrade(hash: string): boolean {
  return !hash.startsWith(SCRYPT_PREFIX);
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}
