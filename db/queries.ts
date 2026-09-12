import { createClient } from "@/lib/supabase/server";

type DbError = { message: string } | null;
function value<T>(data: T | null, error: DbError): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export type ProgressRow = { subject_slug: string; topic_slug: string; completed: boolean };
export type ReviewRow = { id: number; display_name: string; rating: number; body: string; created_at: string };
export type NoteRow = { id: number; topic_slug: string; title: string; body: string; visibility: string; updated_at: string };
export type TaskRow = { id: number; subject_slug: string; title: string; due_date: string; completed: boolean };
export type VocabularyRow = { id: number; term: string; definition: string };
export type ResourceRow = { id: number; file_name: string; mime_type: string; size_bytes: number; created_at: string };
export type ResourceObjectRow = ResourceRow & { user_id: string; object_key: string };
export type CommunityRow = { id: number; display_name: string; subject_slug: string; kind: string; body: string; created_at: string };
export type PresenceRow = { display_name: string; room: string | null; last_seen_at: string };
export type StudyActivityRow = { day: string; minutes: number };
export type MembershipRow = { user_id: string; plan: string; status: string; product_permalink: string; purchase_id: string | null; expires_at: string | null; updated_at: string };
export type PaymentEventRow = { event_key: string; user_id: string | null; buyer_email: string; plan: string; event_name: string; purchase_id: string | null; status: string; received_at: string };
export type MasteryRow = { id: number; subject_slug: string; board_id: string; topic_slug: string; stage: string; confidence: number; correct_streak: number; next_review_at: string; last_reviewed_at: string };
export type ErrorRow = { id: number; subject_slug: string; board_id: string; topic_slug: string; question: string; correction: string; reason: string; retry_at: string; resolved: boolean; created_at: string };
export type DiagnosticRow = { id: number; subject_slug: string; board_id: string; score: number; total: number; weak_topics_json: string[]; created_at: string };

export async function listProgress(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("progress").select("subject_slug,topic_slug,completed").eq("user_id", userId).eq("completed", true);
  return value(data, error) as ProgressRow[];
}

export async function setProgress(userId: string, subjectSlug: string, topicSlug: string, completed: boolean) {
  const db = await createClient();
  const { error } = await db.from("progress").upsert({ user_id: userId, subject_slug: subjectSlug, topic_slug: topicSlug, completed, updated_at: new Date().toISOString() }, { onConflict: "user_id,subject_slug,topic_slug" });
  value(true, error);
}

export async function submitReview(userId: string, displayName: string, rating: number, body: string) {
  const db = await createClient();
  const { error } = await db.from("reviews").upsert({ user_id: userId, display_name: displayName, rating, body, status: "pending", created_at: new Date().toISOString() }, { onConflict: "user_id" });
  value(true, error);
}

