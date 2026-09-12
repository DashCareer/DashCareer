"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BrainCircuit, Check, CheckCircle2, ChevronRight, Clock3, GraduationCap, RotateCw, ShieldCheck, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { subjects } from "@/lib/subjects";
import { examBoards, type ExamBoardId } from "@/lib/exam-boards";
import { getBoardCurriculum } from "@/lib/board-curricula";
import type { DiagnosticRow, ErrorRow, MasteryRow } from "@/db/queries";

async function send(body: Record<string, unknown>) {
  const response = await fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error((await response.json() as { error?: string }).error || "Could not save that update.");
}

export function LearningHub({ mastery, errors, diagnostics, now }: { mastery: MasteryRow[]; errors: ErrorRow[]; diagnostics: DiagnosticRow[]; now: string }) {
  const router = useRouter();
  const [subjectSlug, setSubjectSlug] = useState("psychology");
  const [boardId, setBoardId] = useState<ExamBoardId>("aqa");
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<string[]>([]);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(30 * 60);
  const [selfMarks, setSelfMarks] = useState<boolean[]>([]);
  const [message, setMessage] = useState("");
  const subject = subjects.find((item) => item.slug === subjectSlug) ?? subjects[0];
  const pathway = useMemo(() => getBoardCurriculum(subject, boardId), [boardId, subject]);
  const diagnosticTopics = pathway.topics.slice(0, 8);
  const examTopics = pathway.topics.slice(0, 5);
  const due = mastery.filter((item) => item.next_review_at <= now).slice(0, 8);
  const currentQuestion = diagnosticTopics[diagnosticIndex];
  const diagnosticChoices = currentQuestion ? [currentQuestion, ...diagnosticTopics.filter((topic) => topic.slug !== currentQuestion.slug).slice(0, 3)].sort((a, b) => a.title.localeCompare(b.title)) : [];

  useEffect(() => {
    if (!examStarted || examSubmitted || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [examStarted, examSubmitted, remaining]);

  function resetForSelection(subjectValue = subjectSlug, boardValue = boardId) {
    setSubjectSlug(subjectValue); setBoardId(boardValue); setDiagnosticIndex(0); setDiagnosticAnswers([]); setDiagnosticDone(false); setExamStarted(false); setExamSubmitted(false); setRemaining(30 * 60); setSelfMarks([]); setMessage("");
  }
  async function answerDiagnostic(answer: string) {
    const next = [...diagnosticAnswers, answer];
    setDiagnosticAnswers(next);
    if (diagnosticIndex < diagnosticTopics.length - 1) { setDiagnosticIndex((value) => value + 1); return; }
    const score = diagnosticTopics.filter((topic, index) => next[index] === topic.slug).length;
    const weakTopics = diagnosticTopics.filter((topic, index) => next[index] !== topic.slug).map((topic) => topic.slug);
    try { await send({ action: "diagnostic", subject: subjectSlug, board: boardId, score, total: diagnosticTopics.length, weakTopics }); setDiagnosticDone(true); setMessage(`Diagnostic saved: ${score}/${diagnosticTopics.length}.`); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your diagnostic."); }
  }
  async function review(item: MasteryRow, outcome: "again" | "hard" | "good" | "easy") {
    try { await send({ action: "review", subject: item.subject_slug, board: item.board_id, topic: item.topic_slug, outcome }); setMessage("Review scheduled using spaced repetition."); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your review."); }
  }
  async function finishExam() {
    const score = selfMarks.filter(Boolean).length;
    try {
      await send({ action: "exam-result", subject: subjectSlug, board: boardId, score, total: examTopics.length });
      await Promise.all(examTopics.filter((_, index) => !selfMarks[index]).map((topic) => send({ action: "error", subject: subjectSlug, board: boardId, topic: topic.slug, question: topic.question, correction: topic.answer, reason: "Missed in timed practice" })));
      setMessage(`Exam result saved: ${score}/${examTopics.length}. Missed questions were added to your error log.`); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save the exam result."); }
  }

  const latest = diagnostics[0];
  return <div className="learning-hub">
    <section className="learning-hub-hero"><div><p className="eyebrow"><BrainCircuit size={14} /> Adaptive revision</p><h1>Your learning engine</h1><p>Diagnose gaps, schedule reviews and practise under timed conditions.</p></div><div className="learning-selector"><label>Subject<select value={subjectSlug} onChange={(event) => resetForSelection(event.target.value, boardId)}>{subjects.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label>Exam board<select value={boardId} onChange={(event) => resetForSelection(subjectSlug, event.target.value as ExamBoardId)}>{examBoards.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div></section>
    {message && <div className="notice success">{message}</div>}
    <section className="learning-summary-strip"><span><b>{due.length}</b> due reviews</span><span><b>{errors.filter((item) => !item.resolved).length}</b> open mistakes</span><span><b>{latest ? `${latest.score}/${latest.total}` : "—"}</b> latest diagnostic</span><span><b>{mastery.filter((item) => item.stage === "mastered").length}</b> mastered</span></section>
    <Tabs defaultValue="diagnostic" className="learning-tabs">
      <TabsList><TabsTrigger value="diagnostic">Diagnostic</TabsTrigger><TabsTrigger value="reviews">Review queue</TabsTrigger><TabsTrigger value="exam">Exam simulator</TabsTrigger><TabsTrigger value="errors">Error log</TabsTrigger></TabsList>
      <TabsContent value="diagnostic"><section className="learning-work-panel"><div className="panel-heading"><div><p className="tool-kicker"><Target size={16} /> Starting point</p><h2>{subject.name} diagnostic</h2></div><span>{boardId.toUpperCase()}</span></div>{diagnosticDone ? <div className="diagnostic-result"><CheckCircle2 /><h3>Your personalised queue is ready.</h3><p>Incorrect topics have been scheduled for review. Open the Review queue next.</p><button className="button secondary" onClick={() => resetForSelection()}>Take it again</button></div> : currentQuestion && <div className="diagnostic-question"><Progress value={(diagnosticIndex / diagnosticTopics.length) * 100} /><small>Question {diagnosticIndex + 1} of {diagnosticTopics.length}</small><h3>Which topic matches this explanation?</h3><p>{currentQuestion.summary}</p><div>{diagnosticChoices.map((choice) => <button onClick={() => void answerDiagnostic(choice.slug)} key={choice.slug}>{choice.title}<ChevronRight size={16} /></button>)}</div></div>}</section></TabsContent>
      <TabsContent value="reviews"><section className="learning-work-panel"><div className="panel-heading"><div><p className="tool-kicker"><RotateCw size={16} /> Spaced repetition</p><h2>Due for review</h2></div><span>{due.length} today</span></div>{due.length ? <div className="review-queue">{due.map((item) => { const itemSubject = subjects.find((entry) => entry.slug === item.subject_slug); const topic = itemSubject ? getBoardCurriculum(itemSubject, item.board_id as ExamBoardId).topics.find((entry) => entry.slug === item.topic_slug) : null; return <article key={item.id}><span className="review-stage">{item.stage.replace("_", " ")}</span><h3>{topic?.title ?? item.topic_slug.replace(/-/g, " ")}</h3><p>{topic?.summary ?? "Review this topic and test your recall."}</p><div><button onClick={() => void review(item, "again")}>Again · 1d</button><button onClick={() => void review(item, "hard")}>Hard · 2d</button><button onClick={() => void review(item, "good")}>Good</button><button onClick={() => void review(item, "easy")}>Easy</button></div></article>; })}</div> : <div className="diagnostic-result"><CheckCircle2 /><h3>You’re clear for today.</h3><p>Complete a diagnostic or practise a topic to build your review schedule.</p></div>}</section></TabsContent>
      <TabsContent value="exam"><section className="learning-work-panel exam-simulator"><div className="panel-heading"><div><p className="tool-kicker"><GraduationCap size={16} /> Original practice</p><h2>{subject.name} timed mini-paper</h2></div><span><Clock3 size={15} /> {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</span></div>{!examStarted ? <div className="exam-start"><ShieldCheck /><h3>Five original questions · 30 minutes</h3><p>Answers stay on this page until you submit. Official exam-board papers remain linked from each subject’s Resources area.</p><button className="button primary" onClick={() => setExamStarted(true)}>Start timed paper</button></div> : <ol className="exam-questions">{examTopics.map((topic, index) => <li key={topic.slug}><span>{index + 1}</span><div><h3>{topic.title}</h3><p>{topic.question}</p><textarea disabled={examSubmitted} placeholder="Write your answer here…" />{examSubmitted && <div className="exam-mark"><b>Mark guidance</b><p>{topic.answer}</p><label><input type="checkbox" checked={Boolean(selfMarks[index])} onChange={(event) => setSelfMarks((values) => { const next = [...values]; next[index] = event.target.checked; return next; })} /> My answer meets this guidance</label></div>}</div></li>)}</ol>}{examStarted && !examSubmitted && <button className="button primary" onClick={() => setExamSubmitted(true)}>Finish and mark</button>}{examSubmitted && <button className="button primary" onClick={() => void finishExam()}>Save result and mistakes</button>}</section></TabsContent>
      <TabsContent value="errors"><section className="learning-work-panel"><div className="panel-heading"><div><p className="tool-kicker"><AlertTriangle size={16} /> Repair gaps</p><h2>Revision error log</h2></div><span>{errors.filter((item) => !item.resolved).length} open</span></div>{errors.length ? <div className="error-log">{errors.map((item) => <article className={item.resolved ? "resolved" : ""} key={item.id}><div><span>{item.subject_slug.replace(/-/g, " ")} · {item.board_id.toUpperCase()}</span><b>{item.topic_slug.replace(/-/g, " ")}</b></div><p>{item.question}</p><details><summary>Show correction</summary><p>{item.correction}</p><small>{item.reason}</small></details>{!item.resolved && <button onClick={async () => { await send({ action: "resolve-error", subject: item.subject_slug, board: item.board_id, id: item.id }); router.refresh(); }}>Mark repaired <Check size={15} /></button>}</article>)}</div> : <div className="diagnostic-result"><CheckCircle2 /><h3>No saved mistakes yet.</h3><p>Missed timed-paper questions will appear here automatically.</p></div>}</section></TabsContent>
    </Tabs>
  </div>;
}
