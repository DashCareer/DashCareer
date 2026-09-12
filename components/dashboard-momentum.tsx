"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, BookOpenCheck, BrainCircuit, CalendarDays, CheckCircle2, Flame, GraduationCap, GripVertical, Sparkles, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { TaskRow } from "@/db/queries";
import { subjects } from "@/lib/subjects";
import { toggleTaskAction } from "@/app/actions";

type Recommended = { subjectSlug: string; subjectName: string; topicTitle: string; accent: string };
const GOAL_KEY = "dashcareer-daily-goal";
const ORDER_KEY = "dashcareer-planner-order";
function subscribePreference(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener("dashcareer-dashboard-preference", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("dashcareer-dashboard-preference", callback); }; }
function goalSnapshot() { return localStorage.getItem(GOAL_KEY) || "25"; }
function orderSnapshot() { return localStorage.getItem(ORDER_KEY) || "[]"; }
function savePreference(key: string, value: string) { localStorage.setItem(key, value); window.dispatchEvent(new Event("dashcareer-dashboard-preference")); }

export function DashboardMomentum({ todayMinutes, streak, points, level, levelProgress, recommendations }: { todayMinutes: number; streak: number; points: number; level: number; levelProgress: number; recommendations: Recommended[] }) {
  const storedGoal = Number(useSyncExternalStore(subscribePreference, goalSnapshot, () => "25"));
  const goal = [15, 25, 45, 60].includes(storedGoal) ? storedGoal : 25;
  function chooseGoal(value: number) { savePreference(GOAL_KEY, String(value)); }
  const goalProgress = Math.min(100, Math.round((todayMinutes / goal) * 100));

  return <section className="momentum-grid" aria-label="Study momentum">
    <article className="level-card" data-tilt><div className="level-orbit"><span>{level}</span></div><div><p><Sparkles size={15} /> Level {level}</p><h2>{points.toLocaleString()} XP</h2><Progress value={levelProgress} /><small>{500 - (points % 500)} XP to the next level</small></div></article>
    <article className="streak-card" data-heat={streak >= 14 ? "blazing" : streak >= 7 ? "hot" : streak >= 3 ? "warm" : "cool"}><span><Flame /></span><div><p>Revision streak</p><h2>{streak} {streak === 1 ? "day" : "days"}</h2><small>{streak ? `${streak >= 7 ? "Your flame is running hot" : "Keep your rhythm going"} — revise today to protect it.` : "Complete a focus session to light your flame."}</small></div></article>
    <article className="daily-goal-card"><div className="daily-goal-top"><span><Target size={18} /> Daily goal</span><b>{todayMinutes}/{goal} min</b></div><Progress value={goalProgress} /><div className="goal-options">{[15,25,45,60].map((value) => <button className={goal === value ? "active" : ""} onClick={() => chooseGoal(value)} key={value}>{value}m</button>)}</div>{goalProgress >= 100 && <p><CheckCircle2 size={15} /> Goal complete — strong work.</p>}</article>
    <article className="recommended-card"><div className="dashboard-card-head"><span><BookOpenCheck size={18} /> Recommended next</span><Link href="/subjects">All subjects <ArrowRight size={14} /></Link></div><div className="recommended-list">{recommendations.map((item) => <Link href={`/subjects/${item.subjectSlug}`} key={`${item.subjectSlug}:${item.topicTitle}`}><i style={{ background: item.accent }} /><span><b>{item.topicTitle}</b><small>{item.subjectName}</small></span><ArrowRight size={15} /></Link>)}</div></article>
    <article className="quick-launch-card"><p>Quick launch</p><div><Link href="/learning-hub"><GraduationCap /> Learning engine</Link><Link href="/subjects"><BookOpenCheck /> Revise</Link><Link href="/tutor"><BrainCircuit /> Ask DashAI</Link><Link href="/study-tools"><Target /> Focus timer</Link><Link href="/community"><CalendarDays /> Study room</Link></div></article>
  </section>;
}

export function DashboardPlanner({ tasks }: { tasks: TaskRow[] }) {
  const [dragged, setDragged] = useState<number | null>(null);
  const storedOrder = useSyncExternalStore(subscribePreference, orderSnapshot, () => "[]");
  const ordered = useMemo(() => {
    const ids = (() => { try { return JSON.parse(storedOrder) as number[]; } catch { return []; } })();
    return [...tasks].sort((a, b) => {
      const ai = ids.indexOf(a.id); const bi = ids.indexOf(b.id);
      return (ai < 0 ? 9999 : ai) - (bi < 0 ? 9999 : bi);
    });
  }, [storedOrder, tasks]);
  function moveBefore(target: number) {
    if (dragged === null || dragged === target) return;
    const moving = ordered.find((item) => item.id === dragged);
    if (!moving) return;
    const next = ordered.filter((item) => item.id !== dragged);
    next.splice(next.findIndex((item) => item.id === target), 0, moving);
    savePreference(ORDER_KEY, JSON.stringify(next.map((item) => item.id)));
    setDragged(null);
  }

  if (!tasks.length) return <div className="empty-state"><h3>No tasks planned yet.</h3><p>Add a deadline from inside any subject workspace.</p><Link href="/subjects">Open subjects</Link></div>;
  return <div className="task-list dashboard-tasks draggable-planner">{ordered.slice(0, 10).map((task) => <form action={toggleTaskAction} key={task.id} draggable onDragStart={() => setDragged(task.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveBefore(task.id)} className={dragged === task.id ? "dragging" : ""}><GripVertical className="drag-handle" size={18} aria-label="Drag to reorder" /><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="completed" value={task.completed ? "false" : "true"} /><button className={task.completed ? "task done" : "task"} type="submit"><span>{task.completed ? <CheckCircle2 size={17} /> : <CalendarDays size={17} />}</span><b>{task.title}</b><small>{subjects.find((item) => item.slug === task.subject_slug)?.name}</small><time>{task.due_date}</time></button></form>)}</div>;
}