export async function listApprovedReviews() {
  const db = await createClient();
  const { data, error } = await db.from("reviews").select("id,display_name,rating,body,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(12);
  return value(data, error) as ReviewRow[];
}

export async function listNotes(userId: string, subjectSlug: string) {
  const db = await createClient();
  const { data, error } = await db.from("notes").select("id,topic_slug,title,body,visibility,updated_at").eq("user_id", userId).eq("subject_slug", subjectSlug).order("updated_at", { ascending: false });
  return value(data, error) as NoteRow[];
}

export async function createNote(userId: string, subjectSlug: string, topicSlug: string, title: string, body: string, visibility: string) {
  const db = await createClient();
  const { error } = await db.from("notes").insert({ user_id: userId, subject_slug: subjectSlug, topic_slug: topicSlug, title, body, visibility, updated_at: new Date().toISOString() });
  value(true, error);
}

export async function listTasks(userId: string, subjectSlug?: string) {
  const db = await createClient();
  let query = db.from("tasks").select("id,subject_slug,title,due_date,completed").eq("user_id", userId).order("completed").order("due_date").limit(40);
  if (subjectSlug) query = query.eq("subject_slug", subjectSlug);
  const { data, error } = await query;
  return value(data, error) as TaskRow[];
}

export async function createTask(userId: string, subjectSlug: string, title: string, dueDate: string) {
  const db = await createClient();
  const { error } = await db.from("tasks").insert({ user_id: userId, subject_slug: subjectSlug, title, due_date: dueDate });
  value(true, error);
}

export async function setTaskComplete(userId: string, taskId: number, completed: boolean) {
  const db = await createClient();
  const { error } = await db.from("tasks").update({ completed }).eq("id", taskId).eq("user_id", userId);
  value(true, error);
}

export async function listVocabulary(userId: string, subjectSlug: string) {
  const db = await createClient();
  const { data, error } = await db.from("vocabulary").select("id,term,definition").eq("user_id", userId).eq("subject_slug", subjectSlug).order("id", { ascending: false });
  return value(data, error) as VocabularyRow[];
}

export async function createVocabulary(userId: string, subjectSlug: string, term: string, definition: string) {
  const db = await createClient();
  const { error } = await db.from("vocabulary").insert({ user_id: userId, subject_slug: subjectSlug, term, definition });
  value(true, error);
}

export async function createResource(userId: string, subjectSlug: string, fileName: string, objectKey: string, mimeType: string, sizeBytes: number) {
  const db = await createClient();
  const { error } = await db.from("resources").insert({ user_id: userId, subject_slug: subjectSlug, file_name: fileName, object_key: objectKey, mime_type: mimeType, size_bytes: sizeBytes });
  value(true, error);
}

export async function listResources(userId: string, subjectSlug: string) {
  const db = await createClient();
  const { data, error } = await db.from("resources").select("id,file_name,mime_type,size_bytes,created_at").eq("user_id", userId).eq("subject_slug", subjectSlug).order("created_at", { ascending: false });
  return value(data, error) as ResourceRow[];
}

export async function getResource(userId: string, id: number) {
  const db = await createClient();
  const { data, error } = await db.from("resources").select("id,user_id,file_name,object_key,mime_type,size_bytes,created_at").eq("id", id).eq("user_id", userId).maybeSingle();
  return value(data, error) as ResourceObjectRow | null;
}

export async function submitCommunityPost(userId: string, displayName: string, subjectSlug: string, kind: string, body: string) {
  const db = await createClient();
  const { error } = await db.from("community_posts").insert({ user_id: userId, display_name: displayName, subject_slug: subjectSlug, kind, body, status: "pending" });
  value(true, error);
}

export async function listApprovedCommunityPosts() {
  const db = await createClient();
  const { data, error } = await db.from("community_posts").select("id,display_name,subject_slug,kind,body,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(30);
  return value(data, error) as CommunityRow[];
}

export async function heartbeatCommunityPresence(userId: string, displayName: string, room: string | null) {
  const db = await createClient();
  const { error } = await db.from("community_presence").upsert({ user_id: userId, display_name: displayName.slice(0, 80), room: room?.slice(0, 80) ?? null, last_seen_at: new Date().toISOString() }, { onConflict: "user_id" });
  value(true, error);
}

export async function listActiveCommunityPresence() {
  const db = await createClient();
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  const { data, error } = await db.from("community_presence").select("display_name,room,last_seen_at").gte("last_seen_at", cutoff).order("last_seen_at", { ascending: false }).limit(24);
  return value(data, error) as PresenceRow[];
}

export async function logStudySession(userId: string, subjectSlug: string, minutes: number) {
  const db = await createClient();
  const { error } = await db.from("study_sessions").insert({ user_id: userId, subject_slug: subjectSlug, minutes });
  value(true, error);
}

export async function getStudyMinutes(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("study_sessions").select("minutes").eq("user_id", userId);
  return (value(data, error) as Array<{ minutes: number }>).reduce((sum, row) => sum + Number(row.minutes), 0);
}

export async function getStudyActivityDays(userId: string) {
  const db = await createClient();
  const cutoff = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const { data, error } = await db.from("study_sessions").select("minutes,created_at").eq("user_id", userId).gte("created_at", cutoff).order("created_at", { ascending: false });
  const days = new Map<string, number>();
  for (const row of value(data, error) as Array<{ minutes: number; created_at: string }>) {
    const day = row.created_at.slice(0, 10);
    days.set(day, (days.get(day) ?? 0) + Number(row.minutes));
  }
  return Array.from(days, ([day, minutes]) => ({ day, minutes })) as StudyActivityRow[];
}

export async function saveQuizResult(userId: string, subjectSlug: string, score: number, total: number) {
  const db = await createClient();
  const { error } = await db.from("quiz_results").insert({ user_id: userId, subject_slug: subjectSlug, score, total });
  value(true, error);
}

export async function getQuizAverage(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("quiz_results").select("score,total").eq("user_id", userId);
  const rows = value(data, error) as Array<{ score: number; total: number }>;
  return rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score / row.total * 100, 0) / rows.length) : 0;
}

