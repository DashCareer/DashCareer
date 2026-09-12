"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Award, CalendarClock, Check, Flame, ListMusic, LockKeyhole, RotateCw, Sparkles } from "lucide-react";

type HeatmapSubject = { slug: string; name: string; accent: string; topics: Array<{ title: string; status: "mastered" | "review" | "unstarted" }> };
type Recommendation = { subjectSlug: string; subjectName: string; topicTitle: string; accent: string };

export function LearningInsights({ heatmaps, recommendations, activity, streak, quizAverage }: { heatmaps: HeatmapSubject[]; recommendations: Recommendation[]; activity: Array<{ day: string; minutes: number }>; streak: number; quizAverage: number }) {
  const [selected, setSelected] = useState(heatmaps.find((item) => item.topics.some((topic) => topic.status === "review"))?.slug ?? heatmaps[0]?.slug ?? "");
  const [examDate, setExamDate] = useState("");
  const [playlistSize, setPlaylistSize] = useState(4);
  const [version, setVersion] = useState(0);
  const current = heatmaps.find((item) => item.slug === selected) ?? heatmaps[0];
  const playlist = useMemo(() => {
    const available = [...recommendations];
    if (!available.length) return [];
    return Array.from({ length: Math.min(playlistSize, available.length) }, (_, index) => available[(index + version) % available.length]);
  }, [playlistSize, recommendations, version]);
  const today = new Date();
  const days = Array.from({ length: 56 }, (_, index) => { const date = new Date(today); date.setUTCDate(today.getUTCDate() - (55 - index)); return date.toISOString().slice(0, 10); });
  const minutesByDay = new Map(activity.map((item) => [item.day, item.minutes]));
  const completedCount = heatmaps.flatMap((item) => item.topics).filter((topic) => topic.status === "mastered").length;
  const issuesMastered = heatmaps.find((item) => item.slug === "psychology")?.topics.some((topic) => topic.title === "Issues and Debates" && topic.status === "mastered");
  const fullSubject = heatmaps.find((item) => item.topics.length > 0 && item.topics.every((topic) => topic.status === "mastered"));
  const badges = [
    { title: "Focused start", detail: "Master your first topic", unlocked: completedCount > 0 },
    { title: "Issues & Debates", detail: "Master the Psychology topic", unlocked: Boolean(issuesMastered) },
    { title: "Seven-day rhythm", detail: "Reach a 7-day study streak", unlocked: streak >= 7 },
    { title: fullSubject ? `${fullSubject.name} complete` : "Subject specialist", detail: "Complete one full subject map", unlocked: Boolean(fullSubject) },
  ];

  return <section className="learning-insights" aria-label="Learning insights">
    <article className="insight-panel activity-map"><div className="insight-head"><div><p className="eyebrow"><Flame size={14} /> Revision rhythm</p><h2>Eight-week activity</h2></div><span>{activity.reduce((sum, item) => sum + item.minutes, 0)} min</span></div><div className="calendar-heatmap" aria-label="Study minutes across the last 56 days">{days.map((day) => { const minutes = minutesByDay.get(day) ?? 0; const level = minutes === 0 ? 0 : minutes < 20 ? 1 : minutes < 40 ? 2 : 3; return <i key={day} data-level={level} title={`${day}: ${minutes} minutes`} />; })}</div><div className="heatmap-key"><span>Less</span>{[0,1,2,3].map((level) => <i data-level={level} key={level} />)}<span>More</span></div></article>
    <article className="insight-panel topic-heatmap"><div className="insight-head"><div><p className="eyebrow"><Sparkles size={14} /> Topic signals</p><h2>Revision heatmap</h2></div><select value={selected} onChange={(event) => setSelected(event.target.value)}>{heatmaps.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>{current && <><div className="topic-heat-grid" style={{ "--heat-accent": current.accent } as React.CSSProperties}>{current.topics.map((topic) => <i data-status={topic.status} key={topic.title} title={`${topic.title}: ${topic.status === "mastered" ? "Mastered" : topic.status === "review" ? "Needs review" : "Not started"}`} />)}</div><div className="topic-heat-key"><span><i data-status="mastered" /> Mastered</span><span><i data-status="review" /> Needs review</span><span><i data-status="unstarted" /> Not started</span></div><Link href={`/subjects/${current.slug}`}>Open {current.name}</Link></>}</article>
    <article className="insight-panel playlist-panel"><div className="insight-head"><div><p className="eyebrow"><ListMusic size={14} /> DashAI playlist</p><h2>Your next revision run</h2></div><button onClick={() => setVersion((value) => value + 1)} aria-label="Regenerate playlist"><RotateCw size={17} /></button></div><div className="playlist-controls"><label>Upcoming exam<input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} /></label><label>Topics<select value={playlistSize} onChange={(event) => setPlaylistSize(Number(event.target.value))}><option value={3}>3</option><option value={4}>4</option><option value={6}>6</option></select></label></div><ol>{playlist.map((item, index) => <li key={`${item.subjectSlug}:${item.topicTitle}`}><span>{String(index + 1).padStart(2, "0")}</span><i style={{ background: item.accent }} /><div><b>{item.topicTitle}</b><small>{item.subjectName}{examDate ? ` · prioritised for ${examDate}` : " · based on saved progress"}</small></div><Link href={`/subjects/${item.subjectSlug}`}>Start</Link></li>)}</ol></article>
    <article className="insight-panel achievements-panel"><div className="insight-head"><div><p className="eyebrow"><Award size={14} /> Milestones</p><h2>Quiet achievements</h2></div><span>{badges.filter((badge) => badge.unlocked).length}/{badges.length}</span></div><div className="achievement-list">{badges.map((badge) => <div className={badge.unlocked ? "unlocked" : "locked"} key={badge.title}><span>{badge.unlocked ? <Check size={17} /> : <LockKeyhole size={15} />}</span><div><b>{badge.title}</b><small>{badge.detail}</small></div></div>)}</div>{quizAverage > 0 && <p className="achievement-foot"><CalendarClock size={15} /> Current quiz average: {quizAverage}%</p>}</article>
  </section>;
}
