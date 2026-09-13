import { createHash } from "crypto";

/**
 * Return a stable, non-raw network identifier for abuse controls.
 * Vercel owns x-vercel-forwarded-for, so it takes precedence over forwarding
 * headers that an upstream proxy may rewrite. Fall back for local/non-Vercel
 * deployments, then hash the value before it is used in a Redis key.
 */
export function requestNetworkHash(request: Request): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    || request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "unknown";
  const firstHop = forwarded.split(",")[0]?.trim().slice(0, 256) || "unknown";
  return createHash("sha256").update(firstHop).digest("hex").slice(0, 32);
}
