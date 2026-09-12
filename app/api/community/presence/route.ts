import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth-session";
import { heartbeatCommunityPresence, listActiveCommunityPresence } from "@/db/queries";

export const maxDuration = 5;

const response = (body: object, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store, max-age=0" },
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return response({ people: [] }, 401);
  const people = await listActiveCommunityPresence().catch(() => []);
  return response({ people });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return response({ error: "Sign in required." }, 401);
  let body: { room?: unknown } = {};
  try { body = await request.json(); } catch { /* An empty heartbeat is valid. */ }
  const room = typeof body.room === "string" && body.room.trim() ? body.room.trim() : null;
  try {
    await heartbeatCommunityPresence(user.userId, user.displayName, room);
    const people = await listActiveCommunityPresence();
    return response({ people });
  } catch {
    return response({ people: [], temporarilyUnavailable: true }, 503);
  }
}
