"use client";

import { useMemo, useState, useTransition } from "react";
import { BookOpen, BrainCircuit, CalendarDays, Check, ChevronLeft, ChevronRight, Download, FileText, Link2, ListChecks, LockKeyhole, Network, Plus, RotateCw, Shuffle, Sparkles, Upload, Users, WandSparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "@/lib/subjects";
import type { NoteRow, ResourceRow, TaskRow, VocabularyRow } from "@/db/queries";
import { createNoteAction, createTaskAction, createVocabularyAction, saveQuizResultAction, toggleProgressAction, toggleTaskAction, uploadResourceAction } from "@/app/actions";
import { CurriculumExplorerV2 } from "@/components/curriculum-explorer-v2";
import { getBoardCurriculum } from "@/lib/board-curricula";
import { getExamBoard, type ExamBoardId } from "@/lib/exam-boards";

type Props = { subject: Subject; completed: string[]; signedIn: boolean; isPro: boolean; signInPath: string; notes: NoteRow[]; tasks: TaskRow[]; vocabulary: VocabularyRow[]; resources: ResourceRow[]; status?: string; initialBoard?: ExamBoardId; initialTopic?: string };

export function SubjectWorkspace({ subject, completed, signedIn, isPro, signInPath, notes, tasks, vocabulary, resources, status, initialBoard = "aqa", initialTopic }: Props) {
  const [flashcard, setFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confident, setConfident] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [activeTab, setActiveTab] = useState("course");
  const [boardId, setBoardId] = useState<ExamBoardId>(initialBoard);
  const [testSize, setTestSize] = useState(5);
  const [testDifficulty, setTestDifficulty] = useState("All");
  const [testVersion, setTestVersion] = useState(0);
  const [showMarks, setShowMarks] = useState(false);
  const [pending, startTransition] = useTransition();
  const complete = new Set(completed);
  const pathway = useMemo(() => getBoardCurriculum(subject, boardId), [boardId, subject]);
  const board = getExamBoard(boardId);
  const topicKey = (slug: string) => `${boardId}:${slug}`;
  const mastered = pathway.topics.filter((topic) => complete.has(topicKey(topic.slug)) || complete.has(topic.slug)).length;
  const progress = Math.round((mastered / pathway.topics.length) * 100);
  const studyTopics = useMemo(() => isPro ? pathway.topics : pathway.topics.slice(0, 3), [isPro, pathway.topics]);
  const quiz = useMemo(() => studyTopics.map((item, index) => ({ question: `Which topic matches this focus: “${item.summary}”`, answers: [item.title, ...studyTopics.filter((_, other) => other !== index).slice(0, 3).map((entry) => entry.title)], correct: item.title })).map((item, index) => ({ ...item, answers: [...item.answers].sort((a, b) => (a.length + index) - b.length) })), [studyTopics]);
  const current = quiz[quizIndex];
  const testPool = useMemo(() => studyTopics.filter((topic) => testDifficulty === "All" || topic.difficulty === testDifficulty), [studyTopics, testDifficulty]);
  const testQuestions = useMemo(() => {
    if (!testPool.length) return [];
    return Array.from({ length: Math.min(testSize, testPool.length) }, (_, index) => testPool[(index + testVersion) % testPool.length]);
  }, [testPool, testSize, testVersion]);

  function answerQuiz(answer: string) {
    if (answered) return;
    const nextScore = quizScore + (answer === current.correct ? 1 : 0);
    setQuizScore(nextScore); setSelectedAnswer(answer); setAnswered(true);
    if (quizIndex === quiz.length - 1 && signedIn) {
      const data = new FormData(); data.set("subject", subject.slug); data.set("score", String(nextScore)); data.set("total", String(quiz.length));
      startTransition(() => saveQuizResultAction(data));
    }
  }

  function nextQuiz() { setAnswered(false); setSelectedAnswer(null); setQuizIndex((value) => Math.min(quiz.length - 1, value + 1)); }
  function restartQuiz() { setAnswered(false); setSelectedAnswer(null); setQuizIndex(0); setQuizScore(0); }
  function selectBoard(value: ExamBoardId) { setBoardId(value); setFlashcard(0); setFlipped(false); setQuizIndex(0); setQuizScore(0); setAnswered(false); setSelectedAnswer(null); setConfident([]); setShowMarks(false); }
  function goToTab(value: string) { setActiveTab(value); window.setTimeout(() => document.querySelector(".subject-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }
  function makeSummary() {
    const source = notes.length ? notes.map((note) => note.body).join(" ") : studyTopics.map((item) => item.summary).join(" ");
    const sentences = source.match(/[^.!?]+[.!?]+/g) ?? [source];
    setSummary(sentences.slice(0, 4).join(" ").trim());
  }
  const message: Record<string, string> = { "note-saved": "Note saved.", "task-saved": "Task added to your revision planner.", "vocab-saved": "Vocabulary card saved.", "file-saved": "Private resource uploaded.", "file-invalid": "Choose a supported file under 8 MB.", "pro-required": "A current Pro membership is required for private uploads.", invalid: "Check the form and try again." };

  return (
    <>
      {status && message[status] && <div className={status.includes("invalid") || status === "pro-required" ? "notice error" : "notice success"}>{message[status]}</div>}
      <div className="subject-overview-strip"><div><span>{board.name} progress</span><strong>{progress}%</strong><Progress value={progress} /></div><div><span>Upcoming tasks</span><strong>{tasks.filter((task) => !task.completed).length}</strong><small>in your planner</small></div><div><span>Study resources</span><strong>{resources.length}</strong><small>private uploads</small></div><div><span>Mastered</span><strong>{mastered}</strong><small>of {pathway.topics.length} selected-board topics</small></div></div>
      <CurriculumExplorerV2 subject={subject} isPro={isPro} boardId={boardId} onBoardChange={selectBoard} initialTopic={initialTopic} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="subject-tabs">
        <TabsList className="subject-tabs-list" aria-label="Subject areas">
          <TabsTrigger value="course">00 Course Info</TabsTrigger><TabsTrigger value="resources">01 Sources</TabsTrigger><TabsTrigger value="notes">02 Notes</TabsTrigger><TabsTrigger value="assignments">03 Assignments</TabsTrigger><TabsTrigger value="practice">04 Practice</TabsTrigger><TabsTrigger value="review">05 Review</TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="subject-tab-panel">
          <div className="tool-grid two"><section className="tool-panel"><p className="tool-kicker"><BookOpen size={16} /> Overview</p><h2>{board.name} course information</h2><p>The selected pathway contains {pathway.topics.length} curriculum areas. Use the current official specification for your exact exam year and optional units.</p><div className="course-facts"><span><b>Selected board</b>{board.name}</span><span><b>Coverage</b>{pathway.status === "board-mapped" ? "Board-specific topic structure" : "Cross-board overview — audit pending"}</span><span><b>Study structure</b>Learn → practise → review</span></div></section><section className="tool-panel"><p className="tool-kicker"><ListChecks size={16} /> Quick links</p><h2>Next best actions</h2><div className="quick-links"><button type="button" onClick={() => goToTab("notes")}><FileText size={17} /> Write a smart note</button><button type="button" onClick={() => goToTab("practice")}><BrainCircuit size={17} /> Open flashcards and tests</button><button type="button" onClick={() => goToTab("assignments")}><CalendarDays size={17} /> Plan revision</button></div></section></div>
          <section className="tool-panel mind-map-panel"><div className="panel-heading"><div><p className="tool-kicker"><Network size={16} /> Mind map</p><h2>{subject.name} · {board.name}</h2></div></div><div className="mind-map"><strong>{subject.short}</strong>{pathway.topics.map((item) => <span key={item.slug}>{item.title}</span>)}</div></section>
        </TabsContent>

        <TabsContent value="resources" className="subject-tab-panel" id="resources">
          <div className="tool-grid two"><section className="tool-panel"><p className="tool-kicker"><Upload size={16} /> Documents · Pro</p><h2>Your private resources</h2>{signedIn && isPro ? <form action={uploadResourceAction} className="stack-form" encType="multipart/form-data"><input type="hidden" name="subject" value={subject.slug} /><label className="file-drop"><Upload size={22} /><b>Upload a PDF, note, slide deck or image</b><small>Private to your account · maximum 8 MB</small><input type="file" name="file" required accept=".pdf,.txt,.docx,.pptx,.png,.jpg,.jpeg" /></label><button className="button primary" type="submit">Upload resource</button></form> : signedIn ? <Upgrade /> : <SignIn path={signInPath} />}</section><section className="tool-panel"><p className="tool-kicker"><Download size={16} /> Saved</p><h2>Resource library</h2>{resources.length ? <div className="resource-list">{resources.map((resource) => <a href={`/api/resources/${resource.id}`} key={resource.id}><FileText size={18} /><span><b>{resource.file_name}</b><small>{Math.ceil(resource.size_bytes / 1024)} KB</small></span><Download size={16} /></a>)}</div> : <p className="muted">No private documents uploaded yet.</p>}</section></div>
          <section className="tool-panel"><p className="tool-kicker"><Link2 size={16} /> Official links</p><h2>Past-paper archives</h2><div className="paper-links"><a href="https://www.aqa.org.uk/find-past-papers-and-mark-schemes" target="_blank" rel="noreferrer">AQA</a><a href="https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html" target="_blank" rel="noreferrer">Edexcel</a><a href="https://www.ocr.org.uk/qualifications/past-paper-finder/" target="_blank" rel="noreferrer">OCR</a></div></section>
        </TabsContent>

        <TabsContent value="notes" className="subject-tab-panel" id="notes">
          <div className="tool-grid two"><section className="tool-panel"><p className="tool-kicker"><FileText size={16} /> Smart notes</p><h2>Write a revision note</h2>{signedIn ? <form action={createNoteAction} className="stack-form"><input type="hidden" name="subject" value={subject.slug} /><label>Topic<NativeSelect name="topic" required>{studyTopics.map((item) => <NativeSelectOption value={`${boardId}:${item.slug}`} key={item.slug}>{board.name} · {item.title}</NativeSelectOption>)}</NativeSelect></label><label>Title<input name="title" required maxLength={120} placeholder="e.g. Trigonometry identities" /></label><label>Note<Textarea name="body" required minLength={10} maxLength={6000} placeholder="Write the key idea in your own words…" /></label><label>Privacy<NativeSelect name="visibility" defaultValue="private"><NativeSelectOption value="private">Private — only me</NativeSelectOption><NativeSelectOption value="shared">Peer note — submit for sharing</NativeSelectOption></NativeSelect></label><button className="button primary" type="submit"><Plus size={17} /> Save note</button></form> : <SignIn path={signInPath} />}</section><section className="tool-panel"><div className="panel-heading"><div><p className="tool-kicker"><WandSparkles size={16} /> Summary</p><h2>Revision summary</h2></div><button className="button secondary small" onClick={makeSummary}><Sparkles size={16} /> Build summary</button></div>{summary ? <div className="smart-summary"><p>{summary}</p><small>Built from your saved notes and the selected {board.name} pathway.</small></div> : <p className="muted">Create a compact summary from your saved notes and selected course outline.</p>}<div className="note-list">{notes.map((note) => <article key={note.id}><div><b>{note.title}</b><span>{note.visibility === "shared" ? <><Users size={13} /> Peer note pending review</> : <><LockKeyhole size={13} /> Private</>}</span></div><p>{note.body}</p></article>)}</div></section></div>
        </TabsContent>

        <TabsContent value="assignments" className="subject-tab-panel" id="assignments">
          <div className="tool-grid two"><section className="tool-panel"><p className="tool-kicker"><CalendarDays size={16} /> Revision planner</p><h2>Add an assignment or task</h2>{signedIn ? <form action={createTaskAction} className="stack-form"><input type="hidden" name="subject" value={subject.slug} /><label>Task<input name="title" required maxLength={160} placeholder="Complete a timed practice set" /></label><label>Due date<input name="dueDate" type="date" required /></label><button className="button primary" type="submit"><Plus size={17} /> Add to planner</button></form> : <SignIn path={signInPath} />}</section><section className="tool-panel"><p className="tool-kicker"><ListChecks size={16} /> Tasks</p><h2>Upcoming work</h2>{tasks.length ? <div className="task-list">{tasks.map((task) => <form action={toggleTaskAction} key={task.id}><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="completed" value={task.completed ? "false" : "true"} /><button className={task.completed ? "task done" : "task"} type="submit"><span>{task.completed ? <Check size={17} /> : <CalendarDays size={17} />}</span><b>{task.title}</b><time>{task.due_date}</time></button></form>)}</div> : <p className="muted">No tasks planned for this subject yet.</p>}</section></div>
        </TabsContent>

        <TabsContent value="practice" className="subject-tab-panel" id="practice">
          <div className="tool-grid three"><section className="tool-panel flashcard-panel"><p className="tool-kicker"><RotateCw size={16} /> Flashcards</p><h2>{board.name} recall deck</h2><button className={flipped ? "flashcard flipped" : "flashcard"} aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}><span className="flashcard-inner"><span className="flashcard-face flashcard-front" aria-hidden={flipped}><small>Prompt</small><strong>{studyTopics[flashcard].title}</strong><i>Tap to reveal</i></span><span className="flashcard-face flashcard-back" aria-hidden={!flipped}><small>Answer</small><strong>{studyTopics[flashcard].summary}</strong><i>Tap to return</i></span></span></button><div className="card-nav"><button onClick={() => { setFlashcard((flashcard - 1 + studyTopics.length) % studyTopics.length); setFlipped(false); }} aria-label="Previous card"><ChevronLeft /></button><span>{flashcard + 1}/{studyTopics.length}</span><button onClick={() => { setFlashcard((flashcard + 1) % studyTopics.length); setFlipped(false); }} aria-label="Next card"><ChevronRight /></button><button onClick={() => { setFlashcard(Math.floor(Math.random() * studyTopics.length)); setFlipped(false); }} aria-label="Shuffle flashcards"><Shuffle size={16} /></button></div><button className={confident.includes(studyTopics[flashcard].slug) ? "confidence-button active" : "confidence-button"} onClick={() => setConfident((items) => items.includes(studyTopics[flashcard].slug) ? items.filter((slug) => slug !== studyTopics[flashcard].slug) : [...items, studyTopics[flashcard].slug])}><Check size={16} /> {confident.includes(studyTopics[flashcard].slug) ? "Marked confident" : "Mark confident"}</button></section><section className="tool-panel quiz-panel"><p className="tool-kicker"><BrainCircuit size={16} /> Practice quiz</p><h2>Quick check</h2><p>{current.question}</p><div className="quiz-options">{current.answers.map((answer) => <button key={answer} disabled={answered} className={answered ? answer === current.correct ? "correct" : answer === selectedAnswer ? "wrong" : "muted-answer" : ""} onClick={() => answerQuiz(answer)}>{answer}{answered && answer === current.correct && <Check size={16} />}</button>)}</div>{answered && <div className={selectedAnswer === current.correct ? "quiz-explanation success" : "quiz-explanation retry"}><b>{selectedAnswer === current.correct ? "Correct — nice retrieval." : `Not quite. The correct answer is ${current.correct}.`}</b><span>{studyTopics.find((topic) => topic.title === current.correct)?.keyConcept}</span></div>}{answered && <div className="quiz-feedback"><b>{quizIndex === quiz.length - 1 ? `Finished: ${quizScore}/${quiz.length}` : `Score: ${quizScore}/${quizIndex + 1}`}</b>{quizIndex < quiz.length - 1 ? <button onClick={nextQuiz}>Next question</button> : <button onClick={restartQuiz}>Try again</button>}</div>}<small>{pending ? "Saving result…" : signedIn ? "Results save to your dashboard." : "Sign in to save results."}</small></section><section className="tool-panel"><p className="tool-kicker"><BookOpen size={16} /> Vocabulary</p><h2>Build your glossary</h2>{signedIn ? <form action={createVocabularyAction} className="stack-form"><input type="hidden" name="subject" value={subject.slug} /><label>Term<input name="term" required maxLength={100} /></label><label>Definition<Textarea name="definition" required maxLength={500} /></label><button className="button primary" type="submit"><Plus size={17} /> Add term</button></form> : <SignIn path={signInPath} />}<div className="vocab-list">{vocabulary.slice(0, 6).map((item) => <details key={item.id}><summary>{item.term}</summary><p>{item.definition}</p></details>)}</div></section></div>
          <section className="tool-panel test-creator"><div className="panel-heading"><div><p className="tool-kicker"><ListChecks size={16} /> Test Creator</p><h2>Build a {board.name} practice test</h2></div><span>{testQuestions.length} questions</span></div><div className="test-controls"><label>Questions<select value={testSize} onChange={(event) => setTestSize(Number(event.target.value))}><option value={3}>3</option><option value={5}>5</option><option value={10}>10</option></select></label><label>Difficulty<select value={testDifficulty} onChange={(event) => setTestDifficulty(event.target.value)}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label><button className="button secondary" onClick={() => { setTestVersion((value) => value + 1); setShowMarks(false); }}><Shuffle size={17} /> Generate new test</button></div>{testQuestions.length ? <ol className="generated-test">{testQuestions.map((topic) => <li key={topic.slug}><b>{topic.title}</b><p>{topic.question}</p>{showMarks && <div className="mark-guidance"><strong>Mark guidance</strong><span>{topic.answer}</span></div>}</li>)}</ol> : <p className="empty-state">No available topics match that difficulty.</p>}<button className="button primary" onClick={() => setShowMarks((value) => !value)}>{showMarks ? "Hide mark guidance" : "Show mark guidance"}</button></section>
        </TabsContent>

        <TabsContent value="review" className="subject-tab-panel" id="review">
          <section className="tool-panel"><p className="tool-kicker"><ListChecks size={16} /> Revision checklist</p><h2>{board.name} mastery by topic</h2><div className="mastery-list">{pathway.topics.map((item) => { const key = topicKey(item.slug); const done = complete.has(key) || complete.has(item.slug); return <article key={item.slug}><span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span><div><b>{item.title}</b><small>{done ? "Mastered — revisit later" : "Needs review"}</small></div>{signedIn ? <form action={toggleProgressAction}><input type="hidden" name="subject" value={subject.slug} /><input type="hidden" name="topic" value={key} /><input type="hidden" name="completed" value={done ? "false" : "true"} /><button className={done ? "complete done" : "complete"} type="submit">{done ? <Check size={16} /> : <Plus size={16} />}{done ? "Mastered" : "Mark mastered"}</button></form> : <a className="complete" href={signInPath} target="_top">Sign in</a>}</article>; })}</div></section>
        </TabsContent>
      </Tabs>
    </>
  );
}

function SignIn({ path }: { path: string }) { return <div className="signin-panel"><p>Sign in to save this to your private study account.</p><a className="button primary" href={path} target="_top">Sign in to continue</a></div>; }
function Upgrade() { return <div className="signin-panel"><p>Private document uploads are included with Pro.</p><a className="button primary" href="/pricing">See Pro access</a></div>; }
