import { getAuthenticatedSession } from "@/lib/auth/request";
import {
  bindPremiumClientForUser,
  getPremiumStatus,
  grantConfiguredPremium,
  isAdminPremiumEmail,
  trackChatUsage,
} from "@/lib/kv";
import { validateString } from "@/lib/validation";
import { requestNetworkHash } from "@/lib/requestIdentity";

export interface RequestEntitlement {
  premium: boolean;
  email?: string;
  userId?: string;
  clientId: string;
}

/** Resolve entitlement only from server-side KV records and authenticated sessions. */
export async function resolveRequestEntitlement(
  request: Request,
  rawClientId: unknown,
): Promise<RequestEntitlement | null> {
  const clientId = validateString(rawClientId, 100);
  if (!clientId) return null;

  const session = await getAuthenticatedSession(request);
  if (session) {
    // Persist a configured owner grant (PREMIUM_ADMIN_EMAILS) so device
    // binding and cross-device recovery observe the same entitlement, then
    // treat the account as Premium without bypassing authentication.
    const configuredGrant = await grantConfiguredPremium(session.userId, session.email);
    if (
      configuredGrant
      || isAdminPremiumEmail(session.email)
      || await bindPremiumClientForUser(session.userId, clientId)
    ) {
      return { premium: true, email: session.email, userId: session.userId, clientId };
    }
  }

  return {
    premium: await getPremiumStatus(clientId),
    email: session?.email,
    userId: session?.userId,
    clientId,
  };
}

/** Reserve free AI capacity before any billable provider request is created. */
export async function reserveAiAllowance(
  request: Request,
  entitlement: RequestEntitlement,
  kind: "chat" | "ocr" | "table" = "chat",
): Promise<{ ok: boolean; premium: boolean; remaining: number; storageError?: boolean }> {
  if (entitlement.premium) return { ok: true, premium: true, remaining: 999 };

  const primaryLimit = kind === "chat" ? 3 : 1;
  const identity = entitlement.userId ? `user:${entitlement.userId}` : `client:${entitlement.clientId}`;
  const primaryKey = kind === "chat" ? identity : `${kind}:${identity}`;
  const primary = await trackChatUsage(primaryKey, primaryLimit);
  if (!primary.ok) {
    return { ok: false, premium: false, remaining: 0, storageError: primary.storageError === true };
  }

  // Broader anonymous-network ceilings limit cost if client IDs are rotated.
  const networkLimit = kind === "chat" ? 12 : 4;
  const network = await trackChatUsage(`${kind}:network:${requestNetworkHash(request)}`, networkLimit);
  return {
    ok: network.ok,
    premium: false,
    remaining: network.ok ? primary.remaining : 0,
  };
}

export async function consumeAiAllowance(
  request: Request,
  rawClientId: unknown,
): Promise<{ ok: boolean; premium: boolean; remaining: number; storageError?: boolean } | null> {
  const entitlement = await resolveRequestEntitlement(request, rawClientId);
  if (!entitlement) return null;
  return reserveAiAllowance(request, entitlement);
}
