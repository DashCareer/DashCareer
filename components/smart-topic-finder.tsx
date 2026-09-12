"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { subjects } from "@/lib/subjects";
import { examBoards, type ExamBoardId } from "@/lib/exam-boards";
import { getBoardCurriculum } from "@/lib/board-curricula";

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function SmartTopicFinder() {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<ExamBoardId | "all">("all");
  const index = useMemo(() => subjects.flatMap((subject) => examBoards
    .filter((item) => board === "all" || item.id === board)
    .flatMap((item) => getBoardCurriculum(subject, item.id).topics.map((topic) => ({
      subject, board: item, topic, search: normalise(`${subject.name} ${item.name} ${topic.title} ${topic.summary}`),
    })))), [board]);
  const terms = normalise(query).split(" ").filter(Boolean);
  const matches = useMemo(() => terms.length < 2 ? [] : index
    .map((item) => ({ item, score: terms.reduce((score, term) => score + (item.search.includes(term) ? 1 : 0), 0) + (item.topic.title.toLowerCase().startsWith(query.toLowerCase()) ? 3 : 0) }))
    .filter(({ score }) => score >= Math.min(2, terms.length))
    .sort((a, b) => b.score - a.score || a.item.topic.title.localeCompare(b.item.topic.title))
    .slice(0, 7), [index, query, terms]);

  return <section className="smart-topic-finder" aria-labelledby="smart-finder-title">
    <div className="smart-finder-copy"><span><Sparkles size={15} /> Predictive curriculum search</span><h2 id="smart-finder-title">Jump straight to the exact topic</h2><p>Type a concept, subject or specification heading. Results stay linked to the selected exam board.</p></div>
    <div className="smart-finder-controls">
      <label className="smart-finder-input"><Search size={20} /><span className="sr-only">Search all topics</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘Issues and Debates’ or ‘electric fields’" autoComplete="off" /></label>
      <label className="smart-finder-board"><span>Exam board</span><select value={board} onChange={(event) => setBoard(event.target.value as ExamBoardId | "all")}><option value="all">All boards</option>{examBoards.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    </div>
    {query.trim().length > 1 && <div className="smart-finder-results" role="listbox" aria-label="Topic suggestions">
      {matches.map(({ item }) => <Link role="option" key={`${item.subject.slug}:${item.board.id}:${item.topic.slug}`} href={`/subjects/${item.subject.slug}?board=${item.board.id}&topic=${item.topic.slug}#topic-${item.topic.slug}`}>
        <i style={{ background: item.subject.accent }}>{item.subject.short}</i><span><b>{item.topic.title}</b><small>{item.subject.name} · {item.board.name}</small></span><em>{item.topic.difficulty}</em><ArrowRight size={17} />
      </Link>)}
      {!matches.length && <p>No confident match yet. Add the subject or try the exact specification wording.</p>}
    </div>}
  </section>;
}
