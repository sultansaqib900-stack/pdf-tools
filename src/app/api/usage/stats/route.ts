import { NextResponse } from "next/server";
import { getTotalProcessed } from "@/lib/kv";

export async function GET() {
  const total = await getTotalProcessed();
  return NextResponse.json({ total });
}
