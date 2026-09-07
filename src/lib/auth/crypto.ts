import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

// scrypt parameters. N=16384 (2^14) is the OWASP-recommended minimum for
// interactive logins and keeps hashing at roughly ~50-100ms on Vercel.
const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LEN = 64;

/** Prefix marking a hash produced by the current (scrypt) scheme. */
const SCRYPT_PREFIX = "scrypt$";

function scryptHash(password: string, salt: string): string {
  const derived = scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
    // Node's default maxmem (32MB) is too low for N=16384 with r=8.
    maxmem: 128 * SCRYPT_N * SCRYPT_r * 2,
  });
  return `${SCRYPT_PREFIX}${derived.toString("hex")}`;
}

/**
 * Hash a password using scrypt (memory-hard KDF).
 *
 * Previous versions used a single unsalted-iteration SHA-256, which is a fast
 * hash and trivially brute-forceable. `verifyPassword` still accepts those
 * legacy hashes so existing users can log in, and reports when the stored hash
 * should be upgraded.
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || randomBytes(16).toString("hex");
  return { hash: scryptHash(password, s), salt: s };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when `hash` was produced by the old SHA-256 scheme and needs rehashing. */
export function isLegacyHash(hash: string): boolean {
  return !hash.startsWith(SCRYPT_PREFIX);
}

/**
 * Verify a password against a stored hash.
 *
 * Handles both the current scrypt format and the legacy SHA-256 format so that
 * accounts created before the upgrade keep working. Callers should check
 * `isLegacyHash` after a successful verification and transparently re-hash.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;

  if (isLegacyHash(hash)) {
    // Legacy: sha256(salt + password), hex encoded.
    const legacy = createHash("sha256").update(salt + password).digest("hex");
    return safeEqual(legacy, hash);
  }

  return safeEqual(scryptHash(password, salt), hash);
}

/** Cryptographically secure random token (256 bits, hex encoded). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
