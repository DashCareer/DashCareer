"use client";

import { FormEvent, useState } from "react";
import { BookOpenCheck, BrainCircuit, CalendarRange, Crosshair, Gauge, LoaderCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { subjects } from "@/lib/subjects";
import { examBoards, type ExamBoardId } from "@/lib/exam-boards";

type StudyMode = "explain" | "quiz" | "plan";
type Context = { subject: string; subjectName: string; board: ExamBoardId; boardName: string; topic: string | null; matchStatus: string; confidence: number; suggestions: string[]; specPoints: string[]; sourceUrl: string; pathwayStatus: string; contentStatus: string };
const modes = [
  { id: "explain" as const, label: "Explain", icon: BookOpenCheck, hint: "Understand a difficult idea" },
  { id: "quiz" as const, label: "Test me", icon: BrainCircuit, hint: "Create a retrieval check" },
  { id: "plan" as const, label: "Make a plan", icon: CalendarRange, hint: "Turn a topic into steps" },
];

function ConfidenceMeter({ context }: { context: Context }) {
  const tone = context.confidence >= 85 ? "high" : context.confidence >= 60 ? "medium" : "low";
  return <div className={`dashai-context ai-confidence ${tone}`}>
    <div className="ai-confidence-top"><span><Gauge size={17} /><b>Topic confidence</b></span><strong>{context.confidence}%</strong></div>
    <Progress value={context.confidence} />
    <div className="ai-context-grid"><span><small>Detected topic</small><b>{context.topic ?? "Not confidently matched"}</b></span><span><small>Exam board</small><b>{context.boardName}</b></span><span><small>Match type</small><b>{context.matchStatus}</b></span></div>
    {context.topic && <div className="ai-evidence"><div><b>Evidence used</b><small>{context.contentStatus}</small></div><ul>{context.specPoints.slice(0, 3).map((point) => <li key={point}>{point}</li>)}</ul><a href={context.sourceUrl} target="_blank" rel="noreferrer">Check the official {context.boardName} specification</a><span className={context.pathwayStatus === "board-mapped" ? "verified" : "pending"}>{context.pathwayStatus === "board-mapped" ? "Board-mapped pathway" : "Cross-board pathway · audit pending"}</span></div>}
    {!context.topic && <p>No guess made. DashAI stopped instead of mixing topics. Try one of: {context.suggestions.slice(0, 3).join(", ")}.</p>}
  </div>;
}

export function TutorLauncher() {
  const [subject, setSubject] = useState(subjects[0].slug);
  const [board, setBoard] = useState<ExamBoardId>("aqa");
  const [mode, setMode] = useState<StudyMode>("explain");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Choose a study mode, select your subject and tell DashAI what you need. Your response will appear here as a focused study card.");
  const [status, setStatus] = useState<"ready" | "thinking" | "error">("ready");
  const [engine, setEngine] = useState<"connected" | "study-core" | null>(null);
  const [context, setContext] = useState<Context | null>(null);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (question.trim().length < 8 || status === "thinking") return;
    setStatus("thinking");
    try {
      const response = await fetch("/api/dash-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, subject, board, mode }) });
      const data = await response.json() as { answer?: string; error?: string; engine?: "connected" | "study-core"; context?: Context };
      if (!response.ok || !data.answer) throw new Error(data.error || "DashAI could not prepare that response.");
      setAnswer(data.answer); setEngine(data.engine ?? "study-core"); setContext(data.context ?? null);
      if (data.context?.subject) setSubject(data.context.subject);
      if (data.context?.board) setBoard(data.context.board);
      setStatus("ready");
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "DashAI could not prepare that response. Please try again.");
      setStatus("error");
    }
  }

  const selected = subjects.find((item) => item.slug === subject) ?? subjects[0];
  const selectedBoard = examBoards.find((item) => item.id === board);
  return <div className="dashai-studio">
    <header className="dashai-head"><div className="dashai-identity"><span className="dashai-mark">D<span>AI</span></span><div><p className="eyebrow"><Sparkles size={14} /> DashCareer intelligence</p><h1>DashAI Study Studio</h1><p>A focused study coach grounded in the subject, board and topic you select.</p></div></div><span className="dashai-status"><i /> {status === "thinking" ? "Preparing" : "Ready"}</span></header>
    <div className="dashai-workspace">
      <form className="dashai-controls" onSubmit={ask}>
        <div><span className="field-label">1. Choose the kind of help</span><div className="dashai-modes">{modes.map(({ id, label, icon: Icon, hint }) => <button type="button" key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}><Icon size={20} /><span><b>{label}</b><small>{hint}</small></span></button>)}</div></div>
        <div className="dashai-select-grid"><label><span className="field-label">2. Select a subject</span><NativeSelect value={subject} onChange={(event) => { setSubject(event.target.value); setContext(null); }}>{subjects.map((item) => <NativeSelectOption value={item.slug} key={item.slug}>{item.name}</NativeSelectOption>)}</NativeSelect></label><label><span className="field-label">3. Select an exam board</span><NativeSelect value={board} onChange={(event) => { setBoard(event.target.value as ExamBoardId); setContext(null); }}>{examBoards.map((item) => <NativeSelectOption value={item.id} key={item.id}>{item.name}</NativeSelectOption>)}</NativeSelect></label></div>
        <label><span className="field-label">4. Name the exact topic and ask your question</span><Textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1500} placeholder="For example: Explain Issues and Debates in Psychology for AQA…" /></label>
        <div className="dashai-submit-row"><small>{question.length}/1500 · Don&apos;t include personal information.</small><button className="button primary" type="submit" disabled={question.trim().length < 8 || status === "thinking"}>{status === "thinking" ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />} Ask DashAI</button></div>
      </form>
      <section className="dashai-output" aria-live="polite"><div className="dashai-output-top"><span><BrainCircuit size={18} /> Grounded study card</span>{engine && <small>{engine === "connected" ? "DashAI advanced" : "DashAI study core"}</small>}</div>{context && <ConfidenceMeter context={context} />}<h2>{selected.name} · {selectedBoard?.name} · {modes.find((item) => item.id === mode)?.label}</h2><p>{answer}</p><div className="dashai-principles"><span><Crosshair size={15} /> Exact-topic matching</span><span><ShieldCheck size={15} /> Privacy-aware</span><span><BookOpenCheck size={15} /> Board context locked</span></div></section>
    </div>
    <footer className="dashai-foot"><ShieldCheck size={17} /><span><b>Designed for learning.</b> DashAI can make mistakes. Check important answers against your specification, textbook or teacher.</span></footer>
  </div>;
}