export async function getMembership(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("memberships").select("user_id,plan,status,product_permalink,purchase_id,expires_at,updated_at").eq("user_id", userId).maybeSingle();
  return value(data, error) as MembershipRow | null;
}

export function membershipIsActive(membership: MembershipRow | null | undefined, email?: string | null, isFounder = false) {
  if (isFounder) return true;
  const owner = process.env.DASHCAREER_ADMIN_EMAIL?.trim().toLowerCase();
  if (owner && email?.trim().toLowerCase() === owner) return true;
  return Boolean(membership?.status === "active" && (!membership.expires_at || new Date(membership.expires_at).getTime() > Date.now()));
}

export async function linkCheckoutAccount(userId: string, email: string) {
  const db = await createClient();
  const normalised = email.trim().toLowerCase();
  const { error } = await db.from("checkout_accounts").upsert({ email: normalised, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "email" });
  value(true, error);
}

export async function createCheckoutSession(token: string, userId: string, email: string, plan: string) {
  const db = await createClient();
  const { error } = await db.from("checkout_sessions").insert({ token, user_id: userId, email: email.trim().toLowerCase(), plan, status: "pending" });
  value(true, error);
}

export async function findCheckoutSession(token: string) {
  const db = await createClient();
  const { data, error } = await db.from("checkout_sessions").select("token,user_id,email,plan,status").eq("token", token).maybeSingle();
  return value(data, error) as { token: string; user_id: string; email: string; plan: string; status: string } | null;
}

export async function findCheckoutUserByEmail(email: string) {
  const db = await createClient();
  const { data, error } = await db.from("checkout_accounts").select("user_id").eq("email", email.trim().toLowerCase()).maybeSingle();
  return value(data, error) as { user_id: string } | null;
}

export async function completeCheckoutSession(token: string) {
  const db = await createClient();
  const { error } = await db.from("checkout_sessions").update({ status: "completed", completed_at: new Date().toISOString() }).eq("token", token);
  value(true, error);
}

export async function saveMembership() { throw new Error("Membership writes are handled by the secured payment function."); }
export async function savePaymentEvent() { throw new Error("Payment event writes are handled by the secured payment function."); }
export async function listRecentPaymentEvents() { return [] as PaymentEventRow[]; }
export async function reconcileMembershipByEmail(userId: string, email: string) { await linkCheckoutAccount(userId, email); return getMembership(userId); }

export async function listTopicMastery(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("topic_mastery").select("id,subject_slug,board_id,topic_slug,stage,confidence,correct_streak,next_review_at,last_reviewed_at").eq("user_id", userId).order("next_review_at");
  return value(data, error) as MasteryRow[];
}

