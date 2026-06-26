import { createHash, randomBytes } from "crypto";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(s + password).digest("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt).hash === hash;
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
