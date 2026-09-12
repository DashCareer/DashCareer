import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { getCurrentUser, signInPath } from "@/app/auth-session";
import { getMembership, listNotes, listProgress, listResources, listTasks, listVocabulary, membershipIsActive } from "@/db/queries";
import { getSubject, subjects, type Subject } from "@/lib/subjects";
import { examBoards, type ExamBoardId } from "@/lib/exam-boards";
import { SubjectWorkspace } from "@/components/subject-workspace";
import { PinSubjectButton } from "@/components/subject-browser";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return subjects.map((subject) => ({ slug: subject.slug })); }

function subjectForAccess(subject: Subject, isPro: boolean): Subject {
  if (isPro) return subject;
  return { ...subject, topics: subject.topics.map((topic, index) => index < 3 ? topic : { ...topic, summary: "", walkthrough: [], workedExample: "", realWorld: "", keyConcept: "", commonMistake: "", memoryBooster: "", examTechnique: "", modelAnswer: "", question: "", answer: "" }) };
}

export default async function SubjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ status?: string; board?: string; topic?: string }> }) {
  const [{ slug }, { status, board, topic }] = await Promise.all([params, searchParams]);
  const subject = getSubject(slug);
  if (!subject) notFound();
  const user = await getCurrentUser();
  const [progress, notes, tasks, vocabulary, resources, membership] = user ? await Promise.all([
    listProgress(user.userId).catch(() => []), listNotes(user.userId, slug).catch(() => []), listTasks(user.userId, slug).catch(() => []), listVocabulary(user.userId, slug).catch(() => []), listResources(user.userId, slug).catch(() => []), getMembership(user.userId).catch(() => null),
  ]) : [[], [], [], [], [], null];
  const completed = progress.filter((row) => row.subject_slug === slug).map((row) => row.topic_slug);
  const isPro = membershipIsActive(membership, user?.email, user?.isFounder);
  return (
    <main className={`shell page-space subject-page subject-world world-${subject.slug}`} style={{ "--subject-accent": subject.accent } as React.CSSProperties}>
      <Link href="/subjects" className="back-link"><ArrowLeft size={17} /> All subjects</Link>
      <header className="subject-hero upgraded"><div className="subject-atmosphere" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div><span className="subject-icon large">{subject.short}</span><div><p className="eyebrow">A-Level workspace</p><h1>{subject.name}</h1><p>Notes, resources, tasks and practice—organised into one subject home.</p><div className="board-row">{subject.boards.map((boardName) => <span key={boardName}>{boardName}</span>)}</div></div><div className="subject-hero-actions"><PinSubjectButton slug={subject.slug} /><span><Clock3 size={16} /> Study time tracks after each timer</span></div></header>
      <SubjectWorkspace subject={subjectForAccess(subject, isPro)} completed={completed} signedIn={Boolean(user)} isPro={isPro} signInPath={signInPath(`/subjects/${slug}`)} notes={notes} tasks={tasks} vocabulary={vocabulary} resources={resources} status={status} initialBoard={examBoards.some((item) => item.id === board) ? board as ExamBoardId : "aqa"} initialTopic={topic} />
    </main>
  );
}
