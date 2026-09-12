import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth-session";
import { heartbeatCommunityPresence, listActiveCommunityPresence } from "@/db/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ people: [] }, { status: 401 });
  const people = await listActiveCommunityPresence().catch(() => []);
  return NextResponse.json({ people });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: { room?: unknown } = {};
  try { body = await request.json(); } catch { /* An empty heartbeat is valid. */ }
  const room = typeof body.room === "string" && body.room.trim() ? body.room.trim() : null;
  await heartbeatCommunityPresence(user.userId, user.displayName, room);
  const people = await listActiveCommunityPresence();
  return NextResponse.json({ people });
}
