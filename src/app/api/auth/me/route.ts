import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/request";
import { getUserByEmail } from "@/lib/auth/sessions";
import { getPremiumStatusByUserId, grantConfiguredPremium, isAdminPremiumEmail } from "@/lib/kv";

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession(request);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user = await getUserByEmail(session.email);
    if (!user || user.id !== session.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    // Premium = paid entitlement linked to this account, or a server-side
    // owner grant configured through PREMIUM_ADMIN_EMAILS. The grant only
    // ever applies to the authenticated account with the matching email.
    const premium =
      (await grantConfiguredPremium(user.id, user.email))
      || isAdminPremiumEmail(user.email)
      || await getPremiumStatusByUserId(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
