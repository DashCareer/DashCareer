import type { Metadata } from "next";
import { SubjectBrowser } from "@/components/subject-browser";
import { SmartTopicFinder } from "@/components/smart-topic-finder";
import { subjects, totalTopics } from "@/lib/subjects";
import { examBoards } from "@/lib/exam-boards";
import { getCurrentUser } from "@/app/auth-session";
import { listProgress } from "@/db/queries";

export const metadata: Metadata = { title: "Subjects" };

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  const rows = user ? await listProgress(user.userId).catch(() => []) : [];
  const progress = Object.fromEntries(subjects.map((subject) => {
    const completed = new Set(rows.filter((row) => row.subject_slug === subject.slug).map((row) => row.topic_slug.split(":").at(-1)));
    return [subject.slug, Math.min(100, Math.round((completed.size / subject.topics.length) * 100))];
  }));
  return <main className="shell page-space subjects-page"><div className="subjects-hero"><div><p className="eyebrow">Explore your curriculum</p><h1>Every subject. One smarter study space.</h1><p>Search, filter and pin your subjects, then move from clear notes to focused practice without losing your place.</p></div><div className="subjects-hero-stats"><span><b>{subjects.length}</b> subjects</span><span><b>{examBoards.length}</b> exam boards</span><span><b>{totalTopics}</b> core topic hubs</span></div></div><SmartTopicFinder /><SubjectBrowser subjects={subjects} progress={progress} /></main>;
}
