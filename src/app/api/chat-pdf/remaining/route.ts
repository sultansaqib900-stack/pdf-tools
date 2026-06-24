import { NextRequest, NextResponse } from "next/server";
import { getChatUsage } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ remaining: 0 });
  const usage = await getChatUsage(clientId);
  return NextResponse.json({ remaining: usage.remaining });
}
