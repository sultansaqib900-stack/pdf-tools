import { NextRequest, NextResponse } from "next/server";
import { getPremiumStatus } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ premium: false });
  }

  const premium = await getPremiumStatus(clientId);
  return NextResponse.json({ premium });
}
