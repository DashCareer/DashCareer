"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/auth-session";
import { createCheckoutSession, createNote, createResource, createTask, createVocabulary, getMembership, linkCheckoutAccount, logStudySession, membershipIsActive, saveQuizResult, setProgress, setTaskComplete, submitCommunityPost, submitReview } from "@/db/queries";
import { getSubject } from "@/lib/subjects";
import { getBoardCurriculum } from "@/lib/board-curricula";
import { examBoards, type ExamBoardId } from "@/lib/exam-boards";
import { createClient } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null, max: number) { return String(value ?? "").trim().slice(0, max); }
function validSubject(slug: string) { return Boolean(getSubject(slug)); }

export async function toggleProgressAction(formData: FormData) {
  const subjectSlug = String(formData.get("subject") ?? "");
  const topicSlug = String(formData.get("topic") ?? "");
  const completed = String(formData.get("completed")) === "true";
  const subject = getSubject(subjectSlug);
  if (!subject) return;
  const [possibleBoard, ...slugParts] = topicSlug.split(":");
  const board = examBoards.find((item) => item.id === possibleBoard);
  const plainSlug = board ? slugParts.join(":") : topicSlug;
  const validTopic = board ? getBoardCurriculum(subject, board.id as ExamBoardId).topics.some((item) => item.slug === plainSlug) : subject.topics.some((item) => item.slug === plainSlug);
  if (!validTopic) return;
  const user = await requireUser(`/subjects/${subjectSlug}`);
  await setProgress(user.userId, subjectSlug, topicSlug, completed);
  revalidatePath(`/subjects/${subjectSlug}`);
  revalidatePath("/dashboard");
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser("/reviews");
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || body.length < 20 || body.length > 600) redirect("/reviews?status=invalid");
  await submitReview(user.userId, user.displayName.split(" ")[0] || "Student", rating, body);
  redirect("/reviews?status=submitted");
}

export async function createNoteAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const topic = clean(formData.get("topic"), 100);
  const title = clean(formData.get("title"), 120);
  const body = clean(formData.get("body"), 6000);
  const visibility = formData.get("visibility") === "shared" ? "shared" : "private";
  if (!validSubject(subject) || !topic || title.length < 2 || body.length < 10) redirect(`/subjects/${subject}?status=invalid#notes`);
  const user = await requireUser(`/subjects/${subject}`);
  await createNote(user.userId, subject, topic, title, body, visibility);
  revalidatePath(`/subjects/${subject}`);
  redirect(`/subjects/${subject}?status=note-saved#notes`);
}

export async function createTaskAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const title = clean(formData.get("title"), 160);
  const dueDate = clean(formData.get("dueDate"), 10);
  if (!validSubject(subject) || title.length < 2 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) redirect(`/subjects/${subject}?status=invalid#assignments`);
  const user = await requireUser(`/subjects/${subject}`);
  await createTask(user.userId, subject, title, dueDate);
  revalidatePath(`/subjects/${subject}`); revalidatePath("/dashboard");
  redirect(`/subjects/${subject}?status=task-saved#assignments`);
}

export async function toggleTaskAction(formData: FormData) {
  const id = Number(formData.get("taskId"));
  const completed = formData.get("completed") === "true";
  if (!Number.isInteger(id) || id < 1) return;
  const user = await requireUser("/dashboard");
  await setTaskComplete(user.userId, id, completed);
  revalidatePath("/dashboard");
}

export async function createVocabularyAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const term = clean(formData.get("term"), 100);
  const definition = clean(formData.get("definition"), 500);
  if (!validSubject(subject) || term.length < 2 || definition.length < 3) redirect(`/subjects/${subject}?status=invalid#practice`);
  const user = await requireUser(`/subjects/${subject}`);
  await createVocabulary(user.userId, subject, term, definition);
  revalidatePath(`/subjects/${subject}`);
  redirect(`/subjects/${subject}?status=vocab-saved#practice`);
}

export async function uploadResourceAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const file = formData.get("file");
  if (!validSubject(subject) || !(file instanceof File) || file.size < 1 || file.size > 8_000_000) redirect(`/subjects/${subject}?status=file-invalid#resources`);
  const allowed = new Set(["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/jpeg"]);
  if (!allowed.has(file.type)) redirect(`/subjects/${subject}?status=file-invalid#resources`);
  const user = await requireUser(`/subjects/${subject}`);
  const membership = await getMembership(user.userId).catch(() => null);
  if (!membershipIsActive(membership, user.email)) redirect(`/subjects/${subject}?status=pro-required#resources`);
  const objectKey = `${user.userId}/${subject}/${crypto.randomUUID()}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from("study-resources").upload(objectKey, file, { contentType: file.type, upsert: false });
  if (uploadError) redirect(`/subjects/${subject}?status=file-invalid#resources`);
  try {
    await createResource(user.userId, subject, file.name.slice(0, 180), objectKey, file.type, file.size);
  } catch (error) {
    await supabase.storage.from("study-resources").remove([objectKey]);
    throw error;
  }
  revalidatePath(`/subjects/${subject}`);
  redirect(`/subjects/${subject}?status=file-saved#resources`);
}

export async function submitCommunityPostAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const kind = clean(formData.get("kind"), 20);
  const body = clean(formData.get("body"), 500);
  const blockedContact = /https?:\/\/|www\.|@[a-z0-9_.-]+|\b\d{7,}\b/i.test(body);
  if (!validSubject(subject) || !["peer-note", "discussion"].includes(kind) || body.length < 20 || blockedContact) redirect("/community?status=invalid");
  const user = await requireUser("/community");
  await submitCommunityPost(user.userId, user.displayName.split(" ")[0] || "Student", subject, kind, body);
  redirect("/community?status=submitted");
}

export async function logStudySessionAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const minutes = Number(formData.get("minutes"));
  if (!validSubject(subject) || ![15, 25, 45, 50].includes(minutes)) return;
  const user = await requireUser("/dashboard");
  await logStudySession(user.userId, subject, minutes);
  revalidatePath("/dashboard");
}

export async function saveQuizResultAction(formData: FormData) {
  const subject = clean(formData.get("subject"), 60);
  const score = Number(formData.get("score"));
  const total = Number(formData.get("total"));
  if (!validSubject(subject) || !Number.isInteger(score) || !Number.isInteger(total) || score < 0 || total < 1 || score > total) return;
  const user = await requireUser(`/subjects/${subject}`);
  await saveQuizResult(user.userId, subject, score, total);
  revalidatePath("/dashboard");
}

export async function startGumroadCheckoutAction(formData: FormData) {
  const plan = formData.get("plan") === "annual" ? "annual" : "monthly";
  const user = await requireUser("/pricing");
  const checkoutToken = crypto.randomUUID();
  await linkCheckoutAccount(user.userId, user.email);
  await createCheckoutSession(checkoutToken, user.userId, user.email, plan);
  const checkout = new URL(plan === "annual" ? "https://cagdasozturk.gumroad.com/l/atypnn" : "https://cagdasozturk.gumroad.com/l/irrlrl");
  checkout.searchParams.set("email", user.email);
  checkout.searchParams.set("dc_checkout", checkoutToken);
  redirect(checkout.toString());
}
