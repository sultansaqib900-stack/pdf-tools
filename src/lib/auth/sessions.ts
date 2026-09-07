import { kv } from "@/lib/kv";
import { randomBytes } from "crypto";
import { generateToken, hashPassword, isLegacyHash } from "@/lib/auth/crypto";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  premium: boolean;
}

const SESSION_PREFIX = "pdftools:session:";
const USER_PREFIX = "pdftools:user:";

export function userKey(email: string): string {
  return `${USER_PREFIX}${email.toLowerCase()}`;
}

export function sessionKey(token: string): string {
  return `${SESSION_PREFIX}${token}`;
}

export async function createUser(email: string, hash: string, salt: string): Promise<User | null> {
  const key = userKey(email);
  const existing = await kv.get(key);
  if (existing) return null;
  const user: User = {
    id: randomBytes(12).toString("hex"),
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    premium: false,
  };
  await kv.set(key, { ...user, hash, salt }, { ex: 365 * 24 * 60 * 60 });
  return user;
}

export async function getUserByEmail(email: string): Promise<(User & { hash: string; salt: string }) | null> {
  const data = await kv.get<User & { hash: string; salt: string }>(userKey(email));
  if (!data) return null;
  return data;
}

/**
 * Transparently re-hash a legacy SHA-256 password into scrypt after a
 * successful login. No-op when the stored hash is already scrypt.
 */
export async function upgradePasswordHash(email: string, password: string): Promise<void> {
  try {
    const key = userKey(email);
    const data = await kv.get<User & { hash: string; salt: string }>(key);
    if (!data || !isLegacyHash(data.hash)) return;
    const { hash, salt } = hashPassword(password);
    await kv.set(key, { ...data, hash, salt }, { ex: 365 * 24 * 60 * 60 });
  } catch {
    // Non-fatal: the user is already authenticated.
  }
}

export async function createSession(user: User): Promise<string> {
  const token = generateToken();
  await kv.set(sessionKey(token), { userId: user.id, email: user.email }, { ex: 7 * 24 * 60 * 60 });
  return token;
}

export async function getSession(token: string): Promise<{ userId: string; email: string } | null> {
  return kv.get(sessionKey(token));
}

export async function deleteSession(token: string): Promise<void> {
  await kv.del(sessionKey(token));
}

