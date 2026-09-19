import { kv } from "@/lib/kv";
import { STUDIO_TRIAL_DURATION_MS, type StudioTrialStatus } from "@/lib/studioTrial";

export function studioTrialKey(identity: string): string {
  return `pdftools:studio-trial:${identity}`;
}

// Keep the first activation permanently, not with a 72-hour TTL (which would
// allow restarting an expired trial). Link device/account to the earliest
// activation atomically, so signing in or concurrent tabs cannot extend it.
export const STUDIO_TRIAL_SCRIPT = `
local time = redis.call("TIME")
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local started = nil
for _, key in ipairs(KEYS) do
  local raw = redis.call("GET", key)
  if raw then
    local value = tonumber(raw)
    if not value or value <= 0 or value > now then return {-1, now} end
    if not started or value < started then started = value end
  end
end
if not started and ARGV[1] == "1" then started = now end
if not started then return {0, now} end
for _, key in ipairs(KEYS) do
  redis.call("SET", key, tostring(started))
end
return {started, now}
`;

export async function getStudioTrial(
  identity: string,
  clientId: string,
  start: boolean,
): Promise<StudioTrialStatus> {
  const [startedAt, now] = await kv.eval<[string], [number, number]>(STUDIO_TRIAL_SCRIPT,
    [...new Set([studioTrialKey(identity), studioTrialKey(`client:${clientId}`)])],
    [start ? "1" : "0"],
  );
  if (!Number.isFinite(now) || now <= 0 || !Number.isFinite(startedAt) || startedAt < 0 || startedAt > now) {
    throw new Error("Invalid Studio trial record");
  }
  if (startedAt === 0) return { status: "not_started", expiresAt: null, remainingMs: 0 };
  const expiresAt = startedAt + STUDIO_TRIAL_DURATION_MS;
  const remainingMs = Math.max(0, expiresAt - now);
  return { status: remainingMs > 0 ? "active" : "expired", expiresAt, remainingMs };
}
