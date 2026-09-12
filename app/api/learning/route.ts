import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth-session";
import { addErrorLog, recordTopicReview, resolveErrorLog, saveDiagnostic, saveQuizResult, trackUsageEvent } from "@/db/queries";
import { getSubject } from "@/lib/subjects";
import { examBoards } from "@/lib/exam-boards";

const text = (value: unknown, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const action = text(body.action, 40);
  const subject = text(body.subject, 80);
  const board = text(body.board, 20);
  if (action === "track") {
    await trackUsageEvent(user.userId, text(body.event, 60) || "page_view", text(body.path, 160) || "/");
    return NextResponse.json({ ok: true });
  }
  if (!getSubject(subject) || !examBoards.some((item) => item.id === board)) return NextResponse.json({ error: "Choose a valid subject and exam board." }, { status: 400 });
  if (action === "diagnostic") {
    const score = Math.max(0, Math.min(20, Number(body.score) || 0));
    const total = Math.max(1, Math.min(20, Number(body.total) || 1));
    const weakTopics = Array.isArray(body.weakTopics) ? body.weakTopics.map((item) => text(item, 100)).filter(Boolean).slice(0, 20) : [];
    await saveDiagnostic(user.userId, subject, board, score, total, weakTopics);
    await saveQuizResult(user.userId, subject, score, total);
    await trackUsageEvent(user.userId, "diagnostic_completed", `/learning-hub?subject=${subject}&board=${board}`);
    return NextResponse.json({ ok: true });
  }
  if (action === "review") {
    const outcome = text(body.outcome, 10);
    if (!(["again", "hard", "good", "easy"] as string[]).includes(outcome)) return NextResponse.json({ error: "Choose a review outcome." }, { status: 400 });
    await recordTopicReview(user.userId, subject, board, text(body.topic, 100), outcome as "again" | "hard" | "good" | "easy");
    return NextResponse.json({ ok: true });
  }
  if (action === "error") {
    await addErrorLog(user.userId, subject, board, text(body.topic, 100), text(body.question, 1200), text(body.correction, 2000), text(body.reason, 500) || "Needs another attempt");
    return NextResponse.json({ ok: true });
  }
  if (action === "resolve-error") {
    await resolveErrorLog(user.userId, Number(body.id));
    return NextResponse.json({ ok: true });
  }
  if (action === "exam-result") {
    const score = Math.max(0, Math.min(20, Number(body.score) || 0));
    const total = Math.max(1, Math.min(20, Number(body.total) || 1));
    await saveQuizResult(user.userId, subject, score, total);
    await trackUsageEvent(user.userId, "exam_completed", `/learning-hub?subject=${subject}&board=${board}`);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown learning action." }, { status: 400 });
}