export async function recordTopicReview(userId: string, subjectSlug: string, boardId: string, topicSlug: string, outcome: "again" | "hard" | "good" | "easy") {
  const db = await createClient();
  const { data, error } = await db.from("topic_mastery").select("confidence,correct_streak").eq("user_id", userId).eq("subject_slug", subjectSlug).eq("board_id", boardId).eq("topic_slug", topicSlug).maybeSingle();
  value(data, error);
  const current = data as { confidence: number; correct_streak: number } | null;
  const delta = outcome === "again" ? -2 : outcome === "hard" ? 0 : outcome === "good" ? 1 : 2;
  const confidence = Math.max(1, Math.min(5, Number(current?.confidence ?? 1) + delta));
  const correctStreak = outcome === "again" ? 0 : Number(current?.correct_streak ?? 0) + 1;
  const days = outcome === "again" ? 1 : outcome === "hard" ? 2 : outcome === "good" ? Math.min(14, 2 ** Math.min(correctStreak, 4)) : Math.min(30, 3 ** Math.min(correctStreak, 3));
  const now = new Date(); const next = new Date(now); next.setUTCDate(next.getUTCDate() + days);
  const stage = confidence >= 5 ? "mastered" : confidence >= 4 ? "secure" : confidence >= 2 ? "learning" : "review_due";
  const result = await db.from("topic_mastery").upsert({ user_id: userId, subject_slug: subjectSlug, board_id: boardId, topic_slug: topicSlug, stage, confidence, correct_streak: correctStreak, next_review_at: next.toISOString(), last_reviewed_at: now.toISOString(), updated_at: now.toISOString() }, { onConflict: "user_id,subject_slug,board_id,topic_slug" });
  value(true, result.error);
}

export async function saveDiagnostic(userId: string, subjectSlug: string, boardId: string, score: number, total: number, weakTopics: string[]) {
  const db = await createClient();
  const now = new Date().toISOString();
  const diagnostic = await db.from("diagnostic_results").insert({ user_id: userId, subject_slug: subjectSlug, board_id: boardId, score, total, weak_topics_json: weakTopics });
  value(true, diagnostic.error);
  if (weakTopics.length) {
    const rows = weakTopics.slice(0, 20).map(topic_slug => ({ user_id: userId, subject_slug: subjectSlug, board_id: boardId, topic_slug, stage: "review_due", confidence: 1, correct_streak: 0, next_review_at: now, last_reviewed_at: now, updated_at: now }));
    const mastery = await db.from("topic_mastery").upsert(rows, { onConflict: "user_id,subject_slug,board_id,topic_slug" });
    value(true, mastery.error);
  }
}

export async function listDiagnostics(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("diagnostic_results").select("id,subject_slug,board_id,score,total,weak_topics_json,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(12);
  return value(data, error) as DiagnosticRow[];
}

export async function addErrorLog(userId: string, subjectSlug: string, boardId: string, topicSlug: string, question: string, correction: string, reason: string) {
  const db = await createClient();
  const retry = new Date(); retry.setUTCDate(retry.getUTCDate() + 2);
  const { error } = await db.from("error_log").insert({ user_id: userId, subject_slug: subjectSlug, board_id: boardId, topic_slug: topicSlug, question: question.slice(0, 1200), correction: correction.slice(0, 2000), reason: reason.slice(0, 500), retry_at: retry.toISOString() });
  value(true, error);
}

export async function listErrorLog(userId: string) {
  const db = await createClient();
  const { data, error } = await db.from("error_log").select("id,subject_slug,board_id,topic_slug,question,correction,reason,retry_at,resolved,created_at").eq("user_id", userId).order("resolved").order("retry_at").limit(80);
  return value(data, error) as ErrorRow[];
}

export async function resolveErrorLog(userId: string, id: number) {
  const db = await createClient();
  const { error } = await db.from("error_log").update({ resolved: true }).eq("id", id).eq("user_id", userId);
  value(true, error);
}

export async function trackUsageEvent(userId: string, eventName: string, path: string) {
  const db = await createClient();
  const { error } = await db.from("usage_events").insert({ user_id: userId, event_name: eventName.slice(0, 60), path: path.slice(0, 160) });
  value(true, error);
}

export async function getAdminMetrics() {
  const db = await createClient();
  const [diagnostics, errors, sessions] = await Promise.all([
    db.from("diagnostic_results").select("id", { count: "exact", head: true }),
    db.from("error_log").select("id", { count: "exact", head: true }).eq("resolved", false),
    db.from("study_sessions").select("id", { count: "exact", head: true }),
  ]);
  return { users: 0, diagnostics: diagnostics.count ?? 0, unresolvedErrors: errors.count ?? 0, sessions: sessions.count ?? 0, events: [] as Array<{ label: string; value: number }> };
}
