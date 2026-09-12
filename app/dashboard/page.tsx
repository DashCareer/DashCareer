import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, BrainCircuit, CalendarDays, Clock3, Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/app/auth-session";
import { getQuizAverage, getStudyActivityDays, getStudyMinutes, listProgress, listTasks } from "@/db/queries";
import { subjects, totalTopics } from "@/lib/subjects";
import { StudyControls } from "@/components/study-controls";
import { DashboardMomentum, DashboardPlanner } from "@/components/dashboard-momentum";
import { LearningInsights } from "@/components/learning-insights";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Study dashboard", description: "Track your A-Level revision progress, study time and upcoming tasks.", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [progressResult, taskResult, minutesResult, quizResult, activityResult] = await Promise.allSettled([
    listProgress(user.userId), listTasks(user.userId), getStudyMinutes(user.userId), getQuizAverage(user.userId), getStudyActivityDays(user.userId),
  ]);
  const storageAvailable = progressResult.status === "fulfilled";
  const rows = progressResult.status === "fulfilled" ? progressResult.value : [];
  const tasks = taskResult.status === "fulfilled" ? taskResult.value : [];
  const studyMinutes = minutesResult.status === "fulfilled" ? minutesResult.value : 0;
  const quizAverage = quizResult.status === "fulfilled" ? quizResult.value : 0;
  const activity = activityResult.status === "fulfilled" ? activityResult.value : [];
  const completed = new Set(rows.map((row) => `${row.subject_slug}:${row.topic_slug}`));
  const active = subjects.map((subject) => ({ subject, count: rows.filter((row) => row.subject_slug === subject.slug).length })).filter((item) => item.count > 0);
  const points = completed.size * 40 + studyMinutes * 2;
  const level = Math.floor(points / 500) + 1;
  const levelProgress = Math.round(((points % 500) / 500) * 100);
  const dates = new Set(activity.map((row) => row.day));
  const day = (offset: number) => { const value = new Date(); value.setUTCDate(value.getUTCDate() - offset); return value.toISOString().slice(0, 10); };
  let streak = 0;
  let offset = dates.has(day(0)) ? 0 : 1;
  while (dates.has(day(offset))) { streak += 1; offset += 1; }
  const todayMinutes = activity.find((row) => row.day === day(0))?.minutes ?? 0;
  const rankedSubjects = [...subjects].sort((a, b) => rows.filter((row) => row.subject_slug === b.slug).length - rows.filter((row) => row.subject_slug === a.slug).length);
  const recommendations = rankedSubjects.slice(0, 4).map((subject) => ({ subjectSlug: subject.slug, subjectName: subject.name, accent: subject.accent, topicTitle: subject.topics.find((topic) => !rows.some((row) => row.subject_slug === subject.slug && (row.topic_slug === topic.slug || row.topic_slug.endsWith(`:${topic.slug}`))))?.title ?? subject.topics[0].title }));
  const heatmaps = subjects.map((subject) => {
    const subjectRows = rows.filter((row) => row.subject_slug === subject.slug);
    return { slug: subject.slug, name: subject.name, accent: subject.accent, topics: subject.topics.map((topic) => ({ title: topic.title, status: (subjectRows.some((row) => row.topic_slug === topic.slug || row.topic_slug.endsWith(`:${topic.slug}`)) ? "mastered" : subjectRows.length ? "review" : "unstarted") as "mastered" | "review" | "unstarted" })) };
  });
  return (
    <main className="shell page-space dashboard upgraded-dashboard">
      <header className="dashboard-head"><div><p className="eyebrow">My study desk</p><h1>Welcome back, {user.displayName.split(" ")[0]}.</h1><p>See what matters today, start a focus session and keep moving.</p></div><Link className="button primary" href="/subjects">Choose a subject <ArrowRight size={18} /></Link></header>
      {!storageAvailable && <div className="notice error">Saved study data is temporarily unavailable. Your learning content still works.</div>}
      <DashboardMomentum todayMinutes={todayMinutes} streak={streak} points={points} level={level} levelProgress={levelProgress} recommendations={recommendations} />
      <LearningInsights heatmaps={heatmaps} recommendations={recommendations} activity={activity} streak={streak} quizAverage={quizAverage} />
      <section className="stat-grid three dashboard-snapshot"><article><BookOpenCheck size={22} /><span>Topics mastered</span><strong>{completed.size}</strong><small>out of {totalTopics}</small></article><article><Clock3 size={22} /><span>Focused study</span><strong>{studyMinutes}</strong><small>minutes logged</small></article><article><BrainCircuit size={22} /><span>Quiz average</span><strong>{quizAverage}%</strong><small>across saved attempts</small></article></section>
      <div className="dashboard-workspace"><div className="dashboard-main"><section className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Revision planner</p><h2>Drag tasks into your order</h2></div><CalendarDays /></div><DashboardPlanner tasks={tasks} /></section><section className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Subject progress</p><h2>Your active subjects</h2></div><Target /></div>{active.length ? <div className="progress-list">{active.map(({ subject, count }) => { const value = Math.round((count / subject.topics.length) * 100); return <Link href={`/subjects/${subject.slug}`} key={subject.slug}><span className="subject-icon mini" style={{ "--subject-accent": subject.accent } as React.CSSProperties}>{subject.short}</span><div><strong>{subject.name}</strong><Progress value={value} /><small>{count} of {subject.topics.length} mastered</small></div><ArrowRight size={18} /></Link>; })}</div> : <div className="empty-state"><h3>Your first mastered topic will appear here.</h3><p>Open a subject and use its review checklist.</p><Link href="/subjects">Browse subjects</Link></div>}</section></div><aside className="dashboard-side"><StudyControls compact /><section className="control-card wellbeing-card"><Flame size={20} /><div><b>Work steadily, not endlessly.</b><p>DashCareer suggests a short screen break after two focus sessions. Your timer stays on this device; completed sessions are saved.</p></div></section></aside></div>
    </main>
  );
}
